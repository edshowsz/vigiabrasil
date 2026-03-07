"""Configuração compartilhada para todos os testes."""

import pytest
import os
from dotenv import load_dotenv

# Carrega variáveis de ambiente do arquivo .env.example para testes
load_dotenv(".env.example")


@pytest.fixture(scope="session")
def cli_args(request):
    """Permite passar argumentos via linha de comando."""
    return request.config.getoption("--arg") if hasattr(request.config.option, "arg") else {}
