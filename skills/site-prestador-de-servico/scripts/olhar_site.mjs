#!/usr/bin/env node
// Olha o site como o cliente olha: abre no Chrome em várias larguras, tira os prints e
// acusa o que o olho do dono acusaria. Não precisa instalar nada além do Node e do Chrome.
//
// Uso:
//   node scripts/olhar_site.mjs http://localhost:8000 _projeto/prints
//   node scripts/olhar_site.mjs http://localhost:8000 _projeto/prints --lighthouse
//
// Bloqueia (saída 1):
//   1. Rolagem para o lado em qualquer largura de 360 a 1440 px.
//   2. Botões grandes empilhados com larguras diferentes, ou botão grande que não ocupa a
//      largura da coluna no celular (o "desproporcional" que o dono viu na TXP).
//   3. Botão do topo do mesmo tamanho ou maior que o da capa, no celular.
//   4. Link ou botão com área de toque menor que 40 px no celular (32 px no topo fixo).
//   5. Botão do WhatsApp fora da primeira tela, ou coberto pelo botão flutuante.
//   6. Texto que continua invisível depois das animações (opacidade zero).
//   7. Imagem quebrada ou fonte que não carregou.
//   8. No computador (1280 e 1440 px): trecho contínuo de 240 px ou mais com conteúdo em
//      menos de 60% da largura da coluna, ou item sozinho numa linha de grade (o "espaço em
//      branco por falta de preenchimento" que o dono viu na TXP).
//   9. Animação ligada à rolagem (scroll()) presa numa caixa que não rola: o parallax não anda.
//  10. Com --lighthouse: nota abaixo de 95 em qualquer categoria, no celular ou no computador.
// Avisa: capa mais alta que a tela no computador, h1 grande demais no celular, palavra do
// título em outra cor (clichê).

import { spawn } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const args = process.argv.slice(2);
const url = args.find((a) => /^https?:\/\//.test(a));
const saida = args.find((a) => !a.startsWith("-") && a !== url) || "_projeto/prints";
const comLighthouse = args.includes("--lighthouse");
if (!url) {
  console.error("Uso: node olhar_site.mjs http://localhost:8000 _projeto/prints [--lighthouse]");
  process.exit(2);
}
mkdirSync(saida, { recursive: true });

const LARGURAS = [360, 390, 768, 1280, 1440];
const CHROMES = [
  process.env.CHROME_PATH,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/usr/bin/google-chrome", "/usr/bin/google-chrome-stable", "/usr/bin/chromium", "/usr/bin/chromium-browser",
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
].filter(Boolean);
const chromePath = CHROMES.find((c) => existsSync(c));
if (!chromePath) {
  console.error("Não achei o Chrome. Instale o Google Chrome ou passe CHROME_PATH=/caminho/do/chrome.");
  process.exit(2);
}

const espera = (ms) => new Promise((r) => setTimeout(r, ms));

async function abreChrome() {
  const perfil = mkdtempSync(join(tmpdir(), "olhar-site-"));
  const proc = spawn(chromePath, ["--headless=new", "--remote-debugging-port=0", "--no-first-run",
    "--no-default-browser-check", "--hide-scrollbars", `--user-data-dir=${perfil}`, "about:blank"],
    { stdio: ["ignore", "ignore", "pipe"] });
  const ws = await new Promise((resolve, reject) => {
    let buf = "";
    const t = setTimeout(() => reject(new Error("O Chrome não abriu em 15 s")), 15000);
    proc.stderr.on("data", (d) => {
      buf += d;
      const m = buf.match(/DevTools listening on (ws:\/\/\S+)/);
      if (m) { clearTimeout(t); resolve(m[1]); }
    });
  });
  const porta = new URL(ws).port;
  const alvos = await (await fetch(`http://127.0.0.1:${porta}/json/list`)).json();
  const pagina = alvos.find((a) => a.type === "page");
  return { proc, perfil, wsUrl: pagina.webSocketDebuggerUrl };
}

function conecta(wsUrl) {
  const sock = new WebSocket(wsUrl);
  let id = 0;
  const pendentes = new Map();
  const ouvintes = [];
  sock.onmessage = (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pendentes.has(msg.id)) {
      const { resolve, reject } = pendentes.get(msg.id);
      pendentes.delete(msg.id);
      msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result);
    } else if (msg.method) {
      ouvintes.filter((o) => o.metodo === msg.method).forEach((o) => o.fn(msg.params));
    }
  };
  const pronto = new Promise((r) => (sock.onopen = r));
  return {
    pronto,
    manda: (method, params = {}) => new Promise((resolve, reject) => {
      const n = ++id;
      pendentes.set(n, { resolve, reject });
      sock.send(JSON.stringify({ id: n, method, params }));
    }),
    uma: (metodo) => new Promise((r) => ouvintes.push({ metodo, fn: r })),
    fecha: () => sock.close(),
  };
}

// Roda dentro da página. Devolve os achados de uma largura.
function examina(movel) {
  const vw = document.documentElement.clientWidth;
  const vh = window.innerHeight;
  const erros = [];
  const avisos = [];
  const nome = (el) => {
    const t = (el.innerText || el.getAttribute("alt") || el.getAttribute("aria-label") || "").trim().replace(/\s+/g, " ");
    const cls = el.className && typeof el.className === "string" ? "." + el.className.trim().split(/\s+/).join(".") : "";
    return `<${el.tagName.toLowerCase()}${cls}>${t ? ` "${t.slice(0, 40)}"` : ""}`;
  };
  const visivel = (el) => {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && cs.visibility !== "hidden" && cs.display !== "none";
  };
  const recortado = (el) => {
    for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
      const o = getComputedStyle(p);
      if (/(hidden|clip)/.test(o.overflowX + o.overflow)) return true;
    }
    return false;
  };

  // 1. Rolagem para o lado
  const larguraTotal = document.documentElement.scrollWidth;
  if (larguraTotal > vw + 1) {
    const culpados = [...document.body.querySelectorAll("*")]
      .filter((el) => visivel(el) && el.getBoundingClientRect().right > vw + 1 && !recortado(el))
      .slice(0, 4).map((el) => `${nome(el)} vai até ${Math.round(el.getBoundingClientRect().right)} px`);
    erros.push(`rolagem para o lado: a página tem ${larguraTotal} px numa tela de ${vw} px (${culpados.join("; ") || "culpado escondido"})`);
  }

  // 2. Botões grandes: o que parece botão (fundo ou contorno, 40 px ou mais de altura)
  const pareceBotao = (el) => {
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    const fundo = cs.backgroundColor !== "rgba(0, 0, 0, 0)" && cs.backgroundColor !== "transparent";
    const contorno = cs.boxShadow !== "none" || parseFloat(cs.borderTopWidth) > 0;
    // Botão redondo só de ícone (pausar o vídeo, fechar) não é botão de texto: fica de fora
    const icone = r.width < 64 && Math.abs(r.width - r.height) < 8;
    return visivel(el) && r.height >= 40 && (fundo || contorno) && !icone && !["fixed", "sticky", "absolute"].includes(cs.position);
  };
  const topo = document.querySelector("body > header, .topo, header");
  const noTopo = (el) => topo && topo.contains(el);
  const botoes = [...document.querySelectorAll("main a, main button, body > section a, body > section button")]
    .filter((el) => pareceBotao(el) && !noTopo(el));
  const grupos = new Map();
  botoes.forEach((b) => {
    const g = grupos.get(b.parentElement) || [];
    g.push(b);
    grupos.set(b.parentElement, g);
  });
  if (movel) {
    grupos.forEach((g, pai) => {
      const cs = getComputedStyle(pai);
      const util = pai.getBoundingClientRect().width - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      const larguras = g.map((b) => Math.round(b.getBoundingClientRect().width));
      if (g.length > 1 && Math.max(...larguras) - Math.min(...larguras) > 2) {
        erros.push(`botões com larguras diferentes (${larguras.join(" e ")} px): ${g.map(nome).join(", ")}. No celular, botões do mesmo grupo têm a mesma largura`);
      }
      g.forEach((b) => {
        const w = b.getBoundingClientRect().width;
        if (w < util * 0.85) erros.push(`botão estreito no celular (${Math.round(w)} de ${Math.round(util)} px): ${nome(b)}. Ocupe a largura toda da coluna`);
      });
    });
  }

  // 3. Botão do topo menor que o da capa
  if (movel && topo) {
    const doTopo = [...topo.querySelectorAll("a, button")].filter((el) => {
      const cs = getComputedStyle(el);
      return visivel(el) && cs.backgroundColor !== "rgba(0, 0, 0, 0)" && cs.backgroundColor !== "transparent";
    });
    const capaBotao = botoes[0];
    doTopo.forEach((b) => {
      const h = b.getBoundingClientRect().height;
      if (capaBotao && h >= capaBotao.getBoundingClientRect().height - 4) {
        erros.push(`botão do topo (${Math.round(h)} px de altura) do tamanho do botão da capa: ${nome(b)}. No celular, o do topo fica discreto (34 a 38 px)`);
      }
    });
  }

  // 4. Área de toque
  if (movel) {
    const pequenos = [...document.querySelectorAll("a[href], button, summary, [role=button], input, select, textarea")]
      .filter(visivel)
      .filter((el) => {
        // No topo fixo, o botão fica discreto: 32 px bastam. No resto da página, 40.
        const minimo = noTopo(el) ? 32 : 40;
        const r = el.getBoundingClientRect();
        return r.height < minimo || r.width < minimo;
      });
    if (pequenos.length) {
      erros.push(`${pequenos.length} alvo(s) de toque menor(es) que 40 px: ${pequenos.slice(0, 6).map((el) => {
        const r = el.getBoundingClientRect();
        return `${nome(el)} ${Math.round(r.width)}x${Math.round(r.height)}`;
      }).join("; ")}. Dê padding ao link (inline-block, padding 12px 4px)`);
    }
  }

  // 5. WhatsApp na primeira tela (fora o botão flutuante e o do topo)
  const zap = [...document.querySelectorAll("a[href*='wa.me'], a[href*='api.whatsapp.com']")]
    .filter((el) => visivel(el) && !noTopo(el) && getComputedStyle(el).position !== "fixed");
  if (zap.length && zap[0].getBoundingClientRect().bottom > vh + window.scrollY) {
    erros.push(`o primeiro botão do WhatsApp termina em ${Math.round(zap[0].getBoundingClientRect().bottom)} px, abaixo da primeira tela (${vh} px)`);
  }
  // Botão flutuante em cima de outro botão na primeira tela
  const flutuantes = [...document.querySelectorAll("body *")].filter((el) => {
    const cs = getComputedStyle(el);
    return cs.position === "fixed" && !noTopo(el) && el !== topo && visivel(el) && parseFloat(cs.opacity) > 0.05 &&
      cs.pointerEvents !== "none" && el.getBoundingClientRect().top > 100;
  });
  flutuantes.forEach((f) => {
    const a = f.getBoundingClientRect();
    botoes.forEach((b) => {
      const c = b.getBoundingClientRect();
      if (c.top < vh && a.left < c.right && a.right > c.left && a.top < c.bottom && a.bottom > c.top) {
        erros.push(`${nome(f)} flutuante cobre ${nome(b)} na primeira tela. Mostre o flutuante só depois que a capa sair da tela`);
      }
    });
  });

  // 6. Texto invisível depois das animações
  const sumidos = [...document.querySelectorAll("main *, body > section *")]
    .filter((el) => el.children.length === 0 && (el.textContent || "").trim().length > 2 || el.tagName === "IMG")
    .filter((el) => {
      let o = 1;
      for (let p = el; p && p !== document.body; p = p.parentElement) o *= parseFloat(getComputedStyle(p).opacity);
      return o < 0.05 && el.getBoundingClientRect().height > 0;
    });
  if (sumidos.length) erros.push(`${sumidos.length} elemento(s) ainda invisível(is) depois das animações: ${sumidos.slice(0, 4).map(nome).join(", ")}`);

  // 7. Imagens e fonte
  [...document.images].filter((i) => i.complete && i.naturalWidth === 0)
    .forEach((i) => erros.push(`imagem quebrada: ${i.getAttribute("src")}`));
  [...document.fonts].filter((f) => f.status === "error")
    .forEach((f) => erros.push(`fonte ${f.family} não carregou`));

  // 8. Vazios no computador
  if (vw >= 1200) {
    const secoes = [...document.querySelectorAll("main > section, body > section, main > div > section")];
    const ehFundo = (el) => {
      const r = el.getBoundingClientRect(), cs = getComputedStyle(el);
      return r.width >= vw * 0.9 && (cs.position === "absolute" || cs.position === "fixed");
    };
    const caixas = (sec) => {
      const lista = [];
      const andar = document.createTreeWalker(sec, NodeFilter.SHOW_TEXT);
      for (let n = andar.nextNode(); n; n = andar.nextNode()) {
        if (!n.textContent.trim() || !visivel(n.parentElement)) continue;
        const faixa = document.createRange();
        faixa.selectNodeContents(n);
        lista.push(...[...faixa.getClientRects()].filter((r) => r.width > 0));
      }
      sec.querySelectorAll("img, video, svg, canvas, picture, iframe, .botao, a[class], button").forEach((el) => {
        if (visivel(el) && !ehFundo(el)) lista.push(el.getBoundingClientRect());
      });
      // Coluna sticky acompanha a rolagem: ocupa a altura toda do bloco pai, não só a dela
      sec.querySelectorAll("*").forEach((el) => {
        if (getComputedStyle(el).position !== "sticky" || !visivel(el) || !el.parentElement) return;
        const r = el.getBoundingClientRect(), p = el.parentElement.getBoundingClientRect();
        lista.push({ left: r.left, right: r.right, top: r.top, bottom: p.bottom, width: r.width });
      });
      return lista;
    };
    const todas = secoes.slice(1).flatMap(caixas); // a capa fica de fora da medida da coluna
    if (todas.length) {
      const esq = Math.min(...todas.map((r) => r.left)), dir = Math.max(...todas.map((r) => r.right));
      const coluna = dir - esq;
      secoes.slice(1).forEach((sec) => {
        const cx = caixas(sec);
        const s = sec.getBoundingClientRect();
        // O maior buraco contínuo: faixas de 40 px seguidas com conteúdo em menos de 60% da coluna
        let vazio = 0, seguido = 0;
        for (let y = s.top; y < s.bottom; y += 40) {
          const naFaixa = cx.filter((r) => r.top < y + 40 && r.bottom > y);
          if (!naFaixa.length) { seguido = 0; continue; }
          const ocupa = Math.max(...naFaixa.map((r) => r.right)) - Math.min(...naFaixa.map((r) => r.left));
          seguido = ocupa < coluna * 0.6 ? seguido + 40 : 0;
          vazio = Math.max(vazio, seguido);
        }
        const titulo = (sec.querySelector("h2, h1")?.textContent || sec.className || "seção").trim().slice(0, 40);
        if (vazio >= 240) erros.push(`vazio no computador: "${titulo}" tem um trecho de ${vazio} px de altura com conteúdo em menos de 60% da largura. Preencha o lado vazio ou mude o arranjo (design.md, item 10)`);
      });
      // Item sozinho numa linha de grade, com as outras linhas cheias
      document.querySelectorAll("main *, body > section *").forEach((g) => {
        if (getComputedStyle(g).display !== "grid" || g.children.length < 3) return;
        const linhas = new Map();
        [...g.children].filter(visivel).forEach((c) => {
          const t = Math.round(c.getBoundingClientRect().top / 4);
          linhas.set(t, [...(linhas.get(t) || []), c]);
        });
        const grupos = [...linhas.values()];
        const largura = g.getBoundingClientRect().width;
        if (grupos.length > 1 && grupos.some((l) => l.length > 1)) {
          grupos.filter((l) => l.length === 1 && l[0].getBoundingClientRect().width < largura * 0.7).forEach((l) =>
            erros.push(`item sozinho numa linha da grade: ${nome(l[0])}. Escolha o número de itens pela grade, ou deixe esse de ponta a ponta (design.md, item 10)`));
        }
      });
    }
  }

  // 10. Animação ligada à rolagem presa numa caixa que não rola (o parallax que não anda)
  [...document.querySelectorAll("*")].forEach((el) => {
    const tl = getComputedStyle(el).animationTimeline || "";
    if (!/scroll\(\s*(nearest)?\s*\)/.test(tl)) return;
    for (let p = el.parentElement; p && p !== document.documentElement && p !== document.body; p = p.parentElement) {
      const o = getComputedStyle(p);
      if (/(hidden|auto|scroll)/.test(o.overflowY + " " + o.overflowX)) {
        if (p.scrollHeight <= p.clientHeight + 1) erros.push(`${nome(el)} tem animation-timeline: scroll() preso em ${nome(p)}, que não rola: o parallax não anda. Use scroll(root), ou overflow: clip no pai (efeitos.md)`);
        break;
      }
    }
  });

  // Avisos
  const capa = document.querySelector("main > section, body > section");
  if (!movel && capa && capa.getBoundingClientRect().height > Math.max(vh, 880) + 1) {
    avisos.push(`capa com ${Math.round(capa.getBoundingClientRect().height)} px, mais alta que a tela: use min-height: min(100svh, 880px)`);
  }
  const titulo = document.querySelector("h1");
  if (titulo) {
    const corH1 = getComputedStyle(titulo).color;
    const outra = [...titulo.querySelectorAll("*")].find((el) => getComputedStyle(el).color !== corH1 || getComputedStyle(el).fontStyle === "italic");
    if (outra) avisos.push(`palavra do título em outra cor ou itálico ("${outra.textContent.trim().slice(0, 30)}"): é o clichê 5 do design.md. Só se o plano pedir`);
    const tamanho = parseFloat(getComputedStyle(titulo).fontSize);
    if (movel && tamanho > vw * 0.16) avisos.push(`h1 com ${tamanho} px numa tela de ${vw} px: grande demais`);
  }
  return { erros, avisos, alturaPagina: document.documentElement.scrollHeight };
}

async function olhaLargura(cdp, largura) {
  const movel = largura < 768;
  const altura = movel ? 844 : 900;
  await cdp.manda("Emulation.setDeviceMetricsOverride", { width: largura, height: altura, deviceScaleFactor: movel ? 2 : 1, mobile: movel });
  await cdp.manda("Emulation.setTouchEmulationEnabled", { enabled: movel });
  const carregou = cdp.uma("Page.loadEventFired");
  await cdp.manda("Page.navigate", { url });
  await carregou;
  await espera(3500); // a entrada da capa e a rede de segurança do app.js terminam
  await cdp.manda("Page.captureScreenshot", { format: "png" }).then((r) =>
    writeFileSync(join(saida, `${largura}-primeira-tela.png`), Buffer.from(r.data, "base64")));
  // Rola a página inteira devagar para as fotos que chegam ao rolar aparecerem
  await cdp.manda("Runtime.evaluate", { expression: `(async () => { for (let y = 0; y < document.documentElement.scrollHeight; y += innerHeight / 2) { scrollTo(0, y); await new Promise(r => setTimeout(r, 120)); } await new Promise(r => setTimeout(r, 1200)); scrollTo(0, 0); await new Promise(r => setTimeout(r, 400)); })()`, awaitPromise: true });
  const r = await cdp.manda("Runtime.evaluate", { expression: `(${examina.toString()})(${movel})`, returnByValue: true });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || "erro no exame da página");
  const achado = r.result.value;
  // No print da página inteira, o topo fixo fica só no alto e o flutuante sai (senão se repetem no meio),
  // e o parallax para (o print é tirado de uma vez só, e a capa sairia deslocada)
  await cdp.manda("Runtime.evaluate", { expression: `document.querySelectorAll("body *").forEach((el) => {
    const cs = getComputedStyle(el);
    if (/scroll\\(|view\\(/.test(cs.animationTimeline || "")) el.style.setProperty("animation", "none", "important");
    if (cs.position === "fixed") { // sticky fica: ele rola junto com a página e aparece no lugar certo
      if (el.getBoundingClientRect().top < 100 && el.getBoundingClientRect().height < 200) el.style.setProperty("position", "absolute", "important");
      else el.style.setProperty("visibility", "hidden", "important");
    }
  })` });
  const alturaPrint = Math.min(achado.alturaPagina, 16000);
  const print = await cdp.manda("Page.captureScreenshot", { format: "jpeg", quality: 72, captureBeyondViewport: true,
    clip: { x: 0, y: 0, width: largura, height: alturaPrint, scale: movel ? 0.5 : 0.5 } });
  writeFileSync(join(saida, `${largura}-pagina-inteira.jpg`), Buffer.from(print.data, "base64"));
  return achado;
}

function lighthouse(preset) {
  const arquivo = join(saida, `lighthouse-${preset}.json`);
  const extra = preset === "computador" ? ["--preset=desktop"] : [];
  return new Promise((resolve) => {
    const p = spawn("npx", ["-y", "lighthouse@12", url, "--quiet", "--output=json", `--output-path=${arquivo}`,
      "--chrome-flags=--headless=new", ...extra], { stdio: "ignore", env: { ...process.env, CHROME_PATH: chromePath } });
    p.on("close", () => {
      try {
        const j = JSON.parse(readFileSync(arquivo, "utf-8"));
        const notas = Object.fromEntries(Object.entries(j.categories).map(([k, v]) => [k, Math.round(v.score * 100)]));
        const lcp = j.audits["largest-contentful-paint-element"]?.details?.items?.[0]?.items?.[0]?.node?.snippet;
        resolve({ notas, lcp, lcpTempo: j.audits["largest-contentful-paint"]?.displayValue });
      } catch (e) {
        resolve({ falhou: "o Lighthouse não rodou (confira o Node e a internet para o npx baixar)" });
      }
    });
  });
}

const { proc, perfil, wsUrl } = await abreChrome();
const cdp = conecta(wsUrl);
await cdp.pronto;
await cdp.manda("Page.enable");
await cdp.manda("Network.enable");
await cdp.manda("Network.setCacheDisabled", { cacheDisabled: true });

let totalErros = 0;
console.log(`# Olhando ${url}\n`);
try {
  for (const w of LARGURAS) {
    const { erros, avisos } = await olhaLargura(cdp, w);
    totalErros += erros.length;
    console.log(`## ${w} px${w < 768 ? " (celular)" : ""}: ${erros.length ? erros.length + " defeito(s)" : "ok"}`);
    erros.forEach((e) => console.log("  - DEFEITO: " + e));
    avisos.forEach((a) => console.log("  - aviso: " + a));
  }
} finally {
  cdp.fecha();
  proc.kill();
  await espera(300);
  try { rmSync(perfil, { recursive: true, force: true }); } catch {}
}
console.log(`\nPrints em ${saida}/ (primeira tela e página inteira de cada largura). Olhe os de 390 e 1280 px antes de mostrar.`);

if (comLighthouse) {
  const nomes = { performance: "desempenho", accessibility: "acessibilidade", "best-practices": "boas práticas", seo: "SEO" };
  console.log("\n## Lighthouse");
  for (const preset of ["celular", "computador"]) {
    const r = await lighthouse(preset);
    if (r.falhou) { console.log(`  - ${preset}: ${r.falhou}`); totalErros++; continue; }
    const baixas = Object.entries(r.notas).filter(([, v]) => v < 95);
    totalErros += baixas.length;
    console.log(`  - ${preset}: ${Object.entries(r.notas).map(([k, v]) => `${nomes[k] || k} ${v}`).join(", ")}${baixas.length ? "  <- abaixo de 95" : ""}`);
    if (r.lcp) console.log(`    maior elemento pintado (${r.lcpTempo}): ${r.lcp.slice(0, 110)}`);
  }
}

console.log(totalErros ? `\n${totalErros} defeito(s). Corrija e olhe de novo.` : "\nNenhum defeito.");
process.exit(totalErros ? 1 : 0);
