# Publicar na Cloudflare, de graça

A Cloudflare Pages guarda os arquivos do site e entrega para quem visita, com HTTPS e
proteção contra ataque, sem custo para um site deste tamanho. O código fica lá mesmo: não
precisa de GitHub.

Senha, código de verificação e o clique em "Autorizar" são sempre do prestador. O Claude
nunca digita senha.

## Plano A: o Claude Code publica

1. **Conta.** O prestador cria a conta grátis em dash.cloudflare.com/sign-up (e-mail e
   senha, depois confirma o e-mail). Diga para ligar a verificação em duas etapas assim que
   entrar.
2. **Node.js.** Confira com `node -v`. Se não tiver, guie a instalação (nodejs.org, versão
   LTS) e peça para fechar e abrir o Claude depois.
3. **Login.** Rode `npx wrangler login`. O navegador abre: o prestador entra na conta e
   clica em **Allow** (Autorizar). Confira com `npx wrangler whoami`.
4. **Projeto.** O nome do projeto é o endereço: `nome-do-negocio.pages.dev`. Só letras minúsculas,
   números e hífen. Crie com:

```bash
npx wrangler pages project create nome-do-negocio --production-branch main
```

   Se o nome já existir, a Cloudflare recusa: escolha outro com a cidade no fim
   (`nome-do-negocio-pg`).
5. **Publicar.** Da pasta do projeto, publique só a pasta do site:

```bash
npx wrangler pages deploy site --project-name nome-do-negocio
```

6. **Conferir.** O comando devolve o endereço. Abra `https://nome-do-negocio.pages.dev`,
   confira no celular e confira os cabeçalhos:

```bash
curl -sI https://nome-do-negocio.pages.dev | grep -i -E "content-security|strict-transport"
```

7. **Endereço definitivo nos arquivos.** Troque `SEU-SITE.pages.dev` pelo endereço real
   no `index.html`, `robots.txt`, `sitemap.xml` e `llms.txt`, e publique de novo (passo 5).

Para atualizar o site depois, é sempre o passo 5.

## Plano B: arrastar a pasta

Se o plano A travar em qualquer passo:

1. Entrar em dash.cloudflare.com.
2. No menu, **Workers e Pages** (Workers & Pages), depois **Criar** (Create).
3. Escolher **Pages** e a opção de enviar arquivos (**Upload assets**).
4. Dar o nome do projeto e arrastar a pasta `site` inteira.
5. **Implantar** (Deploy). O endereço aparece no fim.

A tela da Cloudflare muda de tempos em tempos. Se não achar um botão, tire um print e mande
para o Claude.

## Opcional: domínio próprio (.com.br) no Registro.br

Só depois que o site estiver no ar no endereço `.pages.dev`.

1. Em registro.br, pesquisar o nome. Se estiver livre, comprar. Segundo a
   [tabela do Registro.br](https://registro.br/dominio/precos/), custa R$ 40,00 por ano
   (conferido em 17/11/2026). Precisa de CPF ou CNPJ e paga com Pix ou boleto.
2. Na Cloudflare, **Adicionar um domínio** (Add a domain), digitar o domínio, escolher o
   plano **Free**. A Cloudflare mostra dois **servidores DNS** (nameservers), algo como
   `ana.ns.cloudflare.com`.
3. No Registro.br, abrir o domínio, **Alterar servidores DNS** e colar os dois da
   Cloudflare. Pode levar de algumas horas a um dia para valer.
4. Quando a Cloudflare disser que o domínio está ativo: no projeto em Workers e Pages,
   **Domínios personalizados** (Custom domains), adicionar `seudominio.com.br` e
   `www.seudominio.com.br`.
5. Trocar o endereço nos arquivos (passo 7 do plano A) pelo domínio novo e publicar de novo.
