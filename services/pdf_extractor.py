import io
import logging
from dataclasses import dataclass
from typing import Optional

import requests
from pypdf import PdfReader


@dataclass
class PDFExtractorResult:
    status: str
    proposicao_id: Optional[int] = None
    url: Optional[str] = None
    texto: Optional[str] = None
    errors: Optional[list[str]] = None


class PDFExtractorService:
    """Serviço para extrair texto de documentos PDF via URL."""

    def __init__(self, logger: Optional[logging.Logger] = None):
        self.logger = logger or logging.getLogger(__name__)
        self.session = requests.Session()
        self.result: PDFExtractorResult = PDFExtractorResult(status="initialized")

        # Headers para simular navegador (alguns sites bloqueiam bots)
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/pdf,*/*',
        })

    def _validacao_pdf(self, response: requests.Response) -> bool:
        """Verifica se a resposta contém um PDF válido."""
        content_type = response.headers.get('Content-Type', '')
        if 'pdf' not in content_type.lower() and response.content[:4] != b'%PDF':
            self.logger.error(f"URL não é um PDF válido (content_type={content_type})")
            return False
        return True

    def _extrair_texto_pdf(self, pdf_file: io.BytesIO) -> Optional[str]:
        try:
            reader = PdfReader(pdf_file)
            texto_completo = []

            for page in reader.pages:
                texto_completo.append(page.extract_text() or "")

            return "\n\n".join(texto_completo).strip()
        except Exception as e:
            self.logger.error(f"Erro ao extrair texto do PDF: {e}", exc_info=True)
            return None

    def extrair_texto_de_url(self, url: str) -> PDFExtractorResult:
        """
        Baixa PDF de uma URL e extrai todo o texto.

        Args:
            url: URL do documento PDF

        Returns:
            PDFExtractorResult com status e texto extraído
        """
        if not url:
            self.result = PDFExtractorResult(status="error", url=url, errors=["URL vazia ou None"])
            return self.result

        try:
            response = self.session.get(url, timeout=60, allow_redirects=True)
            response.raise_for_status()

            if not self._validacao_pdf(response):
                self.result = PDFExtractorResult(status="error", url=url, errors=["Conteúdo não é um PDF válido"])
                return self.result

            texto = self._extrair_texto_pdf(pdf_file=io.BytesIO(response.content))

            if texto:
                self.logger.info(f"Texto extraído com sucesso do PDF: {url}")
                self.result = PDFExtractorResult(status="success", url=url, texto=texto)
            else:
                self.result = PDFExtractorResult(status="empty", url=url, errors=["PDF sem texto extraível"])

            return self.result

        except requests.exceptions.Timeout:
            self.logger.error(f"Timeout ao baixar PDF: {url}")
            self.result = PDFExtractorResult(status="error", url=url, errors=["Timeout ao baixar PDF"])
            return self.result

        except requests.exceptions.RequestException as e:
            self.logger.error(f"Erro HTTP ao baixar PDF de {url}: {e}")
            self.result = PDFExtractorResult(status="error", url=url, errors=[str(e)])
            return self.result

        except Exception as e:
            self.logger.error(f"Erro ao processar PDF de {url}: {e}", exc_info=True)
            self.result = PDFExtractorResult(status="error", url=url, errors=[str(e)])
            return self.result
