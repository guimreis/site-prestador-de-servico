# O texto do site

Duas fontes se somam aqui:
1. A revisão de texto de Guilherme Reis, que caça estrutura de frase com cara de IA. O
   catálogo está em [padroes-de-ia.md](padroes-de-ia.md), e o detector em
   `scripts/revisar_textos.py`.
2. As skills `copywriting` e `copy-editing`, do pacote marketingskills de Corey Haines
   (github.com/coreyhaines31/marketingskills, licença MIT), que dão a estrutura de página que
   vende e as sete revisões.

Quando as duas discordarem, vale a primeira.

## A voz

O site fala como o prestador fala com o cliente no WhatsApp. Leia as respostas dele no
briefing e as legendas do Instagram: se ele escreve "a gente", "orçamento sem
compromisso", "capricho", essas palavras entram. Site de pintor não fala como banco.

## Escrever (copywriting)

1. Título (o `h1`): o serviço, a cidade e o resultado, em linguagem de cliente.
   Exemplo: "Pintura em Ponta Grossa com a obra limpa e entregue no prazo".
2. Uma frase embaixo dizendo para quem é e o que acontece quando chama.
3. Botão: "Pedir orçamento no WhatsApp". O botão diz o que acontece.
4. Cada seção defende uma ideia só.
5. Para cada frase, as três perguntas da `copywriting`: o cliente consegue imaginar? Dá
   para provar? Um concorrente poderia escrever a mesma frase? Se o concorrente poderia,
   reescreva com o que só esse prestador tem.
6. Número, avaliação ou depoimento só se o prestador confirmar. Faltou prova? Marque
   `[FALTA: ...]` e pergunte. Nunca invente.

## Revisar (copy-editing e o detector)

1. Passe as sete revisões da `copy-editing` (clareza, voz, "e daí?", prova,
   especificidade, emoção, risco zero).
2. Rode o detector:

```bash
python3 scripts/revisar_textos.py site/index.html
```

3. Tudo de peso 3 sai. O teste da antítese negada: apague a metade negativa ("não é só
   pintar, é...") e leia o que sobrou. Se a frase fica de pé, a metade negativa era enfeite.
4. Nas perguntas frequentes, pergunta seguida de resposta é o formato certo, e o detector
   já ignora esse bloco.

## Palavras da região

As palavras que a pesquisa regional achou entram em três lugares: o título, o primeiro
parágrafo e as perguntas frequentes. Uma vez em cada. Repetir a cidade dez vezes não ajuda e
deixa o texto esquisito.
