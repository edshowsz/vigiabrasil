"""Testes unitários para models do banco de dados."""

import pytest
from datetime import datetime, timezone
from database.models import Deputado, Despesa, Proposicao


class TestDeputado:
    """Testa validação do model Deputado."""

    def test_criar_deputado_minimo(self):
        """Testa criação de deputado com campos mínimos."""
        deputado = Deputado(
            id=12345,
            uri="https://example.com/deputado/12345",
            nome="João Silva",
            sigla_partido="PT",
            uri_partido="https://example.com/partido/13",
            id_legislatura=57,
            url_foto="https://example.com/foto.jpg",
            email="joao@camara.leg.br"
        )

        assert deputado.id == 12345
        assert deputado.nome == "João Silva"
        assert deputado.sigla_partido == "PT"

    def test_deputado_com_timestamps(self):
        """Testa que timestamps são criados automaticamente."""
        deputado = Deputado(
            id=12345,
            uri="https://example.com",
            nome="João",
            sigla_partido="PT",
            uri_partido="https://example.com",
            id_legislatura=57,
            url_foto="https://example.com",
            email="joao@example.com"
        )

        assert deputado.created_at is not None
        assert deputado.updated_at is not None


class TestDespesa:
    """Testa validação do model Despesa."""

    def test_criar_despesa_minimo(self):
        """Testa criação de despesa com campos mínimos."""
        despesa = Despesa(
            id_deputado=12345,
            ano=2024,
            mes=1,
            valor=1000.0,
            tipo="Alimentação",
            descricao="Refeição em São Paulo"
        )

        assert despesa.id_deputado == 12345
        assert despesa.ano == 2024
        assert despesa.mes == 1


class TestProposicao:
    """Testa validação do model Proposicao."""

    def test_criar_proposicao_minimo(self):
        """Testa criação de proposição com campos mínimos."""
        proposicao = Proposicao(
            id=12345,
            uri="https://example.com/prop/12345",
            sigla_tipo="PL",
            numero=1234,
            ano=2024,
            ementa="Ementa do projeto"
        )

        assert proposicao.id == 12345
        assert proposicao.sigla_tipo == "PL"
        assert proposicao.numero == 1234
