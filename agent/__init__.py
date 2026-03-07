
from dotenv import load_dotenv
from pydantic_ai import Agent
from pathlib import Path
import os

from sqlalchemy import Column

from sqlmodel import Column

from database.models import Artigo
from pydantic import BaseModel, Field


load_dotenv()


_MODEL_PATH = Path(__file__).parent / "model.md"
_SYSTEM_PROMPT = _MODEL_PATH.read_text(encoding="utf-8")


# ─── Agents ───────────────────────────────────────────────────



class ArtigoProposicao(BaseModel):
    """Modelo de dados para o output do agente, representando um artigo jornalístico gerado a partir de uma proposição."""
    id_proposicao: int = Field(description="ID da proposição correspondente")
    titulo: str = Field(description="Título do artigo")
    subtitulo: str = Field(description="Subtítulo do artigo")
    lide: str = Field(description="Lide do artigo, contendo as informações mais importantes e o gancho para o leitor")
    corpo: str = Field(description="Corpo do artigo, com a narrativa jornalística completa baseada na proposição")
    relevante: bool = Field(description="Indica se o artigo é relevante para publicação, baseado na análise do conteúdo da proposição")


class PostResumoX(BaseModel):
    """Modelo de dados para o output do agente do X."""
    post: str = Field(
        description="Texto do post para o X resumindo o artigo. Máximo 270 caracteres (reserva 10 para link).",
        max_length=270,
    )


journalistAgent = Agent(
    system_prompt=_SYSTEM_PROMPT,
    output_type=ArtigoProposicao,
    model="openrouter:google/gemini-2.0-flash-001"
)


_X_SYSTEM_PROMPT = """\
# Agente Resumidor para o X

Você é um redator especializado em criar posts concisos para o X (antigo Twitter) sobre política legislativa brasileira.

Sua função é transformar artigos jornalísticos completos em posts informativos, diretos e imparciais.

## Regras obrigatórias

1. **Limite de caracteres:** O post DEVE ter no máximo 270 caracteres (10 são reservados para o link do artigo).
2. **Imparcialidade absoluta:** Nunca emita opinião ou juízo de valor. Seja factual.
3. **Linguagem acessível:** Escreva para o público geral. Evite jargão técnico.
4. **Sem hashtags excessivas:** Use no máximo 2 hashtags relevantes.
5. **Sem emojis excessivos:** Use no máximo 1 emoji, se necessário.
6. **Gancho informativo:** O post deve comunicar a essência da notícia — o que está acontecendo e por que importa.
7. **Formato:** Texto direto, sem aspas, sem "URGENTE", sem sensacionalismo.
8. **Tom:** Sóbrio, informativo, neutro.

## Estrutura sugerida

[Fato principal em 1-2 frases curtas] + [contexto breve se couber] + [hashtag opcional]

## Exemplo

Entrada: Artigo sobre PL que propõe gratuidade no transporte público para idosos acima de 60 anos.
Saída: "Projeto de lei propõe gratuidade no transporte público para maiores de 60 anos em todo o país. A proposta altera o Estatuto do Idoso. #Legislação"

## O que NÃO fazer

- Não ultrapasse 270 caracteres.
- Não use clickbait ou sensacionalismo.
- Não invente informações que não estejam no artigo.
- Não use ALL CAPS.
- Não comece com "BREAKING" ou "URGENTE".
"""

xAgent = Agent(
    system_prompt=_X_SYSTEM_PROMPT,
    output_type=PostResumoX,
    model="openrouter:google/gemini-2.0-flash-001"
)