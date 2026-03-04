# Vigia Brasil

Plataforma open-source que transforma proposições legislativas da Câmara dos Deputados em artigos jornalísticos acessíveis, gerados por inteligência artificial.

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## Stack

| Camada | Tecnologia |
|--------|------------|
| Orquestração | Prefect 3 |
| Coleta | Python |
| IA | OpenRouter |
| Banco | PostgreSQL 16 |
| Frontend | Next.js 16 · Tailwind CSS v4 · Drizzle ORM |

## Quick Start

```bash
git clone https://github.com/edshowsz/vigiabrasil.git
cd vigiabrasil
cp .env.example .env   # configure suas credenciais
docker compose up --build
```

| Serviço | URL |
|---------|-----|
| Frontend | `http://localhost:3000` |
| Prefect | `http://localhost:4200` |
| PostgreSQL | `localhost:5432` |

## Variáveis de Ambiente

| Variável | Descrição |
|----------|-----------|
| `POSTGRES_DB` | Nome do banco |
| `POSTGRES_USER` | Usuário PostgreSQL |
| `POSTGRES_PASSWORD` | Senha PostgreSQL |
| `OPENROUTER_API_KEY` | Chave API OpenRouter |
| `PREFECT_SERVER_API_AUTH_STRING` | user:senha para autenticação no prefect |
| `PREFECT_API_AUTH_STRING` | user:senha para autenticação no prefect  |


Veja [`.env.example`](.env.example).

## Estrutura

```
├── agent/          # Agente IA (prompt + modelo)
├── clients/        # Cliente API Câmara
├── database/       # Models e conexão PostgreSQL
├── tasks/          # Tarefas Prefect
├── frontend/       # Next.js (App Router)
├── docker-compose.yml
├── Dockerfile
└── prefect.yaml
```

## Pipeline

1. **Coleta** — Worker Prefect consulta a API da Câmara buscando novas proposições
2. **Armazenamento** — Proposições persistidas no PostgreSQL com metadados completos
3. **Geração** — Agente IA transforma cada proposição em artigo jornalístico
4. **Publicação** — Frontend exibe artigos com referência à fonte oficial

## Deploy

Deploy automático via SSH ao dar push na `main` ([`deploy.yml`](.github/workflows/deploy.yml)).

Secrets necessários (GitHub Environment):

| Secret | Descrição |
|--------|-----------|
| `SERVER_HOST` | IP do servidor |
| `SERVER_USER` | Usuário SSH |
| `SSH_PRIVATE_KEY` | Chave privada SSH |

## Licença

[MIT](LICENSE)
