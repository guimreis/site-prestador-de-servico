# Seu site no ar, de graça, para o cliente e a IA te encontrarem

Guia para quem presta serviço (pintor, eletricista, diarista, dentista, contador, advogado,
personal) e nunca fez um site. No fim você tem:

1. Um site de uma página, bonito no celular, com o botão do seu WhatsApp.
2. O site no ar, de graça, num endereço como `seunegocio.pages.dev`.
3. O site pronto para o Google, o Bing e as IAs (ChatGPT, Claude, Perplexity) lerem e
   indicarem você para quem procura o seu serviço na sua região.

Quem faz o trabalho pesado é o Claude, com a skill deste repositório. Você responde
perguntas, manda fotos e clica em alguns botões. Separe uma hora, com calma.

---

## Antes de começar: o que você precisa ter

1. Um computador (Mac ou Windows). Pelo celular não dá.
2. Uma assinatura paga do Claude (plano Pro ou acima), em claude.ai.
3. Uma conta Google, para gerar as imagens.
4. O número do seu WhatsApp e o @ do seu Instagram.
5. De 6 a 10 fotos dos seus melhores serviços. As do Instagram servem.

Regra de ouro: **travou em qualquer passo, tire um print da tela e mande para o Claude**,
escrevendo "travei aqui, me ajuda". Sempre funciona melhor do que tentar adivinhar.

---

## Passo 1. Instale o Claude no computador

1. Entre em claude.ai/download e baixe o aplicativo para o seu computador. Cuidado com
   anúncio: o endereço certo é claude.ai.
2. Instale como qualquer programa e entre com a sua conta.

## Passo 2. Crie uma pasta para o site

1. Na sua Mesa (Área de Trabalho), crie uma pasta chamada `meu-site`.
2. Coloque nela as fotos dos seus serviços e o seu logo, se tiver.

Tudo o que o Claude fizer vai ficar dentro dessa pasta.

## Passo 3. Abra o Claude no modo Code

1. Abra o aplicativo do Claude.
2. Lá em cima, clique em **Code**.
3. Escolha a pasta `meu-site`.

Se aparecer algum erro, mande print para o Claude, no modo Chat, e peça ajuda.

## Passo 4. Instale a skill

Skill é um manual que um especialista escreveu e o Claude segue. Esta aqui ensina o Claude a
fazer o seu site do jeito certo. Copie e cole esta mensagem no Claude:

```
Instale para mim a skill site-prestador-de-servico com o comando
npx skills add guimreis/site-prestador-de-servico -g -y
e depois as skills que ela pede. Eu nunca fiz isso: me guie um passo de cada vez
e espere eu dizer "feito" antes de passar para o próximo.
```

Se ele disser que falta o Node.js, deixe ele te guiar na instalação. Quando terminar,
feche e abra o Claude de novo.

## Passo 5. Peça o site

Cole no Claude:

```
Quero um site para o meu negócio. Use a skill site-prestador-de-servico.
Eu não entendo nada de site: me pergunte o que precisar, uma coisa por vez.
```

O Claude vai te entrevistar: o serviço, a cidade, as cidades que você atende, o seu
WhatsApp, o seu Instagram e o que faz o cliente escolher você. Responda do seu jeito, como
você falaria com um cliente. Pode responder com áudio: clique no microfone e fale.

## Passo 6. Deixe ele pesquisar a concorrência

O Claude procura os sites que mais aparecem na sua cidade, nas cidades vizinhas e na capital
mais próxima. Ele te mostra quanto a briga é dura na sua região e o que os melhores fazem.
Você só lê e diz se concorda.

## Passo 7. Faça as imagens no Google Flow

O Claude escreve um texto pronto (o "prompt") para cada imagem: a capa do site e o antes e
depois dos seus serviços.

1. Entre em labs.google/flow com a sua conta Google.
2. Anexe a foto que o Claude indicar.
3. Cole o prompt que ele escreveu.
4. Gere, escolha a que ficou melhor e baixe.
5. Coloque na pasta `meu-site/fotos/geradas` e avise o Claude.

Se não quiser mexer com imagem agora, diga a ele. O site sai com as suas fotos como estão.

## Passo 8. Veja o site antes de publicar

O Claude abre o site no navegador. Olhe no computador e, se ele te mostrar como, no celular
também. Não gostou de algo? Diga como diria a uma pessoa: "o botão está pequeno", "tira essa
frase", "essa foto não". Peça uma mudança por vez.

## Passo 9. Crie a conta grátis na Cloudflare

A Cloudflare é a empresa que vai guardar o seu site e mostrar para quem visitar. Para um site
deste tamanho, é de graça.

1. Entre em dash.cloudflare.com/sign-up.
2. Crie a conta com e-mail e senha e confirme o e-mail que eles mandarem.
3. Ligue a verificação em duas etapas. Proteger a conta é proteger o seu site.

A senha é sua. Nunca digite a senha para o Claude.

## Passo 10. Publique

Diga ao Claude:

```
Pode publicar o site na Cloudflare.
```

Ele vai abrir uma página no navegador pedindo autorização. Entre na sua conta da Cloudflare
e clique em **Allow** (Autorizar). Pronto: ele publica e te passa o endereço do seu site.

Abra o endereço no celular. O seu site está no ar.

Se travar, o Claude conhece o plano B: você mesmo arrasta a pasta do site para dentro da
Cloudflare, e ele te guia clique a clique.

## Passo 11 (opcional). Seu endereço .com.br

O endereço `.pages.dev` é grátis e funciona. Se você quiser `seunegocio.com.br`:

1. Peça ao Claude: "Quero um domínio .com.br, me guie no Registro.br."
2. A compra é no registro.br, em reais, com Pix ou boleto. Segundo a
   [tabela do Registro.br](https://registro.br/dominio/precos/), custa R$ 40,00 por ano.
   Precisa de CPF ou CNPJ.
3. O Claude te guia para ligar o domínio na Cloudflare. Pode levar até um dia para começar
   a funcionar.

## Passo 12. Faça o Google e as IAs saberem que você existe

Site no ar é metade do caminho. Peça ao Claude para te guiar, um de cada vez, nestes
cadastros grátis:

1. Perfil da Empresa no Google. É o que mais pesa para aparecer no mapa da sua cidade.
2. Bing Places. O Bing alimenta parte das buscas do ChatGPT e do Copilot.
3. Apple Business Connect, para quem usa iPhone.
4. O link do site na bio do Instagram e no perfil do WhatsApp Business.
5. Peça avaliação no Google para os seus últimos clientes.

Use o mesmo nome, o mesmo telefone e a mesma região em todos os lugares.

---

## Para mudar o site depois

Abra o Claude no modo Code, na mesma pasta `meu-site`, e diga o que quer mudar. No fim,
diga "publica de novo". Antes de fechar, peça: "anota o que fizemos e o que falta". Ele
grava um arquivo de retomada na pasta, e da próxima vez você começa por ele.

## O que tem neste repositório

- `skills/site-prestador-de-servico/SKILL.md`: o manual que o Claude segue.
- `references/`: a pesquisa regional, as imagens, o texto, os arquivos para as IAs e a
  publicação.
- `scripts/revisar_textos.py`: o detector de texto com cara de IA.

A skill se apoia em outras skills públicas, cada uma com os seus autores: `grill-me`
(Matt Pocock), `find-skills` (Vercel), `frontend-design` (Anthropic), `seo-local`
(AgriciDaniel) e `copywriting` e `copy-editing` (Corey Haines).

## Quem fez

Feito por Guilherme Reis. Ensino empresários e profissionais a trabalhar com IA no dia a dia.

- Instagram: [@guilhermereis.ai](https://www.instagram.com/guilhermereis.ai/)
- Comunidade no WhatsApp, com aula ao vivo toda segunda: [entrar no grupo](https://chat.whatsapp.com/LncD1JNhpog7246d8waj74)
