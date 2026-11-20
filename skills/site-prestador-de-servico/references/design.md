# Design: o site precisa parecer de um profissional caprichoso

Esta página resolve o visual sozinha. Se a skill `frontend-design` estiver instalada, use as
duas juntas; se não estiver, esta basta.

O site do teste que deu errado tinha 1,8 KB de CSS, nenhuma imagem, a fonte padrão do
sistema e uma coluna de texto do começo ao fim. Estava correto e parecia rascunho. O
conteúdo era bom. Faltaram imagem, tipografia e uma ideia visual.

## 1. Antes de escrever CSS: o plano em cinco linhas

Escreva em `_projeto/design.md` e mostre ao prestador:

1. **A ideia**: uma coisa do mundo do prestador que vira o elemento visual da página. A
   folha do ipê da cidade, a fita crepe do pintor, o azulejo da cozinha, a capa de processo
   do advogado. Uma só.
2. **Cores**: de 4 a 6, com nome e código. Saem do ofício e da
   cidade, ou da marca, quando ela já existe (o logo manda). Uma de fundo, uma de texto,
   uma de destaque, uma de apoio. **O botão do WhatsApp usa a cor de destaque da marca**,
   com o ícone do WhatsApp dentro; o verde do WhatsApp só entra quando a marca não tem
   cor forte. Na TXP, botão verde em site preto e dourado brigou com o logo.
3. **Fonte**: uma família com personalidade para títulos (veja o item 3) e a do sistema ou
   a mesma para o texto.
4. **A capa**: como o título, a foto e o botão se arrumam no celular e no computador.
   Desenhe em ASCII.
5. **O que esta página não vai ter**: os clichês da lista do item 6 que ela evita.

Depois de escrever, pergunte: um site de outro prestador da mesma profissão sairia igual?
Se sim, troque a ideia ou as cores.

## 2. As peças que todo site tem

1. **Capa com foto ou vídeo, de ponta a ponta**. No celular, a imagem ocupa a tela
   inteira, atrás, e o texto fica na metade de baixo, por cima de um degradê escuro
   (transparente em cima, quase opaco embaixo). No computador, a imagem continua atrás e o
   degradê escurece o lado do texto (`linear-gradient(90deg, ...)`). Foi assim que o dono
   aprovou a capa da TXP; com a foto em cima e o título embaixo, numa faixa à parte, a capa
   ficou com cara de modelo. Foto clara demais para texto por cima? Escureça com o degradê
   ou escolha outra. O botão do WhatsApp aparece sem rolar a página nas duas, e a capa tem
   `min-height: min(100svh, 880px)`: ocupa a tela do celular e não vira um paredão em
   monitor alto.
2. **Pelo menos três imagens** na página (a capa, o lugar ou o trabalho, um detalhe). Veja
   [imagens.md](imagens.md).
3. **Ritmo de seções**: alterne fundo claro e uma faixa de cor (uma ou duas na página). Seção com foto ao lado do texto quebra a coluna única.
4. **Serviços em lista arrumada**, não seis cartões iguais com sombra. Duas colunas no
   computador, título curto e uma linha de explicação.
5. **Passos numerados só onde é sequência de verdade** (como funciona).
6. **Botão flutuante do WhatsApp no celular**, que some no computador e **só aparece
   depois que o botão da capa saiu da tela** (senão um cobre o outro). Pequeno (48 px,
   redondo, só o ícone com `aria-label`), no canto, e o `body` ganha `padding-bottom: 72px`
   para ele não cobrir o fim do rodapé:

   ```css
   .flutuante { position: fixed; right: 16px; bottom: 16px; width: 56px; height: 56px; opacity: 0; pointer-events: none; transition: opacity .3s; }
   .flutuante.visivel { opacity: 1; pointer-events: auto; }
   @media (min-width: 900px) { .flutuante { display: none; } }
   ```

   No `app.js`, fora do bloco da Motion:

   ```js
   (function () {
     var f = document.querySelector(".flutuante"), capa = document.querySelector(".capa");
     if (!f || !capa || !("IntersectionObserver" in window)) { if (f) f.classList.add("visivel"); return; }
     new IntersectionObserver(function (e) { f.classList.toggle("visivel", !e[0].isIntersecting); }).observe(capa);
   })();
   ```
7. **Rodapé com tudo o que identifica**: nome, registro no conselho (quando houver),
   endereço ou região, créditos das imagens com licença CC BY.

**O começo de todo `style.css`** (sem isso, a foto com `width` e `height` no HTML estica):

```css
*, *::before, *::after { box-sizing: border-box; }
img, video { max-width: 100%; height: auto; display: block; }
h1, h2, h3 { text-wrap: balance; }
p, li { text-wrap: pretty; }
```

## 3. Fonte própria, sem carregar nada de fora

A regra de não carregar nada de fora continua: o arquivo da fonte vai dentro de
`site/fontes/`. Use fonte de licença livre (SIL Open Font License), que pode ir junto com
o site.

Como baixar, com o Node.js que a skill já pede:

```bash
mkdir -p _projeto/tmp && cd _projeto/tmp
npm pack @fontsource-variable/bricolage-grotesque
tar -xzf fontsource-variable-bricolage-grotesque-*.tgz
ls -la package/files | grep latin- | grep normal   # escolha o menor que sirva
cp package/files/bricolage-grotesque-latin-wght-normal.woff2 ../../site/fontes/
cp package/LICENSE ../../site/fontes/bricolage-grotesque-LICENSE.txt
cd ../.. && rm -rf _projeto/tmp
```

E no CSS:

```css
@font-face {
  font-family: "Titulo";
  src: url("fontes/bricolage-grotesque-latin-wght-normal.woff2") format("woff2");
  font-weight: 200 800;
  font-display: swap;
}
```

Sugestões por tom (todas no fontsource, licença OFL; confira o nome do pacote em
fontsource.org):

| Tom do prestador | Fontes para título |
|---|---|
| Caloroso, de bairro | Bricolage Grotesque, Fraunces, Young Serif |
| Sério, tradicional | Newsreader, Source Serif 4, Literata |
| Técnico, obra, oficina | Archivo, Barlow Condensed, Space Grotesk |
| Delicado, saúde, beleza | Instrument Serif, DM Serif Display, Figtree |

**O arquivo da fonte tem no máximo 50 KB.** Use o `latin-wght-normal` (só o eixo do
peso). O `latin-standard` e o `latin-wdth` trazem também a largura e pesam o dobro
(na Archivo, 90 KB contra 35 KB): na TXP, isso sozinho tirou pontos do Lighthouse no
celular. Quer letra estreita? Escolha uma família que já nasce estreita (Archivo Narrow,
Barlow Condensed, Saira Condensed) em vez de `font-stretch`. Carregue com
`<link rel="preload" href="fontes/ARQUIVO.woff2" as="font" type="font/woff2" crossorigin>`.

Uma família para títulos basta. O texto corrido pode ficar na fonte do sistema
(`system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`), que abre rápido e é legível.
Sem internet ou sem Node, o plano B é a fonte do sistema com tamanhos bem marcados.

## 4. Medidas que separam o caprichado do amador

1. Título da capa grande: de 2,2rem no celular a 4rem no computador, com `line-height` de
   1,05 a 1,15 e `letter-spacing` levemente negativo.
2. Texto em 17 a 18 px, `line-height` 1,6, linha com no máximo 65 caracteres
   (`max-width: 65ch`).
3. Espaço entre seções generoso: 72 a 120 px no computador, 56 a 72 px no celular.
4. Alinhamento à esquerda. Centralizado só em bloco curto.
5. Contraste do texto de pelo menos 4,5:1. Botão de pelo menos 48 px de altura.
   Todo link tem área de toque de pelo menos 40 px no celular, inclusive os pequenos do
   rodapé e do contato. Link sozinho numa linha: `display: inline-block; padding: 12px 0;`.
   Link no meio de uma frase (créditos): `padding-block: 12px;` sem mudar o `display`, que
   aumenta a área do dedo sem abrir buraco na frase. Link com 18 px de altura é difícil de
   acertar com o dedo.
6. Foco visível no teclado (`:focus-visible`) e `prefers-reduced-motion` respeitado.
7. Imagem com `object-fit: cover` e `aspect-ratio` definido, para não pular na tela
   quando carrega.
8. Títulos com `text-wrap: balance` e parágrafos com `text-wrap: pretty`: o navegador
   equilibra as linhas e não deixa palavra sozinha na última.

## 5. Movimento

No máximo três efeitos, cada um com uma função: a entrada da capa, um efeito assinatura
ligado à rolagem e a chegada suave das fotos. Receitas, ferramentas e como conferir em
[efeitos.md](efeitos.md). Animação em cada seção que aparece na rolagem é o primeiro sinal
de site feito por IA.

## 6. Os clichês que denunciam site genérico

1. Fundo creme com título em serifa e destaque cor de barro.
2. Fundo quase preto com um único verde-limão ou laranja.
3. Seis cartões iguais, cantos arredondados iguais e a mesma sombra cinza embaixo de todos.
4. Rótulo em MAIÚSCULAS espaçadas em cima de cada título de seção.
5. Uma palavra do título em outra cor ou em itálico.
6. Números "01 / 02 / 03" em coisa que não é sequência.
7. Gradiente roxo e azul, ícone genérico de check em toda lista, seta "→" em todo link.
8. Banco de imagem com gente sorrindo para a câmera no lugar da foto do lugar.

Pode usar um deles se o plano pedir. Por inércia, não.

## 7. O celular, onde o dono reprovou a primeira versão

O primeiro site da TXP estava bonito no computador e o dono achou o celular "muito feio e
desproporcional": os dois botões da capa tinham larguras diferentes (249 e 176 px), um
embaixo do outro, e o botão do topo era quase do tamanho deles. A receita que resolveu, e
que vale para todo site:

```css
@media (max-width: 899px) {
  /* botões do mesmo grupo: mesma largura, a coluna toda, um embaixo do outro */
  .capa-botoes { display: grid; grid-template-columns: 1fr; gap: 10px; }
  .capa-botoes .botao, .contato .botao { width: 100%; }
  /* o botão do topo fica discreto e não compete com os da capa */
  .topo .botao { min-height: 34px; padding: 6px 14px; font-size: .85rem; }
}
```

1. No celular, todo botão grande ocupa a largura da coluna. Dois ou mais juntos ficam um
   embaixo do outro, com a mesma largura. Botão que encolhe no tamanho do texto parece
   esquecido.
2. O botão do topo, no celular, tem de 32 a 38 px de altura, menor que o da capa.
3. Lado a lado, só a partir de 900 px.
4. Título da capa no celular: `clamp(2.4rem, 11vw, 3.4rem)`. Mais que isso quebra palavra.

## 8. O peso da primeira tela

O Lighthouse do celular simula uma conexão lenta. Tudo o que baixa antes da primeira tela
atrasa o título, e o título é o "maior elemento pintado" que ele mede. Na TXP, a nota foi
de 95 para 99 com três trocas, e a animação da capa não era a culpada:

1. Fonte de 90 KB trocada pela de 35 KB (item 3).
2. Capa do celular em 800 px e 57 KB, em vez da de 1216 px e 130 KB
   ([imagens.md](imagens.md), item 6 de "Otimizar").
3. A foto de fundo da seção de contato saiu do CSS e virou `<img loading="lazy">`
   ([imagens.md](imagens.md), item 7 de "Otimizar"): fundo de CSS baixa logo de cara.

Antes da primeira tela, no máximo uns 150 KB: HTML, CSS, fonte e a capa do celular.

## 9. Mudou o CSS? Mude o número

O navegador e o servidor de teste guardam o CSS e o JavaScript antigos, e você confere a
versão velha achando que é a nova. Chame sempre com número de versão e aumente a cada
mudança:

```html
<link rel="stylesheet" href="style.css?v=1">
<script src="js/app.js?v=1" defer></script>
```

## 10. O computador sem buracos

No celular tudo vira uma coluna e fica cheio. No computador, a mesma página abre buracos:
na TXP, o dono reclamou de "áreas em branco por falta de preenchimento". Os quatro
buracos que apareceram, e o que fazer com cada um:

1. **Seção em duas colunas com uma coluna curta.** O título e uma frase de um lado, quatro
   passos do outro: embaixo do título sobra meia tela vazia. Ou o lado curto ganha
   conteúdo (uma foto, o número grande, o botão do WhatsApp, um depoimento), ou o título
   vai para cima, de ponta a ponta, e os itens viram uma grade embaixo.
2. **Grade com item sozinho na última linha.** Cinco depoimentos em duas colunas deixam um
   sozinho. Escolha o número de itens pela grade: 2, 4 ou 6 em duas colunas; 3 ou 6 em
   três. Sobrou um? Ele vira destaque de ponta a ponta, ou sai.
3. **Lista estreita numa tela larga.** As perguntas frequentes em 780 px deixam um terço da
   tela vazio. No computador, divida em duas colunas: à esquerda o título, uma frase e o
   botão do WhatsApp ("não achou a sua dúvida?"), parados com `position: sticky`; à direita,
   as perguntas.
4. **Contato com meia tela vazia.** Texto e botões de um lado; do outro, o horário, a
   região atendida ou uma foto. Nunca o vazio.

A regra que vale para todas: **em 1280 px, nenhum trecho contínuo de 240 px de altura ou
mais pode ter conteúdo em menos de 60% da largura da coluna.** O `olhar_site.mjs` mede
isso e acusa "vazio no computador" com o nome da seção. Texto corrido continua com
`max-width: 65ch`; o que muda é o que fica ao lado dele.

## 11. Conferir com os olhos, e com o script

Sirva a pasta e rode o conferidor de tela, que abre o site no Chrome em 360, 390, 768,
1280 e 1440 px, tira os prints e acusa o que o dono acusaria:

```bash
node scripts/olhar_site.mjs http://localhost:8000 _projeto/prints --lighthouse
```

Ele bloqueia: vazio no computador (item 10), rolagem para o lado, botões empilhados com larguras diferentes, botão
estreito no celular, botão do topo do tamanho do da capa, alvo de toque menor que 40 px,
WhatsApp fora da primeira tela, texto que ficou invisível depois da animação, imagem
quebrada, fonte que não carregou e nota do Lighthouse abaixo de 95. Precisa do Node e do
Google Chrome; sem o Chrome, faça a lista abaixo à mão no navegador, em 390 e 1280 px.

Depois **abra os prints** de 390 e 1280 px (`_projeto/prints/390-primeira-tela.png`,
`390-pagina-inteira.jpg` e os de 1280) e olhe como o cliente olharia:

1. A capa tem foto, título e botão sem rolar?
2. Os botões do celular têm o mesmo tamanho e a mesma largura?
3. Tem um trecho de mais de uma tela só de texto? Ponha uma imagem ou quebre em colunas.
4. Alguma seção ficou vazia, apagada ou com o texto em cima de parte clara da foto?
5. Tire um enfeite antes de dar por pronto.

Defeito visto no print se corrige no CSS e se confere de novo, com o número da versão
trocado (item 9).
6. No print de 1280 px, procure meia tela vazia ao lado de um bloco (item 10).

Opcional, para quem tem o Node: a varredura do
[modern-web-guidance](https://github.com/GoogleChrome/modern-web-guidance) (Apache 2.0,
dos times do Chrome, do Edge, do Firefox e do MDN) acha CSS e JavaScript de jeito antigo:

```bash
npx modern-web-guidance@latest legacy-scan site
npx modern-web-guidance@latest search "scroll driven animation"
```
