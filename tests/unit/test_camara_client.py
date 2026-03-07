"""Testes unitários para o cliente da API Câmara dos Deputados."""

import pytest
from unittest.mock import Mock, patch
from clients.camara import CamaraAPIClient, RequisicaoDeputado, RequisicaoDespesa
from database.models import Deputado


@pytest.fixture
def camara_client():
    """Fixture que fornece uma instância do cliente."""
    return CamaraAPIClient()


@pytest.fixture
def mock_deputado_response():
    """Fixture com resposta mock de deputado."""
    return {
        "dados": {
            "id": 12345,
            "uri": "https://dadosabertos.camara.leg.br/api/v2/deputados/12345",
            "nomeCivil": "João Silva",
            "ultimoStatus": {
                "nome": "João Silva",
                "siglaPartido": "PT",
                "uriPartido": "https://dadosabertos.camara.leg.br/api/v2/partidos/13",
                "idLegislatura": 57,
                "urlFoto": "https://www.camara.leg.br/images/portal/membros/100/12345.jpg",
                "email": "joao.silva@camara.leg.br",
                "siglaUf": "SP"
            }
        }
    }


class TestEstruturaDados:
    """Testa a estrutura de dados das requisições."""

    def test_requisicao_deputado_para_params(self):
        """Valida conversão de RequisicaoDeputado para parâmetros."""
        req = RequisicaoDeputado(
            id=[12345, 67890],
            nome="Silva",
            pagina=1
        )
        params = req.to_params()

        assert params["id"] == "12345,67890"
        assert params["nome"] == "Silva"
        assert params["pagina"] == 1

    def test_requisicao_despesa_to_params(self):
        """Valida que to_params remove idDeputado."""
        req = RequisicaoDespesa(
            idDeputado=12345,
            ano=[2023, 2024],
            mes=[1, 2],
            pagina=1
        )
        params = req.to_params()

        assert "idDeputado" not in params
        assert params["ano"] == "2023,2024"
        assert params["mes"] == "1,2"


class TestCamaraAPIClient:
    """Testa métodos do cliente da API."""

    @patch("clients.camara.requests.Session.get")
    def test_obter_deputado_sucesso(self, mock_get, camara_client, mock_deputado_response):
        """Testa obtenção bem-sucedida de um deputado."""
        mock_response = Mock()
        mock_response.json.return_value = mock_deputado_response
        mock_get.return_value = mock_response

        deputado = camara_client.obter_deputado(12345)

        assert deputado is not None
        assert deputado.nome == "João Silva"
        assert deputado.sigla_partido == "PT"
        assert deputado.sigla_uf == "SP"

    @patch("clients.camara.requests.Session.get")
    def test_proxima_pagina_com_link(self, mock_get, camara_client):
        """Testa extração de próxima página quando existe."""
        data = {
            "dados": [],
            "links": [
                {"rel": "next", "href": "https://example.com/page2"}
            ]
        }

        url = camara_client._proxima_pagina(data)
        assert url == "https://example.com/page2"

    @patch("clients.camara.requests.Session.get")
    def test_proxima_pagina_sem_link(self, mock_get, camara_client):
        """Testa retorno None quando não há próxima página."""
        data = {"dados": [], "links": []}

        url = camara_client._proxima_pagina(data)
        assert url is None

    @patch("clients.camara.requests.Session.get")
    def test_get_com_erro_http(self, mock_get, camara_client):
        """Testa tratamento de erro HTTP."""
        mock_response = Mock()
        mock_response.raise_for_status.side_effect = Exception("HTTP Error")
        mock_get.return_value = mock_response

        with pytest.raises(Exception):
            camara_client._get("https://example.com/invalid")
