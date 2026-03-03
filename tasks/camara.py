from agent import journalistAgent, ArtigoProposicao
from datetime import datetime, timezone, timedelta
from database import PostgresCamaraRepository, PostgresArtigosRepository
from clients.camara import CamaraAPIClient
from database.models import Proposicao, Artigo


from prefect import task, flow
from prefect.artifacts import create_markdown_artifact
from prefect.logging import get_run_logger
from prefect.cache_policies import NO_CACHE




class PipelineContext:
    """Contexto compartilhado entre todas as tasks do pipeline."""
    def __init__(self):
        self.client = CamaraAPIClient()
        self.camara_repo = PostgresCamaraRepository()
        self.artigos_repo = PostgresArtigosRepository()


@task(retries=3, retry_delay_seconds=5, cache_policy=NO_CACHE)
def listar_proposicoes(ctx: PipelineContext) -> list[Proposicao]:
    """Busca as proposições dos últimos 3 dias na API da Câmara."""
    logger = get_run_logger()
    try:
        return ctx.client.listar_ultimas_proposicoes(dias=3)
    except Exception as e:
        logger.error(f"Erro ao listar proposicoes: {e}", exc_info=True)
        raise

@task(retries=3, retry_delay_seconds=5, cache_policy=NO_CACHE)
def obter_proposicao(ctx: PipelineContext, proposicao_id: int) -> dict:
    """Busca detalhes de uma proposição na API da Câmara."""
    logger = get_run_logger()
    try:
        return ctx.client.detalhar_proposicao(proposicao_id)
    except Exception as e:
        logger.error(f"Erro ao obter proposicao ({proposicao_id}): {e}", exc_info=True)
        raise

@task(retries=3, retry_delay_seconds=5, cache_policy=NO_CACHE)
def salvar_proposicao(ctx: PipelineContext, proposicao: Proposicao):
    """Persiste a proposição no banco de dados."""
    logger = get_run_logger()
    try:
        ctx.camara_repo.salvar_proposicao(proposicao)
    except Exception as e:
        logger.error(f"Erro ao salvar proposicao ({proposicao.id}): {e}", exc_info=True)
        raise


@task(retries=3, retry_delay_seconds=5, cache_policy=NO_CACHE)
def criar_artigo(ctx: PipelineContext, proposicao: Proposicao) -> Artigo:
    """Gera um artigo jornalístico a partir da proposição via agente de IA."""
    logger = get_run_logger()
    try:
        result = journalistAgent.run_sync(user_prompt=proposicao.model_dump_json())
        output: ArtigoProposicao = result.output
        markdown_content = f"""
        # Proposição: \n
        # {proposicao.model_dump_json()} \n\n
        # Artigo: \n
        # {output.model_dump_json()}
        """
        create_markdown_artifact(key=f"proposicao-{proposicao.id}", markdown=markdown_content)
        return Artigo(**output.model_dump())
    except Exception as e:
        logger.error(f"Erro ao criar artigo para proposicao ({proposicao.id}): {e}", exc_info=True)
        raise

@task(retries=3, retry_delay_seconds=5, cache_policy=NO_CACHE)
def salvar_artigo(ctx: PipelineContext, proposicao: Proposicao, artigo: Artigo):
    """Persiste o artigo gerado no banco de dados."""
    logger = get_run_logger()
    try:
        ctx.artigos_repo.salvar_artigo(artigo)
    except Exception as e:
        logger.error(f"[Proposicao: {proposicao.id}] Erro ao salvar artigo ({artigo.id}): {e}", exc_info=True)
        raise
    
@flow()
def processar_proposicoes():
    ctx = PipelineContext()
    proposicoes = listar_proposicoes(ctx)
    
    for proposicao in proposicoes:
        if proposicao.ano == datetime.now(timezone.utc).year and not ctx.artigos_repo.artigo_existe_para_proposicao(proposicao.id):
            salvar_proposicao(ctx, proposicao)
            artigo = criar_artigo(ctx, proposicao)
            salvar_artigo(ctx, proposicao, artigo)