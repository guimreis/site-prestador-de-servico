# Imagens: do Instagram para a capa e o antes e depois

Foto de serviço quase sempre é tirada no fim da obra: sem móvel, sem luz boa, com sobra de
material no chão. O cliente final não se encanta. A ideia é usar a foto real como base e
deixar a IA de imagem cuidar do resto, sem inventar um serviço que não foi feito.

## 1. Juntar as fotos

1. Peça ao prestador para baixar de 6 a 10 fotos das melhores obras no Instagram (no
   celular: abrir a foto, os três pontinhos, salvar) e mandar para a pasta `fotos/` do
   projeto. Print da tela também serve.
2. Se ele tiver a foto de antes da mesma obra, melhor ainda: é o antes e depois de verdade.
3. Escolha com ele: uma para a capa e de duas a quatro para o antes e depois.

## 2. Gerar no Google Flow

O Google Flow (labs.google/flow) é a ferramenta de imagem e vídeo do Google. Entra com a
conta Google. Escreva o prompt de cada imagem, pronto para colar, e guie: abrir o Flow,
anexar a foto, colar o prompt, gerar, baixar a melhor para `fotos/geradas/`.

Prompt da capa (adapte o serviço e a cidade):

```
Use a foto anexa como base. É um serviço real de <serviço> feito em <cidade>.
Mantenha o serviço exatamente como está: mesma parede, mesma cor, mesmo acabamento.
Melhore só o ambiente: luz natural de fim de tarde, ambiente limpo e arrumado, alguns móveis
simples e uma planta, sem pessoas e sem texto na imagem.
Formato horizontal 16:9, aparência de foto real de revista de casa, nada de cara de render.
```

Prompt do antes (quando não existe a foto de antes):

```
Use a foto anexa como base, do mesmo ângulo e enquadramento.
Mostre como este ambiente estava antes do serviço de <serviço>: <o problema real, por exemplo
parede manchada, tinta descascando, marca de infiltração>.
Mesma câmera, mesma luz, mesmo lugar. Sem pessoas e sem texto.
```

Regras:
1. O antes e o depois precisam ter o mesmo ângulo. Se não ficar alinhado, gere de novo
   pedindo "exatamente o mesmo enquadramento da foto anexa".
2. O "depois" é a foto real do serviço, só com o ambiente melhorado. Não deixe a IA mudar
   o que o prestador fez.
3. No site, a seção diz que as imagens de antes são ilustrativas quando forem geradas.

## 3. Otimizar para o site

Depois de baixar:
1. Converta para WebP (ou JPG de qualidade 80) com no máximo 1600 px de largura e menos de
   300 KB cada. Use o que existir no computador (`sips` no Mac, `cwebp`, ou Python com
   Pillow) e diga o que usou.
2. Dê nomes que digam o que é: `pintura-fachada-ponta-grossa-depois.webp`.
3. Gere também `previa-site.jpg` em 1200 x 630 para a prévia do link no WhatsApp.
