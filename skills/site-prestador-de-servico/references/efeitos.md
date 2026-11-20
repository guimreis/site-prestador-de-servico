# Efeitos: movimento que dá vontade de rolar a página

Efeito bom é aquele que a pessoa nota uma vez e lembra do negócio. Efeito ruim é tudo
pulando na tela. A regra desta skill: **no máximo três efeitos por página**, um de cada tipo.

1. **A entrada da capa**: quando a página abre, a foto se aproxima devagar e o título sobe
   linha por linha. Uma vez só. **Na primeira tela nada começa invisível**: a entrada mexe
   só na posição (`transform`), nunca na opacidade. Título que começa apagado só aparece
   depois que o JavaScript roda, e o Lighthouse do celular conta esse atraso.
2. **O efeito assinatura**: uma coisa do ofício que se mexe junto com a rolagem. O carro que
   desce a estrada e acende a faixa (transporte), o rolo que pinta uma faixa da parede
   (pintor), o fio que acende até a lâmpada (eletricista), a linha do tempo que se desenha
   (advogado). Sai da mesma ideia do plano de design ([design.md](design.md), item 1).
3. **As fotos vivas**: cada foto desliza devagar dentro da moldura enquanto a página rola
   (parallax leve, em CSS puro), e os depoimentos aparecem com um leve deslize quando
   entram na tela, uma vez cada. A capa também entra no parallax: o vídeo ou a foto rola
   mais devagar que o texto, e a página ganha profundidade sem ninguém perceber o truque.

A entrada da capa pode ser um **vídeo em loop feito em código** (seção "O vídeo da capa",
abaixo). Ele toma o lugar da entrada animada: continua no máximo três efeitos.

Nada de efeito em cada seção, texto que digita sozinho, cursor que segue o mouse, página
que rola "sozinha" ou fundo que se mexe sozinho atrás de texto corrido. A capa é a
exceção: o vídeo em loop e o parallax leve, com o degradê escuro garantindo a leitura.

## As ferramentas, em ordem

| Ferramenta | Para quê | Licença | Peso |
|---|---|---|---|
| CSS puro (`animation-timeline`) | O efeito assinatura, ligado à rolagem | do navegador | zero |
| Motion (motion.dev), versão mini | A entrada da capa e a chegada suave | MIT | 12 KB (5 KB comprimido) |

A animação ligada à rolagem em CSS puro funciona no Chrome, no Edge, no Safari e, desde a
versão 159, no Firefox, segundo o
[resumo de outubro de 2026 do web.dev](https://web.dev/blog/web-platform-10-2026). Em
navegador antigo, a página aparece parada e completa: o efeito some, o conteúdo fica.

A Motion tem licença MIT, que não pode ser revogada. A GSAP é mais completa e ficou grátis
em 2025, mas a licença é da Webflow, que pode revogá-la: fica de fora desta skill.

## Montar a Motion dentro do site

Nada carregado de fora: a Motion entra como arquivo em `site/js/`. Com o Node.js que a skill
já pede:

```bash
mkdir -p _projeto/motion && cd _projeto/motion
npm init -y >/dev/null
npm install motion esbuild
printf 'import { animate } from "motion/mini";\nimport { inView, stagger } from "motion";\nwindow.Motion = { animate, inView, stagger };\n' > entrada.js
npx esbuild entrada.js --bundle --minify --format=iife --outfile=../../site/js/motion-mini.min.js
cp node_modules/motion/LICENSE.md ../../site/js/motion-LICENSE.txt
cd ../.. && rm -rf _projeto/motion
```

No `<head>` do `index.html`:

```html
<script src="js/motion-mini.min.js" defer></script>
<script src="js/app.js" defer></script>
```

## O `app.js` modelo

```js
// Sem este arquivo, ou sem a Motion, a página aparece inteira e parada.
(function () {
  var M = window.Motion;
  if (!M || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var raiz = document.documentElement;
  raiz.classList.add("anima");
  // Rede de segurança: se a animação travar (aba em segundo plano, print automático),
  // ela termina na marra e o texto aparece. As ligadas à rolagem ficam de fora.
  setTimeout(function () {
    raiz.classList.add("anima-pronta");
    document.getAnimations().forEach(function (a) {
      if (a.timeline instanceof DocumentTimeline && a.playState === "running") a.finish();
    });
  }, 2500);
  var suave = [0.22, 0.8, 0.24, 1];

  // 1. A entrada da capa
  M.animate(".capa-foto", { transform: ["scale(1.08)", "scale(1)"] }, { duration: 2.4, ease: suave });
  // Só transform: o texto já está visível desde o primeiro quadro.
  M.animate(".capa h1 .linha",
    { transform: ["translateY(28px)", "translateY(0)"] },
    { duration: 0.9, ease: suave, delay: M.stagger(0.12, { startDelay: 0.1 }) });

  // 3. A chegada suave (só abaixo da primeira tela)
  M.inView(".revela", function (el) {
    M.animate(el, { opacity: [0, 1], transform: ["translateY(24px)", "translateY(0)"] },
      { duration: 0.8, ease: suave });
  }, { amount: 0.25 });
})();
```

E no CSS, o ponto de partida escondido só existe quando o JavaScript ligou a classe:

```css
.capa h1 .linha { display: block; }
.anima .revela { opacity: 0; }
```

No HTML, cada linha do título vai num `<span class="linha">` e cada foto ou depoimento que
deve chegar suave ganha `class="revela"`. Nada da capa ganha `revela`.

## O efeito assinatura em CSS puro

Modelo: um objeto (`.carro`) desce uma pista (`.pista`) enquanto a seção passa pela tela, e
um rastro (`.rastro`) se acende atrás dele.

```css
@supports (animation-timeline: view()) {
  @media (prefers-reduced-motion: no-preference) {
    .estrada { view-timeline: --estrada block; }
    .carro  { animation: desce linear both; animation-timeline: --estrada; animation-range: entry 60% exit 40%; }
    .rastro { animation: acende linear both; animation-timeline: --estrada; animation-range: entry 60% exit 40%; }
    @keyframes desce  { from { top: 8px; } to { top: calc(100% - 128px); } }
    @keyframes acende { from { transform: scaleY(0); } to { transform: scaleY(1); } }
  }
}
```

Fora do `@supports`, deixe o objeto na posição final e o rastro aceso: quem não tem o efeito
vê o desenho pronto. O objeto é um SVG feito por você (caminho 4 de [imagens.md](imagens.md)),
com as cores da paleta.

## O parallax leve, em CSS puro

Leve quer dizer: a foto anda no máximo 7% da própria altura, e a capa, um quarto. Mais
que isso dá enjoo e parece site de 2012. Receita do
[modern-web-guidance](https://github.com/GoogleChrome/modern-web-guidance)
(guia `parallax-scroll-effects`), sem JavaScript:

```html
<figure class="foto-viva">
  <img src="img/ponte.webp" alt="..." width="1600" height="1064" loading="lazy">
</figure>
```

```css
.foto-viva { overflow: clip; aspect-ratio: 4 / 3; border-radius: 6px; margin: 0; }
.foto-viva img { width: 100%; height: 100%; object-fit: cover; }

@supports ((animation-timeline: view()) and (animation-range: entry)) {
  @media (prefers-reduced-motion: no-preference) {
    /* A foto é maior que a moldura e desliza dentro dela */
    .foto-viva img { scale: 1.16; animation: foto-viva linear both; animation-timeline: view(); }
    @keyframes foto-viva { from { translate: 0 -7%; } to { translate: 0 7%; } }
    /* A capa rola mais devagar que o texto */
    .capa-foto, .capa-video { animation: capa-funda linear both; animation-timeline: scroll(root); animation-range: 0 100svh; }
    @keyframes capa-funda { to { translate: 0 25%; } }
  }
}
```

1. Use `translate` e `scale`, não `transform`: a Motion já mexe no `transform` da capa e
   das fotos que chegam, e um apagaria o outro.
2. `animation-timeline` vem depois do atalho `animation`, senão o atalho zera a linha do
   tempo.
3. Sem `@supports`, o navegador antigo mostra a foto parada e inteira. É enfeite: não
   precisa de plano B em JavaScript.
4. Foto com parallax não ganha `revela` (as duas coisas ao mesmo tempo ficam moles).
5. Na capa, `scroll(root)`, nunca `scroll()` sozinho: o `scroll()` pega a caixa mais
   próxima com `overflow: hidden`, que é a própria capa, e ela não rola. A animação existe
   e não anda (foi o que aconteceu na rodada 4 da TXP). Para cortar o que sobra da capa,
   use `overflow: clip`, que não cria caixa de rolagem.

## O vídeo da capa: uma cena 3D escrita em código

O Claude escreve uma cena 3D em código (Three.js, licença MIT), acende, e o
`scripts/filmar_cena.mjs` filma quadro a quadro no Chrome e monta o vídeo com o ffmpeg. O
vídeo tem 6 segundos, emenda o fim no começo, não tem som e pesa uns 150 KB. O Three.js
fica em `_projeto/cena/` e nunca vai para o site: o site recebe só o MP4 e uma imagem
parada.

**Quando usar**: quando o ofício tem uma cena que se mexe (a estrada, o fio que acende, a
água que corre, a linha do tempo) e o prestador não tem um vídeo próprio bonito. Vídeo
gravado de banco de imagens, não: pesa dez vezes mais e parece de qualquer um.

### 1. Montar a cena

```bash
mkdir -p _projeto/cena _projeto/tmp && cd _projeto/tmp
npm pack three && tar -xzf three-*.tgz
cp package/build/three.module.js package/build/three.core.js ../cena/
cp package/LICENSE ../cena/three-LICENSE.txt
cd .. && rm -rf tmp && cd ..
cp CAMINHO_DA_SKILL/assets/cena-3d/cena.html _projeto/cena/
```

O `cena.html` modelo é uma estrada de luz à noite (faixas douradas correndo, rastros de
farol, as luzes da cidade no horizonte). Mude o que for do ofício e mantenha o contrato
escrito no topo do arquivo:

1. `window.desenha(t)` desenha o quadro do segundo `t`, sempre igual. Nada de
   `Math.random()` sem semente, `Date.now()` ou `requestAnimationFrame`.
2. Tudo se repete a cada `DURACAO` segundos: o que anda, anda um número inteiro de voltas.
3. As cores são as do plano de design. A névoa tem a cor do horizonte, para a cena sumir
   nele sem corte.
4. Brilho é ponto somado (`AdditiveBlending`), não luz cara. Textura de canvas leva
   `colorSpace = THREE.SRGBColorSpace`, senão a cor sai lavada.
5. A cena tem um lado calmo, onde o título vai ficar: a esquerda no computador, a metade
   de baixo no celular. O modelo já enquadra assim (a câmera muda com `retrato`); se trocar
   o objeto, confira nos dois quadros parados que nada importante fica atrás do texto.

### 2. Filmar

```bash
node scripts/filmar_cena.mjs _projeto/cena site
```

Ele grava `site/video/capa.mp4` (1920x1080), `site/video/capa-celular.mp4` (1080x1920, em
pé) e o primeiro quadro de cada um em `site/img/capa-video.jpg` e
`site/img/capa-video-celular.jpg`. Precisa do Chrome e do ffmpeg (Mac: `brew install
ffmpeg`). Abra os dois JPG e um quadro do meio
(`ffmpeg -ss 3 -i site/video/capa.mp4 -frames:v 1 _projeto/meio.jpg`) antes de seguir: se
estiver feio parado, fica feio andando. Corrija a cena e filme de novo.

### 3. Pôr na capa sem atrasar a primeira tela

A imagem parada abre na hora (é ela que o Lighthouse mede); o vídeo só começa a baixar
depois que a página inteira carregou, por cima da imagem, e some para quem pediu menos
movimento ou está economizando dados.

```html
<section class="capa">
  <picture>
    <source media="(max-width: 899px)" srcset="img/capa-video-celular.jpg" width="1080" height="1920">
    <img class="capa-foto" src="img/capa-video.jpg" alt="" width="1920" height="1080" fetchpriority="high">
  </picture>
  <video class="capa-video" muted playsinline loop preload="none" aria-hidden="true" tabindex="-1"
    data-celular="video/capa-celular.mp4" data-computador="video/capa.mp4"></video>
  <button class="capa-pausa" type="button" aria-label="Pausar o vídeo" hidden></button>
  <div class="capa-texto">...</div>
</section>
```

```css
.capa-foto, .capa-video { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.capa-video { opacity: 0; transition: opacity .8s; }
.capa-video.tocando { opacity: 1; }
.capa-pausa { position: absolute; z-index: 2; right: var(--margem); bottom: 16px; width: 44px; height: 44px;
  border-radius: 50%; border: 1px solid rgba(255,255,255,.35); background: rgba(0,0,0,.35); cursor: pointer; }
/* O desenho é CSS, não caractere: "❚❚" e "▶" viram quadrado em celular sem a fonte certa */
.capa-pausa::before { content: ""; position: absolute; inset: 0; margin: auto; width: 10px; height: 14px;
  border-left: 3px solid #fff; border-right: 3px solid #fff; box-sizing: border-box; }
.capa-pausa[aria-pressed="true"]::before { width: 0; height: 0; border: 0; margin: auto auto auto 17px;
  border-left: 12px solid #fff; border-top: 7px solid transparent; border-bottom: 7px solid transparent; }
```

No `app.js`, fora do bloco da Motion (o vídeo não depende dela):

```js
// O vídeo da capa entra depois que a página carregou: a primeira tela não espera por ele.
(function () {
  var v = document.querySelector(".capa-video"), b = document.querySelector(".capa-pausa");
  if (!v || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var rede = navigator.connection;
  if (rede && (rede.saveData || /2g/.test(rede.effectiveType || ""))) return;
  window.addEventListener("load", function () {
    setTimeout(function () {
      v.src = window.matchMedia("(max-width: 899px)").matches ? v.dataset.celular : v.dataset.computador;
      v.addEventListener("playing", function () { v.classList.add("tocando"); if (b) b.hidden = false; }, { once: true });
      var p = v.play(); if (p && p.catch) p.catch(function () {});
    }, 300);
  });
  // Vídeo que se mexe por mais de 5 segundos precisa de um jeito de parar (acessibilidade)
  if (b) b.addEventListener("click", function () {
    var parar = !v.paused;
    parar ? v.pause() : v.play();
    b.setAttribute("aria-pressed", String(parar));
    b.setAttribute("aria-label", parar ? "Tocar o vídeo" : "Pausar o vídeo");
  });
})();
```

O título da capa continua no HTML, por cima do vídeo, com um degradê escuro do lado do
texto para passar no contraste. A foto real do lugar (a ponte, a fachada, o trabalho) vai
para a seção seguinte: o vídeo é a abertura, não substitui a prova.

Anote em `_projeto/imagens.md`: `video/capa.mp4 | cena 3D feita pelo Claude com Three.js
(MIT) | do projeto`.

## Conferir

1. Abra a página e role devagar, no celular (390 px) e no computador (1280 px).
2. Rode `node scripts/olhar_site.mjs http://localhost:8000 _projeto/prints`: ele espera as
   animações, rola a página inteira e acusa o texto que ficou invisível.
3. Ligue "reduzir movimento" no sistema (Mac: Ajustes, Acessibilidade, Tela) e recarregue: a
   página tem que aparecer inteira e parada.
4. Desligue o JavaScript ou apague `js/app.js` por um minuto: a página continua completa
   (com vídeo na capa, fica a imagem parada).
5. Com vídeo: deixe tocar duas voltas e olhe a emenda. Pulo na volta é defeito da cena (o
   que anda não fecha um número inteiro de voltas).
6. A capa não pode passar de uma tela de altura em monitor alto: use
   `min-height: min(100svh, 880px)`.
