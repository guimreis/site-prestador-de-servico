#!/usr/bin/env node
// Filma a cena 3D da capa quadro a quadro e monta os vídeos do site com o ffmpeg.
// A cena é uma página com window.desenha(t) e window.cenaPronta (veja assets/cena-3d/cena.html).
//
// Uso:
//   node scripts/filmar_cena.mjs _projeto/cena site
//
// Gera, dentro da pasta do site:
//   video/capa.mp4              1920x1080, para o computador
//   video/capa-celular.mp4      1080x1920, para o celular (a tela de 390 px tem densidade 2 a 3)
//   img/capa-video.jpg          o primeiro quadro, 1920x1080 (a imagem parada da capa)
//   img/capa-video-celular.jpg  o primeiro quadro, 1080x1920
// Em 1280x720 o vídeo fica borrado numa tela de 1440 px: filme sempre no tamanho grande.
// Sem som, H.264, com o índice no começo do arquivo (toca antes de baixar inteiro).
// Precisa do Node, do Google Chrome e do ffmpeg (Mac: brew install ffmpeg).

import { spawn, spawnSync } from "node:child_process";
import { createServer } from "node:http";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, existsSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, extname, resolve } from "node:path";

const [pastaCena, pastaSite] = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const opcao = (nome, padrao) => {
  const a = process.argv.find((x) => x.startsWith(`--${nome}=`));
  return a ? Number(a.split("=")[1]) : padrao;
};
const FPS = opcao("fps", 30);
if (!pastaCena || !pastaSite || !existsSync(join(pastaCena, "cena.html"))) {
  console.error("Uso: node filmar_cena.mjs _projeto/cena site   (a pasta da cena precisa ter cena.html)");
  process.exit(2);
}
if (spawnSync("ffmpeg", ["-version"]).status !== 0) {
  console.error("Falta o ffmpeg. No Mac: brew install ffmpeg. No Windows: winget install ffmpeg.");
  process.exit(2);
}
const chromePath = [process.env.CHROME_PATH, "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome", "/usr/bin/chromium", "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"]
  .filter(Boolean).find((c) => existsSync(c));
if (!chromePath) { console.error("Não achei o Google Chrome (ou passe CHROME_PATH)."); process.exit(2); }

const TIPOS = { ".html": "text/html", ".js": "text/javascript", ".mjs": "text/javascript", ".json": "application/json",
  ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp", ".svg": "image/svg+xml", ".glb": "model/gltf-binary" };
const raiz = resolve(pastaCena);
const servidor = createServer((req, res) => {
  const caminho = join(raiz, decodeURIComponent(new URL(req.url, "http://x").pathname));
  if (!caminho.startsWith(raiz) || !existsSync(caminho) || statSync(caminho).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { "Content-Type": TIPOS[extname(caminho)] || "application/octet-stream" });
  res.end(readFileSync(caminho));
});
await new Promise((r) => servidor.listen(0, "127.0.0.1", r));
const enderecoCena = `http://127.0.0.1:${servidor.address().port}/cena.html`;

const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const perfil = mkdtempSync(join(tmpdir(), "filmar-"));
const chrome = spawn(chromePath, ["--headless=new", "--remote-debugging-port=0", "--no-first-run", "--hide-scrollbars",
  "--enable-unsafe-swiftshader", "--use-angle=swiftshader", `--user-data-dir=${perfil}`, "about:blank"], { stdio: ["ignore", "ignore", "pipe"] });
const wsBrowser = await new Promise((ok, falha) => {
  let b = ""; const t = setTimeout(() => falha(new Error("O Chrome não abriu")), 15000);
  chrome.stderr.on("data", (d) => { b += d; const m = b.match(/DevTools listening on (ws:\/\/\S+)/); if (m) { clearTimeout(t); ok(m[1]); } });
});
const porta = new URL(wsBrowser).port;
const pagina = (await (await fetch(`http://127.0.0.1:${porta}/json/list`)).json()).find((a) => a.type === "page");
const sock = new WebSocket(pagina.webSocketDebuggerUrl);
let id = 0; const pend = new Map(); const ouv = [];
sock.onmessage = (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id && pend.has(m.id)) { const p = pend.get(m.id); pend.delete(m.id); m.error ? p.falha(new Error(m.error.message)) : p.ok(m.result); }
  else if (m.method) ouv.filter((o) => o.metodo === m.method).forEach((o) => o.fn(m.params));
};
await new Promise((r) => (sock.onopen = r));
const manda = (method, params = {}) => new Promise((ok, falha) => { const n = ++id; pend.set(n, { ok, falha }); sock.send(JSON.stringify({ id: n, method, params })); });
const uma = (metodo) => new Promise((r) => ouv.push({ metodo, fn: r }));
const avalia = async (expr) => {
  const r = await manda("Runtime.evaluate", { expression: expr, awaitPromise: true, returnByValue: true });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
  return r.result.value;
};

await manda("Page.enable");
const erros = [];
ouv.push({ metodo: "Runtime.exceptionThrown", fn: (p) => erros.push(p.exceptionDetails?.exception?.description) });
await manda("Runtime.enable");

async function filma(largura, altura, saidaVideo, saidaQuadro) {
  await manda("Emulation.setDeviceMetricsOverride", { width: largura, height: altura, deviceScaleFactor: 1, mobile: false });
  const carregou = uma("Page.loadEventFired");
  await manda("Page.navigate", { url: enderecoCena });
  await carregou;
  await avalia("window.cenaPronta");
  const duracao = await avalia("window.DURACAO || 6");
  if (typeof (await avalia("typeof window.desenha")) !== "string" || (await avalia("typeof window.desenha")) !== "function") {
    throw new Error("A cena não tem window.desenha(t). " + (erros[0] || ""));
  }
  const quadros = Math.round(duracao * FPS);
  const tmp = mkdtempSync(join(tmpdir(), "quadros-"));
  process.stdout.write(`Filmando ${largura}x${altura}, ${duracao} s, ${quadros} quadros `);
  for (let i = 0; i < quadros; i++) {
    await avalia(`window.desenha(${i / FPS})`);
    const { data } = await manda("Page.captureScreenshot", { format: "png" });
    writeFileSync(join(tmp, `q${String(i).padStart(5, "0")}.png`), Buffer.from(data, "base64"));
    if (i % FPS === 0) process.stdout.write(".");
  }
  // H.264 sem som, crf 30: leve e ainda bonito numa cena escura com pouco detalhe.
  const r = spawnSync("ffmpeg", ["-y", "-loglevel", "error", "-framerate", String(FPS), "-i", join(tmp, "q%05d.png"),
    "-c:v", "libx264", "-preset", "slow", "-crf", "30", "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-an", saidaVideo]);
  if (r.status !== 0) throw new Error("ffmpeg falhou: " + r.stderr);
  const q = spawnSync("ffmpeg", ["-y", "-loglevel", "error", "-i", join(tmp, "q00000.png"), "-q:v", "4", saidaQuadro]);
  if (q.status !== 0) throw new Error("ffmpeg não gerou o quadro parado: " + q.stderr);
  rmSync(tmp, { recursive: true, force: true });
  console.log(` ${saidaVideo} (${Math.round(statSync(saidaVideo).size / 1000)} KB)`);
}

mkdirSync(join(pastaSite, "video"), { recursive: true });
mkdirSync(join(pastaSite, "img"), { recursive: true });
let falhou = false;
try {
  await filma(1920, 1080, join(pastaSite, "video", "capa.mp4"), join(pastaSite, "img", "capa-video.jpg"));
  await filma(1080, 1920, join(pastaSite, "video", "capa-celular.mp4"), join(pastaSite, "img", "capa-video-celular.jpg"));
  if (erros.length) console.log("Avisos da cena:\n  " + erros.join("\n  "));
} catch (e) {
  console.error("\nNão filmou: " + e.message);
  falhou = true;
} finally {
  sock.close(); chrome.kill(); servidor.close();
  await espera(300);
  try { rmSync(perfil, { recursive: true, force: true }); } catch {}
}
if (!falhou) console.log("Pronto. Confira no site: o vídeo em loop não pode dar pulo na emenda.");
process.exit(falhou ? 1 : 0);
