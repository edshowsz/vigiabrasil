.PHONY: help install test lint type-check format dev-setup clean

help:
	@echo "VigiaBrasil - Comandos disponíveis:"
	@echo ""
	@echo "  Instalação:"
	@echo "    make dev-setup    - Instala dependências e configura ambiente"
	@echo ""
	@echo "  Testes:"
	@echo "    make test         - Roda todos os testes"
	@echo "    make test-unit    - Roda apenas testes unitários"
	@echo "    make test-cov     - Roda testes com cobertura"
	@echo ""
	@echo "  Qualidade de Código:"
	@echo "    make lint         - Verifica e corrige estilo de código"
	@echo "    make type-check   - Verifica tipos com mypy"
	@echo "    make format       - Formata código com ruff"
	@echo ""
	@echo "  Utilidades:"
	@echo "    make clean        - Remove arquivos temporários"
	@echo "    make all          - Executa: test, lint, type-check"

dev-setup:
	pip install uv
	uv pip install -e .
	uv pip install -e ".[test,dev]"
	@echo "✅ Ambiente configurado com sucesso!"

test:
	pytest tests/ -v --tb=short

test-unit:
	pytest tests/unit/ -v --tb=short

test-cov:
	pytest tests/ --cov=clients --cov=database --cov-report=term-missing --cov-report=html

lint:
	ruff check . --fix

format:
	ruff format .

type-check:
	mypy clients/ database/ --ignore-missing-imports

all: test lint type-check
	@echo "✅ Todas as verificações passaram!"

clean:
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name .pytest_cache -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name .mypy_cache -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name .ruff_cache -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete
	rm -rf .coverage htmlcov/
	@echo "✅ Limpeza concluída!"
