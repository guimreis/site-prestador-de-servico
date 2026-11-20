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
   cidade. Uma de fundo, uma de texto, uma de destaque, uma de apoio, e o verde do
   WhatsApp só no botão.
3. **Fonte**: uma família com personalidade para títulos (veja o item 3) e a do sistema ou
   a mesma para o texto.
4. **A capa**: como o título, a foto e o botão se arrumam no celular e no computador.
   Desenhe em ASCII.
5. **O que esta página não vai ter**: os clichês da lista do item 6 que ela evita.

Depois de escrever, pergunte: um site de outro prestador da mesma profissão sairia igual?
Se sim, troque a ideia ou as cores.

## 2. As peças que todo site tem

1. **Capa com foto**. No celular: a foto em cima, de ponta a ponta, com 55 a 65% da altura
   da tela, e o título logo abaixo. No computador: duas colunas, o texto de um lado e a foto
   grande do outro, encostando na borda da tela. O botão do WhatsApp aparece sem rolar a
   página nas duas.
2. **Pelo menos três imagens** na página (a capa, o lugar ou o trabalho, um detalhe). Veja
   [imagens.md](imagens.md).
3. **Ritmo de seções**: alterne fundo claro e uma faixa de cor (uma ou duas na página). Seção com foto ao lado do texto quebra a coluna única.
4. **Serviços em lista arrumada**, não seis cartões iguais com sombra. Duas colunas no
   computador, título curto e uma linha de explicação.
5. **Passos numerados só onde é sequência de verdade** (como funciona).
6. **Botão flutuante do WhatsApp no celular**, que some no computador.
7. **Rodapé com tudo o que identifica**: nome, registro no conselho (quando houver),
   endereço ou região, créditos das imagens com licença CC BY.

## 3. Fonte própria, sem carregar nada de fora

A regra de não carregar nada de fora continua: o arquivo da fonte vai dentro de
`site/fontes/`. Use fonte de licença livre (SIL Open Font License), que pode ir junto com
o site.

Como baixar, com o Node.js que a skill já pede:

```bash
mkdir -p _projeto/tmp && cd _projeto/tmp
npm pack @fontsource-variable/bricolage-grotesque
tar -xzf fontsource-variable-bricolage-grotesque-*.tgz
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
6. Foco visível no teclado (`:focus-visible`) e `prefers-reduced-motion` respeitado.
7. Imagem com `object-fit: cover` e `aspect-ratio` definido, para não pular na tela
   quando carrega.

## 5. Movimento

No máximo um: a capa entrando quando a página abre, ou nada. Animação em cada seção que
aparece na rolagem é o primeiro sinal de site feito por IA.

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

## 7. Conferir com os olhos

Abra o site no navegador em 390 px de largura (celular) e em 1280 px (computador). Tire um
print de cada e olhe antes de mostrar ao prestador:

1. A capa tem foto, título e botão sem rolar?
2. Alguma coisa vaza para o lado no celular? (rolagem horizontal é defeito)
3. Tem um trecho de mais de uma tela só de texto? Ponha uma imagem ou quebre em colunas.
4. Tire um enfeite antes de dar por pronto.
