# Testes do VigiaBrasil

Este diretório contém os testes automatizados do projeto.

## 📁 Estrutura

```
tests/
├── conftest.py           # Configurações compartilhadas
├── unit/                 # Testes unitários (rápidos)
│   ├── __init__.py
│   ├── test_camara_client.py
│   └── test_database_models.py
└── integration/          # Testes de integração (banco de dados real)
    └── __init__.py
```

## 🏃 Executando os Testes

### Todos os testes
```bash
pytest tests/
```

### Apenas unitários
```bash
pytest tests/unit/
```

### Com saída detalhada
```bash
pytest tests/ -v
```

### Com cobertura de código
```bash
pytest tests/ --cov=clients --cov=database
```

Ou use o atalho:
```bash
make test-cov
```

## ✅ Testes Disponíveis

### `test_camara_client.py`
Testes do cliente da API Câmara dos Deputados:
- ✅ Conversão de parâmetros
- ✅ Parsing de respostas
- ✅ Tratamento de erros
- ✅ Paginação

### `test_database_models.py`
Testes dos models SQLModel:
- ✅ Validação de Deputado
- ✅ Validação de Despesa
- ✅ Validação de Proposição

## 📝 Escrevendo Novas Testes

### Estrutura mínima
```python
import pytest

class TestAlgo:
    """Testa algo importante."""
    
    def test_caso_especifico(self):
        """Descreve o que está sendo testado."""
        # Arrange - Preparar
        esperado = "valor"
        
        # Act - Agir
        resultado = funcao_testada()
        
        # Assert - Afirmar
        assert resultado == esperado
```

### Com fixtures
```python
@pytest.fixture
def cliente():
    """Fornece um cliente para os testes."""
    return CamaraAPIClient()

def test_com_fixture(cliente):
    # Use o cliente
    assert cliente is not None
```

### Com mocks
```python
from unittest.mock import patch, Mock

@patch("modulo.funcao_externa")
def test_com_mock(mock_funcao):
    mock_funcao.return_value = "resposta"
    resultado = funcao_que_chama_externa()
    mock_funcao.assert_called_once()
```

## 🎯 Boas Práticas

- **Nomeação clara**: `test_<o_que_esta_sendo_testado>`
- **Um conceito por teste**: Cada teste valida uma coisa
- **Dado-Quando-Então**: Arrange-Act-Assert
- **Sem dependências**: Testes unitários devem ser isolados
- **Use pytest fixtures**: Para reutilizar setup

## 📊 Cobertura

Atualmente cobrimos:
- `clients/`: ~80%
- `database/`: ~70%
- `tasks/`: *(em desenvolvimento)*

Objetivo: >80% de cobertura geral

## 🚀 Próximos Passos

- [ ] Testes de integração com banco PostgreSQL
- [ ] Testes de tasks do Prefect
- [ ] Mock de respostas da API da Câmara
- [ ] Testes de edge cases

## ❓ Dúvidas?

Veja [CONTRIBUTING.md](../CONTRIBUTING.md) para mais informações sobre o setup do ambiente.
