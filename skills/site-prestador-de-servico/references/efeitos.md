# Efeitos: movimento que dá vontade de rolar a página

Efeito bom é aquele que a pessoa nota uma vez e lembra do negócio. Efeito ruim é tudo
pulando na tela. A regra desta skill: **no máximo três efeitos por página**, um de cada tipo.

1. **A entrada da capa**: quando a página abre, a foto se aproxima devagar e o título entra
   linha por linha. Uma vez só.
2. **O efeito assinatura**: uma coisa do ofício que se mexe junto com a rolagem. O carro que
   desce a estrada e acende a faixa (transporte), o rolo que pinta uma faixa da parede
   (pintor), o fio que acende até a lâmpada (eletricista), a linha do tempo que se desenha
   (advogado). Sai da mesma ideia do plano de design ([design.md](design.md), item 1).
3. **A chegada suave**: fotos e depoimentos aparecem com um leve deslize quando entram na
   tela. Só eles, e uma vez cada.

Nada de efeito em cada seção, texto que digita sozinho, cursor que segue o mouse, página
que rola "sozinha" ou fundo em movimento atrás do texto.

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
  M.animate(".capa h1 .linha",
    { opacity: [0, 1], transform: ["translateY(28px)", "translateY(0)"] },
    { duration: 0.9, ease: suave, delay: M.stagger(0.12, { startDelay: 0.2 }) });

  // 3. A chegada suave
  M.inView(".revela", function (el) {
    M.animate(el, { opacity: [0, 1], transform: ["translateY(24px)", "translateY(0)"] },
      { duration: 0.8, ease: suave });
  }, { amount: 0.25 });
})();
```

E no CSS, o ponto de partida escondido só existe quando o JavaScript ligou a classe:

```css
.anima:not(.anima-pronta) .capa h1 .linha { opacity: 0; }
.anima .revela { opacity: 0; }
```

No HTML, cada linha do título vai num `<span class="linha">` e cada foto ou depoimento que
deve chegar suave ganha `class="revela"`.

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

## Conferir

1. Abra a página e role devagar, no celular (390 px) e no computador (1280 px).
2. Print tirado logo depois de abrir a página pode pegar a animação no meio: texto apagado ou
   foto esmaecida. Antes de achar defeito, espere 3 segundos ou confira no console:
   `getComputedStyle(document.querySelector('.capa h1 .linha')).opacity` tem que dar `1`.
3. Ligue "reduzir movimento" no sistema (Mac: Ajustes, Acessibilidade, Tela) e recarregue: a
   página tem que aparecer inteira e parada.
4. Desligue o JavaScript ou apague `js/app.js` por um minuto: a página continua completa.
5. A capa não pode passar de uma tela de altura em monitor alto: use
   `min-height: min(100svh, 880px)`.
