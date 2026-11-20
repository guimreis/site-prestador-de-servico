#!/usr/bin/env python3
"""Testes do conferidor. Rode com: python3 -m unittest scripts/test_conferir_site.py"""

import os
import subprocess
import sys
import tempfile
import unittest

AQUI = os.path.dirname(os.path.abspath(__file__))
SCRIPT = os.path.join(AQUI, "conferir_site.py")

HTML_BOM = """<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
<title>Clínica</title><link rel="icon" href="img/a.jpg"><link rel="canonical" href="https://PREENCHER-ENDERECO/">
<link rel="stylesheet" href="style.css">
<script type="application/ld+json">{"@context":"https://schema.org","@graph":[
{"@type":"FAQPage","mainEntity":[{"@type":"Question","name":"Dói?",
"acceptedAnswer":{"@type":"Answer","text":"Pouco."}}]}]}</script></head>
<body><main><h1>Clínica</h1>
<img src="img/a.jpg" alt="Consultório" width="10" height="10">
<details><summary>Dói?</summary><p>Pouco.</p></details>
<a href="https://wa.me/5532900000000">WhatsApp</a></main></body></html>"""


def projeto(html=HTML_BOM, extras=None):
    d = tempfile.mkdtemp()
    os.makedirs(os.path.join(d, "site", "img"))
    with open(os.path.join(d, "site", "index.html"), "w", encoding="utf-8") as fh:
        fh.write(html)
    with open(os.path.join(d, "site", "img", "a.jpg"), "wb") as fh:
        fh.write(b"\xff\xd8" + b"0" * 1000)
    for nome, conteudo in (extras or {}).items():
        caminho = os.path.join(d, "site", nome)
        os.makedirs(os.path.dirname(caminho), exist_ok=True)
        with open(caminho, "wb") as fh:
            fh.write(conteudo)
    return os.path.join(d, "site")


def roda(*args):
    return subprocess.run([sys.executable, SCRIPT, *args], capture_output=True, text=True)


class Conferir(unittest.TestCase):
    def test_site_bom_passa_e_avisa_endereco(self):
        r = roda(projeto())
        self.assertEqual(r.returncode, 0, r.stdout)
        self.assertIn("PREENCHER-ENDERECO", r.stdout)

    def test_preencher_no_texto_bloqueia(self):
        r = roda(projeto(HTML_BOM.replace("<h1>Clínica</h1>",
                 "<h1>Clínica</h1><p>[PREENCHER: link das avaliações no Google]</p>")))
        self.assertEqual(r.returncode, 1)
        self.assertIn("link das avaliações no Google", r.stdout)

    def test_briefing_na_pasta_do_site_bloqueia(self):
        r = roda(projeto(extras={"briefing.md": b"telefone pessoal"}))
        self.assertEqual(r.returncode, 1)
        self.assertIn("briefing.md", r.stdout)

    def test_noindex_bloqueia(self):
        r = roda(projeto(HTML_BOM.replace("<title>", '<meta name="robots" content="noindex"><title>')))
        self.assertEqual(r.returncode, 1)

    def test_imagem_sem_alt_bloqueia(self):
        r = roda(projeto(HTML_BOM.replace(' alt="Consultório"', "")))
        self.assertEqual(r.returncode, 1)
        self.assertIn("alt", r.stdout)

    def test_imagem_decorativa_com_alt_vazio_passa(self):
        r = roda(projeto(HTML_BOM.replace(' alt="Consultório"', ' alt=""')))
        self.assertEqual(r.returncode, 0, r.stdout)

    def test_imagem_pesada_bloqueia(self):
        r = roda(projeto(extras={"img/a.jpg": b"\xff\xd8" + b"0" * 400_000}))
        self.assertEqual(r.returncode, 1)

    def test_recurso_de_fora_bloqueia(self):
        r = roda(projeto(HTML_BOM.replace('href="style.css"',
                 'href="https://fonts.googleapis.com/css2?family=X"')))
        self.assertEqual(r.returncode, 1)

    def test_faq_diferente_do_jsonld_bloqueia(self):
        r = roda(projeto(HTML_BOM.replace("<summary>Dói?</summary>", "<summary>Dói muito?</summary>")))
        self.assertEqual(r.returncode, 1)

    def test_foto_como_fundo_no_css_bloqueia(self):
        r = roda(projeto(extras={"style.css": b'.contato { background: #000 url("img/a.jpg") center / cover; }'}))
        self.assertEqual(r.returncode, 1)
        self.assertIn("fundo", r.stdout)

    def test_svg_como_fundo_no_css_passa(self):
        r = roda(projeto(extras={"style.css": b'.x { background: url("img/onda.svg"); }', "img/onda.svg": b"<svg/>"}))
        self.assertEqual(r.returncode, 0, r.stdout)

    def test_fonte_pesada_bloqueia(self):
        r = roda(projeto(extras={"fontes/titulo.woff2": b"0" * 70_000}))
        self.assertEqual(r.returncode, 1)
        self.assertIn("titulo.woff2", r.stdout)

    def test_css_sem_numero_de_versao_avisa(self):
        r = roda(projeto())
        self.assertIn("?v=", r.stdout)
        r = roda(projeto(HTML_BOM.replace('href="style.css"', 'href="style.css?v=3"')))
        self.assertNotIn("?v=", r.stdout)

    def test_video_leve_e_mudo_passa(self):
        html = HTML_BOM.replace("<h1>", '<video class="capa-video" muted playsinline loop preload="none" '
                                'data-celular="video/c.mp4"></video><h1>')
        r = roda(projeto(html, extras={"video/c.mp4": b"0" * 200_000}))
        self.assertEqual(r.returncode, 0, r.stdout)

    def test_video_pesado_bloqueia(self):
        r = roda(projeto(extras={"video/c.mp4": b"0" * 2_000_000}))
        self.assertEqual(r.returncode, 1)
        self.assertIn("c.mp4", r.stdout)

    def test_video_com_som_ou_sem_playsinline_bloqueia(self):
        r = roda(projeto(HTML_BOM.replace("<h1>", '<video loop preload="none"></video><h1>')))
        self.assertEqual(r.returncode, 1)
        self.assertIn("muted", r.stdout)

    def test_404_com_caminho_desde_a_raiz_passa(self):
        r = roda(projeto(extras={"404.html": b'<!doctype html><html><body><img src="/img/a.jpg" alt="" width="1" height="1"></body></html>'}))
        self.assertEqual(r.returncode, 0, r.stdout)

    def test_sem_icone_da_aba_bloqueia(self):
        r = roda(projeto(HTML_BOM.replace('<link rel="icon" href="img/a.jpg">', "")))
        self.assertEqual(r.returncode, 1)
        self.assertIn("icon", r.stdout)

    def test_trocar_endereco(self):
        site = projeto()
        r = roda(site, "--endereco", "https://clinica-teste.pages.dev")
        self.assertEqual(r.returncode, 0, r.stdout)
        with open(os.path.join(site, "index.html"), encoding="utf-8") as fh:
            html = fh.read()
        self.assertIn('href="https://clinica-teste.pages.dev/"', html)
        self.assertNotIn("PREENCHER-ENDERECO", html)


if __name__ == "__main__":
    unittest.main()
