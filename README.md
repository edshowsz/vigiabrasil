# 🟠 Vigia Brasil

Plataforma que transforma proposições legislativas da Câmara dos Deputados em artigos jornalísticos acessíveis, gerados automaticamente por IA.

![CI](https://github.com/SEU_USUARIO/vigia-brasil/actions/workflows/ci.yml/badge.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

---

## Arquitetura

```
                   ┌────────────────┐
                   │  API Câmara    │
                   │  dos Deputados │
                   └───────┬────────┘
                           │
                   ┌───────▼────────┐
                   │   Prefect      │
                   │   Workers      │
                   │   (Python)     │
                   └───────┬────────┘
                           │  coleta + geração de artigos (OpenRouter)
                   ┌───────▼────────┐
                   │  PostgreSQL    │
                   │                │
                   └───────┬────────┘
                           │
                   ┌───────▼────────┐
                   │   Next.js      │
                   │   Frontend     │
                   │   :3000        │
                   └────────────────┘
```

**Stack:**

| Camada | Tecnologia |
|--------|-----------|
| Orquestração | [Prefect](https://www.prefect.io/) |
| Crawler | Python + httpx + API Câmara |
| IA | [OpenRouter](https://openrouter.ai/) via pydantic-ai |
| Banco | PostgreSQL 16 |
| Frontend | Next.js 16 + Tailwind CSS v4 + Drizzle ORM |
| Infra | Docker Compose + Hostinger |

---

## Rodando localmente

### Pré-requisitos

- [Docker](https://www.docker.com/) e Docker Compose
- Chave da API [OpenRouter](https://openrouter.ai/)

### Setup

```bash
# Clone o repositório
git clone https://github.com/SEU_USUARIO/vigia-brasil.git
cd vigia-brasil

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env com suas credenciais

# Suba tudo
docker compose up --build
```

Acesse:

| Serviço | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Prefect UI | http://localhost:4200 |
| PostgreSQL | localhost:5432 |

---

## Estrutura do projeto

```
.
├── agent/              # Agente de IA (prompt + modelo)
├── clients/            # Clientes para APIs externas (Câmara)
├── database/           # Models, conexão e protocolos do banco
├── tasks/              # Tarefas Prefect (coleta, deploy)
├── frontend/           # Next.js (App Router)
│   └── src/
│       ├── app/        # Páginas
│       ├── components/ # Componentes React
│       └── db/         # Schema Drizzle ORM
├── docker-compose.yml
├── Dockerfile          # Backend Python
├── prefect.yaml        # Configuração de deployments Prefect
└── pyproject.toml      # Dependências Python (uv)
```

---

## Variáveis de ambiente

| Variável | Descrição | Obrigatória |
|----------|-----------|:-----------:|
| `OPENROUTER_API_KEY` | Chave da API OpenRouter para geração de artigos | ✅ |
| `POSTGRES_DB` | Nome do banco de dados | ✅ |
| `POSTGRES_USER` | Usuário do PostgreSQL | ✅ |
| `POSTGRES_PASSWORD` | Senha do PostgreSQL | ✅ |

Todas as variáveis acima estão documentadas em [`.env.example`](.env.example).

---

## Como funciona

1. **Coleta** — Um worker Prefect consulta periodicamente a API da Câmara dos Deputados buscando novas proposições (PLs, PECs, etc.)
2. **Armazenamento** — As proposições são salvas no PostgreSQL com todos os metadados (ementa, tramitações, votações, texto integral)
3. **Geração** — Um agente de IA (via OpenRouter) transforma cada proposição em um artigo jornalístico, seguindo diretrizes editoriais rigorosas
4. **Publicação** — O frontend Next.js exibe os artigos em tempo real, com links para a fonte oficial na Câmara

---

## CI/CD

- **CI** — Build e lint automáticos no push/PR para `main` ([`.github/workflows/ci.yml`](.github/workflows/ci.yml))
- **Deploy** — Deploy automático via SSH no push para `main` ([`.github/workflows/deploy.yml`](.github/workflows/deploy.yml))

Para configurar o deploy, adicione estes secrets no GitHub:

| Secret | Descrição |
|--------|-----------|
| `SERVER_HOST` | IP ou hostname do servidor |
| `SERVER_USER` | Usuário SSH |
| `SSH_PRIVATE_KEY` | Chave privada SSH |
| `OPENROUTER_API_KEY` | Chave da API OpenRouter |

---

## Licença

[MIT](LICENSE) — use, modifique e distribua livremente.
