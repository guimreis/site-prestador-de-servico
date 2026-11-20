#!/usr/bin/env python3
"""Testes do detector. Rode com: python3 -m unittest scripts/test_revisar_textos.py"""

import os
import subprocess
import sys
import tempfile
import unittest

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, AQUI)
import revisar_textos as rt  # noqa: E402

SCRIPT = os.path.join(AQUI, "revisar_textos.py")


def ids(texto):
    return {a["id"] for a in rt.achados_de(texto)}


def roda(conteudo, ext=".html"):
    with tempfile.TemporaryDirectory() as d:
        caminho = os.path.join(d, "index" + ext)
        with open(caminho, "w", encoding="utf-8") as fh:
            fh.write(conteudo)
        return subprocess.run([sys.executable, SCRIPT, caminho],
                              capture_output=True, text=True)


ANTITESE = {"antitese-negada", "nao-apenas-mas"}


class AntiteseComNaoMaiusculo(unittest.TestCase):
    """A antítese que abre a frase com 'Não' passava em branco."""

    def test_duas_frases(self):
        self.assertTrue(ids("Não começamos pela broca. Começamos pela conversa.") & ANTITESE)

    def test_virgula_e(self):
        self.assertTrue(ids("Não é só limpeza, é cuidado com a gengiva.") & ANTITESE)

    def test_frase_curta(self):
        self.assertTrue(ids("Não é promessa. É método.") & ANTITESE)

    def test_minusculo_continua(self):
        self.assertTrue(ids("A gente não vende sorriso, é tratamento.") & ANTITESE)

    def test_negacao_simples_passa(self):
        self.assertFalse(ids("Não atendemos convênio. O pagamento é na hora.") & ANTITESE)


class RelatorioDeArquivoLimpo(unittest.TestCase):
    """Arquivo limpo dizia '0 achados em 0 arquivos', como se nada tivesse sido lido."""

    def test_arquivo_limpo_conta_como_lido(self):
        r = roda("<main><p>A consulta dura uma hora.</p></main>")
        self.assertEqual(r.returncode, 0)
        self.assertIn("1 arquivo lido", r.stdout)
        self.assertIn("nenhum achado", r.stdout.lower())

    def test_caminho_inexistente_e_erro(self):
        r = subprocess.run([sys.executable, SCRIPT, "/caminho/que/nao/existe.html"],
                           capture_output=True, text=True)
        self.assertEqual(r.returncode, 2)
        self.assertIn("nenhum arquivo", (r.stdout + r.stderr).lower())

    def test_achado_sai_com_codigo_1(self):
        r = roda("<main><p>Não é promessa. É método.</p></main>")
        self.assertEqual(r.returncode, 1)
        self.assertIn("1 arquivo lido", r.stdout)


class FaqContinuaIgnorado(unittest.TestCase):
    def test_details(self):
        r = roda("<main><details><summary>Preciso ir?</summary>"
                 "<p>Não precisa. A conversa pode ser por vídeo.</p></details></main>")
        self.assertEqual(r.returncode, 0)


if __name__ == "__main__":
    unittest.main()
