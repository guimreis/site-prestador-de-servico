# Imagens: o site nunca sai sem foto

Site sem imagem parece rascunho, por melhor que seja o texto. Todo site sai com **pelo
menos três imagens**: a capa, uma do lugar ou do trabalho e uma de detalhe. Ninguém
precisa ter foto boa para isso. Há quatro caminhos, nesta ordem de preferência, e dá para
misturar:

| Caminho | Quando usar | Licença |
|---|---|---|
| 1. Fotos do prestador | Ele tem fotos do trabalho, do lugar ou da equipe | Dele. Confirme que foi ele quem tirou |
| 2. Banco de imagens livre | Faltou foto, ou a dele não presta para capa | A do banco, anotada foto por foto |
| 3. Imagem gerada por IA | Quer uma cena que nenhum banco tem | Termos da ferramenta; marcar como ilustrativa |
| 4. Ilustração feita pelo Claude (SVG) | Sempre dá, mesmo sem internet | Do próprio projeto |

Regra que vale para os quatro: **toda imagem do site tem uma linha em
`_projeto/imagens.md`** com o arquivo, de onde veio, o autor, a licença e o link da
página original. Sem essa linha, a imagem não entra.

## O que nunca entra

1. Foto de pessoa apresentada como cliente, paciente ou equipe quando não é. Modelo de
   banco de imagem não vira "nossa paciente".
2. Antes e depois inventado, ou gerado por IA, de profissão com conselho de classe. Veja
   [profissoes-com-conselho.md](profissoes-com-conselho.md).
3. Imagem com marca de terceiro visível (logo de fabricante, nome de outra clínica na
   parede, embalagem com marca). Recorte ou escolha outra.
4. Imagem puxada direto do site do banco (`<img src="https://...">`). Baixe para
   `site/img/`: a política de segurança do site bloqueia imagem de fora, e o banco pode
   apagar a foto amanhã.
5. Foto do Google Imagens, do Instagram de outra pessoa ou de concorrente.

## Caminho 1. Fotos do prestador

1. Peça de 6 a 10 fotos: do trabalho pronto, do lugar (fachada, sala, ferramenta), dele
   trabalhando. Do Instagram serve: abrir a foto, os três pontinhos, salvar.
2. Guarde em `fotos/originais/`. Essa pasta nunca vai para a internet.
3. Foto escura ou torta: dá para salvar no Google Flow com o prompt do caminho 3,
   pedindo para manter o serviço exatamente como está e melhorar só a luz e o ambiente.

## Caminho 2. Banco de imagens livre

Use só bancos em que a licença aparece em cada foto. Em ordem:

1. **Openverse** (openverse.org). Junta Wikimedia Commons, Flickr, StockSnap, Rawpixel e
   outros, e mostra a licença de cada foto. Tem uma API sem cadastro, que o Claude consegue
   usar sozinho:

   ```bash
   curl -s "https://api.openverse.org/v1/images/?q=dental%20chair&license=cc0,pdm,by,by-sa&license_type=commercial,modification&size=large&page_size=20"
   ```

   Cada resultado traz `url` (o arquivo), `foreign_landing_url` (a página da foto),
   `creator` (o autor), `license` e `license_version`. Pesquise em inglês: acha muito mais.
2. **Wikimedia Commons** (commons.wikimedia.org). A licença está na página de cada arquivo.
3. **Unsplash** e **Pexels**. Fotos bonitas e de uso livre, mas a busca automática deles
   pede cadastro. Quando a busca automática falha, o prestador abre o site, escolhe, baixa para
   `fotos/originais/` e copia o link da página da foto para o Claude anotar.

Como ler a licença:

| Licença | Pode usar no site? | O que precisa fazer |
|---|---|---|
| CC0, Domínio público (PDM) | Sim | Nada. Anote mesmo assim |
| CC BY | Sim | Crédito no rodapé: autor, licença e link |
| CC BY-SA | Sim, com cuidado | Crédito, e a foto editada sai com a mesma licença |
| Licença Unsplash ou Pexels | Sim | Nada obrigatório; crédito é gentileza |
| CC BY-NC, BY-ND, "uso editorial", sem licença | Não | Escolha outra |

Como escolher:
1. Busque pelo **lugar e pelos objetos** do serviço: "dental chair",
   "paint roller wall", "electrician tools", "law books desk", "kitchen cleaning". Foto de
   objeto e de ambiente envelhece bem e não engana ninguém. Gente sorrindo
   para a câmera fica de fora.
2. Baixe primeiro uma miniatura de 20 a 40 candidatas, monte uma folha de contato e olhe
   antes de escolher. Descarte foto velha, escura, com marca ou de outro país óbvio
   (tomada, placa e carro denunciam).
3. Para a capa, foto horizontal com pelo menos 1600 px de largura e um lado calmo, onde o
   título pode encostar.
4. Mostre as escolhidas ao prestador antes de montar o site.

## Caminho 3. Imagem gerada por IA

Serve para a cena que nenhum banco tem. O Google Flow (labs.google/flow) entra com a conta
Google; outras ferramentas servem. O Claude escreve o prompt, o prestador cola, gera e
baixa para `fotos/geradas/`.

Prompt para melhorar uma foto real:

```
Use a foto anexa como base. É um serviço real de <serviço> feito em <cidade>.
Mantenha o serviço exatamente como está. Melhore só o ambiente: luz natural, ambiente
limpo e arrumado, sem pessoas e sem texto na imagem. Formato horizontal 16:9, aparência de
foto real, nada de cara de render.
```

Prompt para uma cena do zero:

```
Foto realista de <ambiente ou objeto do serviço> em <tipo de lugar no Brasil>, luz natural
de manhã, sem pessoas, sem texto, sem logotipo. Formato horizontal 16:9, enquadramento com
espaço vazio do lado esquerdo.
```

Regras:
1. Imagem gerada nunca mostra o resultado de um serviço como se fosse real. No site, a
   legenda ou o rodapé diz "imagem ilustrativa".
2. Antes e depois: só com fotos reais. A IA pode arrumar a luz, nunca o serviço.
3. Anote em `_projeto/imagens.md` a ferramenta, a data e o prompt.

## Caminho 4. Ilustração feita pelo Claude

Quando não há internet, banco ou paciência, o Claude desenha em SVG: um motivo do ofício
(o rolo de pintura, o raio, a folha de uma árvore da cidade), um mapa simples dos bairros
atendidos ou ícones dos serviços. Fica leve, nítido em qualquer tela e sem problema de
licença. Use em um lugar, com uma ou duas cores da paleta; ilustração espalhada pela página
inteira vira enfeite.

## Otimizar para o site

1. Recorte e reduza: capa com 1600 px de largura, as outras com 1000 a 1200 px. Converta
   para WebP (qualidade 75 a 80) ou JPG de qualidade 80. Cada uma abaixo de 300 KB, a capa
   de preferência abaixo de 200 KB.
2. Use o que existir no computador e diga o que usou: `cwebp`, `sips` no Mac, ou Python com
   Pillow (`pip install pillow`).
3. Nomes que dizem o que é: `consultorio-cadeira-juiz-de-fora.webp`.
4. Gere `previa-site.jpg` em 1200 x 630 para a prévia do link no WhatsApp.
5. No HTML, toda imagem tem `alt` descritivo, `width` e `height`. A capa carrega na hora;
   as outras, com `loading="lazy"`.
6. **A capa em dois tamanhos**: 800 px de largura (até 80 KB, a do celular) e 1600 px, ou
   a maior que a foto tiver (até 200 KB, a do computador), com `srcset` e `sizes="100vw"`
   (a capa é de ponta a ponta, [design.md](design.md) item 2). O celular de teste do
   Lighthouse tem tela de 412 px com densidade 1,75: ele pede 721 px e fica com a de 800.
   Uma versão de 720 px perde por 1 px, e o celular baixa a grande.
7. **Foto nunca vai como fundo no CSS** (`background: url(...)`). Fundo de CSS não espera a
   rolagem: baixa junto com a capa e atrasa a primeira tela. Para uma faixa com foto atrás
   do texto, use um `<img loading="lazy">` dentro da seção, com `position: absolute` e
   `object-fit: cover`, e o texto por cima.

## O arquivo `_projeto/imagens.md`

```markdown
| Arquivo no site | Caminho | Autor | Licença | Página original |
|---|---|---|---|---|
| img/capa.webp | Banco (Wikimedia) | Fulano de Tal | CC BY 4.0 | https://commons.wikimedia.org/... |
| img/detalhe.webp | Banco (StockSnap) | Ciclano | CC0 | https://stocksnap.io/... |
| img/ipe.svg | Ilustração do Claude | projeto | do projeto | - |
```

Toda licença CC BY ou CC BY-SA da tabela vira uma linha de crédito no rodapé do site.
