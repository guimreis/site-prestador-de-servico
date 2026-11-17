# Os arquivos que deixam o site legível para o Google e as IAs

Troque `SEU-SITE.pages.dev` pelo endereço de verdade assim que ele existir (depois da
primeira publicação, ou do domínio próprio). Endereço errado nesses arquivos manda o robô
para um lugar que não existe.

## 1. No `<head>` do `index.html`

```html
<html lang="pt-BR">
<title>Pintor em Ponta Grossa | Nome do Prestador</title>          <!-- até 60 caracteres -->
<meta name="description" content="...">                            <!-- até 155 caracteres -->
<link rel="canonical" href="https://SEU-SITE.pages.dev/">
<meta property="og:type" content="website">
<meta property="og:locale" content="pt_BR">
<meta property="og:title" content="...">
<meta property="og:description" content="...">
<meta property="og:url" content="https://SEU-SITE.pages.dev/">
<meta property="og:image" content="https://SEU-SITE.pages.dev/img/previa-site.jpg">
<meta name="twitter:card" content="summary_large_image">
```

Nunca `<meta name="robots" content="noindex">`.

## 2. Dados estruturados (JSON-LD), também no `<head>`

Use o tipo mais específico do schema.org para o serviço: `HousePainter`, `Electrician`,
`Plumber`, `Locksmith`, `RoofingContractor`, `GeneralContractor`, `HVACBusiness`,
`Dentist`, `AccountingService`, `LegalService`, `HairSalon`, `AutoRepair`. Não achou? Use
`LocalBusiness`.

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "HousePainter",
      "@id": "https://SEU-SITE.pages.dev/#negocio",
      "name": "Nome do Prestador",
      "description": "Uma frase sobre o serviço e a região.",
      "url": "https://SEU-SITE.pages.dev/",
      "image": "https://SEU-SITE.pages.dev/img/previa-site.jpg",
      "telephone": "+5542999999999",
      "sameAs": ["https://www.instagram.com/usuario/"],
      "areaServed": [
        {"@type": "City", "name": "Ponta Grossa"},
        {"@type": "City", "name": "Castro"}
      ],
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Serviços",
        "itemListElement": [
          {"@type": "Offer", "itemOffered": {"@type": "Service", "name": "Pintura de fachada"}}
        ]
      }
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        {"@type": "Question", "name": "Mesma pergunta da página",
         "acceptedAnswer": {"@type": "Answer", "text": "Mesma resposta da página."}}
      ]
    }
  ]
}
</script>
```

1. As perguntas do JSON-LD são idênticas às da página.
2. Quem atende na casa do cliente não põe endereço: usa só `areaServed`. Quem recebe o
   cliente (consultório, escritório, salão) põe o `address` completo, igual ao do perfil
   do Google.

## 3. `robots.txt`

```
User-agent: *
Allow: /

User-agent: GPTBot
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Claude-SearchBot
Allow: /

User-agent: Claude-User
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Applebot-Extended
Allow: /

Sitemap: https://SEU-SITE.pages.dev/sitemap.xml
```

## 4. `sitemap.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://SEU-SITE.pages.dev/</loc><lastmod>AAAA-MM-DD</lastmod></url>
</urlset>
```

## 5. `llms.txt`

Um resumo em Markdown para as IAs lerem rápido: nome, uma frase, serviços, região, como
pedir orçamento (com o link do WhatsApp) e links (site e Instagram). Mesmo texto do site,
mais curto.

## 6. `_headers` (cabeçalhos de segurança, lidos pela Cloudflare)

```
/*
  Strict-Transport-Security: max-age=31536000
  Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; base-uri 'self'; form-action 'none'; frame-ancestors 'none'
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
```

Com essa política, CSS e JavaScript ficam em arquivos separados (`style.css`, `app.js`),
nunca dentro do HTML. O JSON-LD pode ficar no HTML: o navegador não executa esse bloco.

## 7. `404.html`

Uma página curta com o nome, uma frase e o botão do WhatsApp.
