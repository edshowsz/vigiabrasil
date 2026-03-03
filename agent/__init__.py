
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
    
    
journalistAgent = Agent(
    system_prompt=_SYSTEM_PROMPT,
    output_type=ArtigoProposicao,
    model="openrouter:google/gemini-2.0-flash-001"
)