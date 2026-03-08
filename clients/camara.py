from urllib.parse import urlencode
from typing import List, Optional, Dict, Tuple
from datetime import datetime, timedelta, timezone
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

from database.models import Deputado, Despesa, Proposicao

from pydantic import BaseModel
from typing import List, Optional, Dict, Any, Literal

class BaseRequest(BaseModel):
    pagina: int = 1
    itens: int = 100
    ordem: Literal["ASC", "DESC"] = "ASC"

    def to_params(self) -> Dict[str, Any]:
        params: Dict[str, Any] = {}
        for k, v in self.model_dump(exclude_none=True).items():
            if isinstance(v, list):
                if not v:
                    continue
                params[k] = ",".join(map(str, v))
            elif isinstance(v, bool):
                params[k] = str(v).lower()
            else:
                params[k] = v
        return params


class RequisicaoDespesa(BaseRequest):
    idDeputado: int
    idLegislatura: Optional[List[int]] = None
    ano: Optional[List[int]] = None
    mes: Optional[List[int]] = None
    cnpjCpfFornecedor: Optional[str] = None
    ordenarPor: Literal["ano", "idLegislatura", "mes", "id"] = "ano"

    def to_params(self) -> Dict[str, Any]:
        params = super().to_params()
        params.pop("idDeputado", None)
        return params


class RequisicaoDeputado(BaseRequest):
    id: Optional[List[int]] = None
    nome: Optional[str] = None
    idLegislatura: Optional[List[int]] = None
    siglaUf: Optional[List[str]] = None
    siglaPartido: Optional[List[str]] = None
    siglaSexo: Optional[str] = None
    ordenarPor: Literal["id", "idLegislatura", "nome", "siglaUF", "siglaPartido"] = "nome"


class RequisicaoProposicao(BaseRequest):
    id: Optional[List[int]] = None
    siglaTipo: Optional[List[str]] = None
    numero: Optional[List[int]] = None
    ano: Optional[List[int]] = None
    codTipo: Optional[List[int]] = None
    idDeputadoAutor: Optional[List[int]] = None
    autor: Optional[str] = None
    siglaPartidoAutor: Optional[List[str]] = None
    siglaUFAutor: Optional[List[str]] = None
    keywords: Optional[str] = None
    tramitacaoSenado: Optional[bool] = None
    dataInicio: Optional[str] = None
    dataFim: Optional[str] = None
    dataApresentacaoInicio: Optional[str] = None
    dataApresentacaoFim: Optional[str] = None
    codSituacao: Optional[List[int]] = None
    codTema: Optional[List[int]] = None
    ordenarPor: Literal["id", "codTipo", "siglaTipo", "numero", "ano"] = "id"


class CamaraAPIClient:
    """Cliente HTTP para a API de dados abertos da Câmara dos Deputados."""

    BASE_URL = "https://dadosabertos.camara.leg.br/api/v2"

    def __init__(self):
        self.session = requests.Session()
        retries = Retry(total=5, backoff_factor=1)
        self.session.mount("https://", HTTPAdapter(max_retries=retries))
        self.session.mount("http://", HTTPAdapter(max_retries=retries))

    def _get(self, url: str, timeout: int = 30) -> dict:
        response = self.session.get(url, timeout=timeout)
        response.raise_for_status()
        return response.json()

    def _proxima_pagina(self, data: dict) -> Optional[str]:
        for link in data.get("links", []):
            if link.get("rel") == "next":
                return link.get("href")
        return None

    # ─── Deputados ────────────────────────────────────────────

    def listar_deputados(
        self,
        requisicao: Optional[RequisicaoDeputado] = None,
        url: Optional[str] = None
    ) -> Tuple[List[Deputado], Optional[str]]:
        if url is None:
            url = f"{self.BASE_URL}/deputados"
            if requisicao:
                url += "?" + urlencode(requisicao.to_params())

        data = self._get(url)
        deputados = [Deputado.model_validate(item) for item in data["dados"]]
        return deputados, self._proxima_pagina(data)

    def obter_deputado(self, deputado_id: int) -> Optional[Deputado]:
        data = self._get(f"{self.BASE_URL}/deputados/{deputado_id}")
        item = data["dados"]
        ultimo_status = item.get("ultimoStatus", {})
        return Deputado(
            id=item.get("id"),
            uri=item.get("uri"),
            nome=ultimo_status.get("nome") or item.get("nomeCivil"),
            sigla_partido=ultimo_status.get("siglaPartido", ""),
            uri_partido=ultimo_status.get("uriPartido", ""),
            id_legislatura=ultimo_status.get("idLegislatura", 0),
            url_foto=ultimo_status.get("urlFoto", ""),
            email=ultimo_status.get("email", ""),
            sigla_uf=ultimo_status.get("siglaUf"),
        )

    # ─── Despesas ─────────────────────────────────────────────

    def listar_despesas(
        self,
        requisicao: RequisicaoDespesa,
        url: Optional[str] = None
    ) -> Tuple[List[Despesa], Optional[str]]:
        if url is None:
            url = f"{self.BASE_URL}/deputados/{requisicao.idDeputado}/despesas"
            url += "?" + urlencode(requisicao.to_params())

        data = self._get(url)
        despesas = []
        for item in data["dados"]:
            item["idDeputado"] = requisicao.idDeputado
            despesas.append(Despesa.model_validate(item))

        return despesas, self._proxima_pagina(data)

    # ─── Proposições ──────────────────────────────────────────

    def listar_proposicoes(
        self,
        requisicao: RequisicaoProposicao,
        url: Optional[str] = None
    ) -> Tuple[List[Proposicao], Optional[str]]:
        if url is None:
            url = f"{self.BASE_URL}/proposicoes"
            url += "?" + urlencode(requisicao.to_params())

        data = self._get(url)
        proposicoes = [Proposicao.model_validate(item) for item in data["dados"]]
        return proposicoes, self._proxima_pagina(data)
    
    def listar_ultimas_proposicoes(self, dias: int = 3) -> List[Proposicao]:
        data_inicio = (datetime.now(timezone.utc) - timedelta(days=dias)).strftime("%Y-%m-%d")
        proposicoes: List[Proposicao] = []
        url = f"{self.BASE_URL}/proposicoes?dataInicio={data_inicio}&itens=100&ordem=DESC&ordenarPor=id"
        while url:
            data = self._get(url)
            proposicoes.extend(
                Proposicao.model_validate(item) for item in data["dados"]
            )
            url = self._proxima_pagina(data)
        return proposicoes

    def detalhar_proposicao(self, proposicao_id: int) -> Proposicao:
        """Busca os detalhes completos de uma proposição, incluindo urlInteiroTeor."""
        data = self._get(f"{self.BASE_URL}/proposicoes/{proposicao_id}")
        return Proposicao.model_validate(data["dados"])

    def obter_autores_proposicao(self, proposicao_id: int) -> List[Dict]:
        data = self._get(f"{self.BASE_URL}/proposicoes/{proposicao_id}/autores")
        autores = []
        for autor in data.get("dados", []):
            autor_data = {
                "nome": autor.get("nome"),
                "tipo": autor.get("tipo"),
                "codTipo": autor.get("codTipo"),
                "ordemAssinatura": autor.get("ordemAssinatura"),
                "proponente": autor.get("proponente"),
                "idDeputado": None,
            }
            uri = autor.get("uri")
            if uri and "/deputados/" in uri:
                try:
                    autor_data["idDeputado"] = int(uri.split("/deputados/")[-1])
                except (ValueError, IndexError):
                    pass
            autores.append(autor_data)
        return autores

    def obter_tramitacoes(self, proposicao_id: int) -> List[Dict]:
        data = self._get(f"{self.BASE_URL}/proposicoes/{proposicao_id}/tramitacoes")
        return data["dados"]

    def obter_votacoes(self, proposicao_id: int) -> List[Dict]:
        data = self._get(f"{self.BASE_URL}/proposicoes/{proposicao_id}/votacoes")
        return data["dados"]