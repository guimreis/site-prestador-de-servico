#!/usr/bin/env python3
"""
Confere a pasta `site/` antes de publicar. So le, a menos que receba --endereco.

Uso:
    conferir_site.py site/                                  confere
    conferir_site.py site/ --endereco https://x.pages.dev   troca PREENCHER-ENDERECO e confere

Bloqueia (saida 1):
  1. [PREENCHER: ...] em qualquer arquivo: falta um dado que so o prestador tem.
  2. Arquivo que nao e do site dentro de site/ (briefing, pesquisa, .md, fotos originais).
  3. noindex em qualquer lugar.
  4. Fonte, script, estilo ou imagem carregados de outro site.
  5. Imagem sem alt, width ou height, imagem que nao existe, ou arquivo de imagem acima de 300 KB.
  6. Mais de um h1, ou nenhum.
  7. JSON-LD que nao abre, ou perguntas do FAQPage diferentes das da pagina.
  8. <style> ou <script> dentro do HTML (a politica de seguranca do _headers bloqueia).
  9. Foto como fundo no CSS (url(...jpg/webp/png)): baixa antes da primeira tela.
 10. Arquivo de fonte acima de 60 KB: atrasa o titulo no celular.
 12. index.html sem <link rel="icon">: o navegador pede /favicon.ico, leva 404 e o
     Lighthouse tira ponto de boas praticas.
 11. Video acima de 1,5 MB, ou <video> sem muted e playsinline (com som ou fora do lugar no iPhone).

Avisa (nao bloqueia): CSS ou JavaScript sem numero de versao (style.css?v=1), e
PREENCHER-ENDERECO, o endereco que so existe depois da primeira
publicacao. Publique, rode de novo com --endereco e publique outra vez.
"""

import argparse
import html as _html
import json
import os
import re
import sys

LIMITE_IMAGEM = 300 * 1024
LIMITE_FONTE = 60 * 1000
LIMITE_VIDEO = 1500 * 1000
RE_FUNDO_FOTO = re.compile(r"url\(\s*[\"']?([^)\"']+\.(?:jpe?g|png|webp|avif|gif))", re.I)
EXT_DO_SITE = {".html", ".css", ".js", ".txt", ".xml", ".json", ".webmanifest",
               ".jpg", ".jpeg", ".png", ".webp", ".avif", ".svg", ".ico", ".gif",
               ".woff2", ".woff", ".mp4", ".webm"}
NOMES_DO_SITE = {"_headers", "_redirects"}
NOMES_PROIBIDOS = re.compile(r"(?i)briefing|pesquisa|retomada|perguntas|credito|rascunho|\.md$")
RE_PREENCHER = re.compile(r"\[PREENCHER:\s*([^\]]+)\]")
RE_ENDERECO = re.compile(r"https?://PREENCHER-ENDERECO/?")
LINKS_LIVRES = re.compile(r"(?i)^(https?://(wa\.me|api\.whatsapp\.com|www\.instagram\.com|instagram\.com|"
                          r"maps\.app\.goo\.gl|www\.google\.com/maps|g\.page)|mailto:|tel:|#)")


def arquivos(site):
    for raiz, dirs, nomes in os.walk(site):
        dirs[:] = [d for d in dirs if not d.startswith(".")]
        for n in nomes:
            if not n.startswith("."):
                yield os.path.join(raiz, n)


def texto_de(caminho):
    try:
        with open(caminho, encoding="utf-8") as fh:
            return fh.read()
    except (UnicodeDecodeError, OSError):
        return None


def limpa(t):
    return " ".join(_html.unescape(re.sub(r"<[^>]+>", " ", t)).split())


def confere_html(caminho, site, erros, avisos):
    html = texto_de(caminho) or ""
    nome = os.path.relpath(caminho, site)
    if nome == "index.html":
        h1 = len(re.findall(r"<h1\b", html, re.I))
        if h1 != 1:
            erros.append("%s: %d h1 (precisa de exatamente um)" % (nome, h1))
        if not re.search(r"<link\b[^>]*rel=\"[^\"]*icon[^\"]*\"", html, re.I):
            erros.append("%s: sem <link rel=\"icon\" href=\"img/icone.png\">. Sem ele o navegador "
                         "pede /favicon.ico, leva 404 e o Lighthouse tira ponto." % nome)
    if re.search(r"<style\b", html, re.I):
        erros.append("%s: <style> dentro do HTML. Mova para style.css." % nome)
    for m in re.finditer(r"<script\b([^>]*)>", html, re.I):
        if "ld+json" not in m.group(1) and "src=" not in m.group(1):
            erros.append("%s: <script> dentro do HTML. Mova para app.js." % nome)
    for m in re.finditer(r"<(?:link|script)\b[^>]*?(?:href|src)=\"([^\"]+\.(?:css|js))\"", html, re.I):
        if not re.match(r"(?i)https?://", m.group(1)):
            avisos.append("%s: %s sem numero de versao. Use %s?v=1 e suba a cada mudanca, "
                          "senao o navegador mostra a versao velha." % (nome, m.group(1), m.group(1)))
    for m in re.finditer(r"<video\b[^>]*>", html, re.I):
        falta = [a for a in ("muted", "playsinline") if not re.search(r"\s%s(\s|=|>)" % a, m.group(0), re.I)]
        if falta:
            erros.append("%s: <video> sem %s. Video da capa e mudo e toca no lugar, no celular tambem." % (nome, " e ".join(falta)))
    if re.search(r"\sstyle=\"", html, re.I):
        erros.append("%s: atributo style= no HTML. A politica de seguranca bloqueia; use classe." % nome)

    for m in re.finditer(r"<(link|script|img|source|iframe)\b[^>]*?(?:href|src|srcset)=\"([^\"]+)\"", html, re.I):
        tag, url = m.group(1).lower(), m.group(2)
        if tag == "link" and re.search(r"rel=\"(canonical|alternate)\"", m.group(0), re.I):
            continue
        if re.match(r"(?i)https?://", url) and not RE_ENDERECO.match(url):
            erros.append("%s: <%s> carrega de fora do site: %s" % (nome, tag, url[:90]))

    for m in re.finditer(r"<img\b[^>]*>", html, re.I):
        tag = m.group(0)
        src = re.search(r"src=\"([^\"]+)\"", tag)
        # alt="" e valido (imagem decorativa); width e height precisam de valor
        falta = [a for a in ("alt", "width", "height")
                 if not re.search(r"\s%s=\"%s" % (a, "" if a == "alt" else "[^\"]"), tag)]
        alvo = src.group(1) if src else "(sem src)"
        if falta:
            erros.append("%s: imagem %s sem %s" % (nome, alvo, ", ".join(falta)))
        if src and not re.match(r"(?i)https?:|data:", alvo):
            base = site if alvo.startswith("/") else os.path.dirname(caminho)
            if not os.path.isfile(os.path.join(base, alvo.split("?")[0].lstrip("/"))):
                erros.append("%s: imagem %s nao existe na pasta" % (nome, alvo))

    blocos = re.findall(r"<script[^>]*ld\+json[^>]*>(.*?)</script>", html, re.S | re.I)
    perguntas_ld = []
    for b in blocos:
        try:
            dado = json.loads(b)
        except ValueError as e:
            erros.append("%s: JSON-LD nao abre (%s)" % (nome, e))
            continue
        itens = dado.get("@graph", [dado]) if isinstance(dado, dict) else dado
        for it in itens:
            if isinstance(it, dict) and it.get("@type") == "FAQPage":
                for q in it.get("mainEntity", []):
                    perguntas_ld.append((q.get("name", "").strip(),
                                         q.get("acceptedAnswer", {}).get("text", "").strip()))
    perguntas_pagina = [(limpa(s), limpa(r)) for s, r in re.findall(
        r"<details\b[^>]*>\s*<summary[^>]*>(.*?)</summary>(.*?)</details>", html, re.S | re.I)]
    if perguntas_ld and perguntas_ld != perguntas_pagina:
        so_ld = [q for q, _ in perguntas_ld if q not in [p for p, _ in perguntas_pagina]]
        erros.append("%s: perguntas do JSON-LD diferentes das da pagina%s" %
                     (nome, (": " + "; ".join(so_ld[:3])) if so_ld else " (resposta ou ordem)"))


def main():
    ap = argparse.ArgumentParser(description="Confere a pasta do site antes de publicar")
    ap.add_argument("site", help="a pasta site/ do projeto")
    ap.add_argument("--endereco", help="endereco definitivo, ex.: https://nome.pages.dev")
    args = ap.parse_args()

    site = os.path.abspath(args.site)
    if not os.path.isfile(os.path.join(site, "index.html")):
        print("Nao achei %s/index.html. Passe a pasta site/ do projeto." % site, file=sys.stderr)
        return 2

    if args.endereco:
        novo = args.endereco.rstrip("/") + "/"
        if not re.match(r"https://[a-z0-9.-]+\.[a-z]{2,}/$", novo):
            print("Endereco invalido: %s" % args.endereco, file=sys.stderr)
            return 2
        trocados = 0
        for c in arquivos(site):
            t = texto_de(c)
            if t and RE_ENDERECO.search(t):
                with open(c, "w", encoding="utf-8") as fh:
                    fh.write(RE_ENDERECO.sub(novo, t))
                trocados += 1
        print("Endereco trocado em %d arquivo(s) para %s" % (trocados, novo))

    erros, avisos = [], []
    for c in arquivos(site):
        rel = os.path.relpath(c, site)
        base = os.path.basename(c)
        ext = os.path.splitext(base)[1].lower()
        if NOMES_PROIBIDOS.search(base) or (ext not in EXT_DO_SITE and base not in NOMES_DO_SITE):
            erros.append("%s: nao e arquivo do site. Tire de site/ (vai para _projeto/)." % rel)
        if ext in {".mp4", ".webm"} and os.path.getsize(c) > LIMITE_VIDEO:
            erros.append("%s: video com %d KB (limite 1500). Encurte o loop ou suba o crf no ffmpeg." % (rel, os.path.getsize(c) // 1000))
        if ext in {".woff2", ".woff"} and os.path.getsize(c) > LIMITE_FONTE:
            erros.append("%s: fonte com %d KB (limite 60). Use o arquivo latin-wght-normal." % (rel, os.path.getsize(c) // 1000))
        if ext in {".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif"} and os.path.getsize(c) > LIMITE_IMAGEM:
            erros.append("%s: %d KB (limite 300 KB)" % (rel, os.path.getsize(c) // 1024))
        t = texto_de(c) if ext not in {".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif",
                                        ".woff2", ".woff", ".ico", ".mp4", ".webm"} else None
        if not t:
            continue
        for m in RE_PREENCHER.finditer(t):
            erros.append("%s: [PREENCHER: %s]" % (rel, m.group(1).strip()))
        if RE_ENDERECO.search(t):
            avisos.append("%s: PREENCHER-ENDERECO (%d)" % (rel, len(RE_ENDERECO.findall(t))))
        if re.search(r"noindex", t, re.I):
            erros.append("%s: noindex" % rel)
        if ext == ".html":
            confere_html(c, site, erros, avisos)
        if ext == ".css":
            for m in RE_FUNDO_FOTO.finditer(t):
                erros.append("%s: foto como fundo no CSS (%s). Fundo de CSS baixa antes da primeira tela; "
                             "use <img loading=\"lazy\"> dentro da secao." % (rel, m.group(1)))

    print("# Conferencia de %s\n" % site)
    if erros:
        print("Bloqueia a publicacao (%d):" % len(erros))
        for e in erros:
            print("  - " + e)
    else:
        print("Nada bloqueia a publicacao.")
    if avisos:
        print("\nAvisos (nao bloqueiam):")
        for a in avisos:
            print("  - " + a)
    return 1 if erros else 0


if __name__ == "__main__":
    sys.exit(main())
