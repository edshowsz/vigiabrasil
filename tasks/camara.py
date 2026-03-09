from agent import journalistAgent, xAgent, ArtigoProposicao, PostResumoX

from database import PostgresCamaraRepository, PostgresArtigosRepository
from datetime import datetime, timezone, timedelta
from database.models import Proposicao, Artigo
from clients.camara import CamaraAPIClient
from clients.x import XClient
from services.pdf_extractor import PDFExtractorService, PDFExtractorResult

from prefect.artifacts import create_markdown_artifact
from prefect.cache_policies import NO_CACHE
from prefect.logging import get_run_logger
from prefect import task, flow
import os

SITE_BASE_URL = os.getenv("SITE_BASE_URL", "https://vigiabrasil.org")


class PipelineContext:
    """Contexto compartilhado entre todas as tasks do pipeline."""
    def __init__(self):
        self.camara_client: CamaraAPIClient = CamaraAPIClient()
        self.camara_repo: PostgresCamaraRepository = PostgresCamaraRepository()
        self.artigos_repo: PostgresArtigosRepository = PostgresArtigosRepository()
        self.x_client: XClient = XClient()
        self.pdf_extractor: PDFExtractorService = PDFExtractorService()


@task(retries=3, retry_delay_seconds=5, cache_policy=NO_CACHE)
def listar_proposicoes(ctx: PipelineContext, limite: int = 5) -> list[Proposicao]:
    """Busca as proposições dos últimos 3 dias na API da Câmara."""
    logger = get_run_logger()
    try:
        return ctx.camara_client.listar_ultimas_proposicoes(dias=3)[:limite]
    except Exception as e:
        logger.error(f"Erro ao listar proposicoes: {e}", exc_info=True)
        raise
    
@task(retries=3, retry_delay_seconds=5, cache_policy=NO_CACHE)    
def filtrar_proposicoes_pendentes(ctx: PipelineContext, proposicoes: list[Proposicao]) -> list[Proposicao]:
    """Filtra as proposições que ainda não foram processadas (sem artigo gerado)."""
    logger = get_run_logger()
    try:
        pendentes = []
        for prop in proposicoes:
            if prop.ano == datetime.now(timezone.utc).year and not ctx.artigos_repo.artigo_existe_para_proposicao(prop.id):
                pendentes.append(prop)
        logger.info(f"Encontradas {len(pendentes)} proposições pendentes para processamento.")
        return pendentes
    except Exception as e:
        logger.error(f"Erro ao filtrar proposicoes pendentes: {e}", exc_info=True)
        raise

@task(retries=3, retry_delay_seconds=5, cache_policy=NO_CACHE)
def obter_proposicao(ctx: PipelineContext, proposicao_id: int) -> Proposicao:
    """Busca detalhes de uma proposição na API da Câmara."""
    logger = get_run_logger()
    try:
        return ctx.camara_client.detalhar_proposicao(proposicao_id)
    except Exception as e:
        logger.error(f"Erro ao obter proposicao ({proposicao_id}): {e}", exc_info=True)
        raise
    
    
@task(retries=3, retry_delay_seconds=5, cache_policy=NO_CACHE)
def extrair_texto_pdf_proposicao(ctx: PipelineContext, proposicao: Proposicao) -> Proposicao:
    """Extrai o texto integral do PDF da proposição e adiciona ao objeto."""
    logger = get_run_logger()
    try:
        if not proposicao.url_inteiro_teor:
            logger.debug(f"Proposição {proposicao.id} sem URL de inteiro teor.")
            return proposicao

        resultado: PDFExtractorResult = ctx.pdf_extractor.extrair_texto_de_url(proposicao.url_inteiro_teor)
        proposicao.texto_inteiro_teor = resultado.texto_extraido
        logger.info(f"Texto extraído para proposição {proposicao.id}: {len(proposicao.texto_inteiro_teor or '')} caracteres")
        return proposicao
    
    except Exception as e:
        logger.error(f"Erro ao extrair texto da proposição ({proposicao.id}): {e}", exc_info=True)
        return proposicao

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
def salvar_artigo(ctx: PipelineContext, proposicao: Proposicao, artigo: Artigo) -> Artigo:
    """Persiste o artigo gerado no banco de dados e retorna o artigo com o ID gerado."""
    logger = get_run_logger()
    try:
        return ctx.artigos_repo.salvar_artigo(artigo)
    except Exception as e:
        logger.error(f"[Proposicao: {proposicao.id}] Erro ao salvar artigo ({artigo.id}): {e}", exc_info=True)
        raise
    
@task(retries=3, retry_delay_seconds=5, cache_policy=NO_CACHE)
def resumir_artigo_para_x(ctx: PipelineContext, artigo: Artigo) -> PostResumoX:
    """Gera um resumo do artigo para o X usando o agente de IA."""
    logger = get_run_logger()
    try:
        prompt = (
            f"Título: {artigo.titulo}\n"
            f"Subtítulo: {artigo.subtitulo}\n"
            f"Lide: {artigo.lide}\n"
            f"Corpo: {artigo.corpo}"
        )
        result = xAgent.run_sync(user_prompt=prompt)
        output: PostResumoX = result.output
        return output

    except Exception as e:
        logger.error(f"Erro ao resumir artigo ({artigo.id}) para o X: {e}", exc_info=True)
        raise

    
@task(retries=3, retry_delay_seconds=30, cache_policy=NO_CACHE)
def publicar_post_x(ctx: PipelineContext, artigo: Artigo, resumo: PostResumoX) -> str:
    """Publica o post do artigo no X."""
    logger = get_run_logger()
    try:
        link = f"{SITE_BASE_URL}/artigos/{artigo.id}"
        texto_final = f"{resumo.post}\n{link}"

        if len(texto_final) > 280:
            espaco = 280 - len(link) - 2 
            post_cortado = resumo.post[:espaco - 3] + "..."
            texto_final = f"{post_cortado}\n{link}"

        data = ctx.x_client.publicar_post(texto_final)
        x_url = data.get("url", "")
        ctx.artigos_repo.marcar_como_publicado_no_x(artigo.id, x_url)
        logger.info(f"[Artigo {artigo.id}] Post publicado no X com sucesso.")
        return x_url
        
    except Exception as e:
        logger.error(f"Erro ao publicar post do artigo ({artigo.id}) no X: {e}", exc_info=True)
        raise
    
    
@flow()
def processar_proposicoes(limite_proposicoes: int = 5):
    
    ctx = PipelineContext()
    logger = get_run_logger()
    
    proposicoes = listar_proposicoes(ctx, limite=limite_proposicoes)
    proposices_pendentes = filtrar_proposicoes_pendentes(ctx, proposicoes)
    
    if not proposices_pendentes:
        logger.info("Nenhuma proposição pendente encontrada. Encerrando o fluxo.")
        return
    
    for proposicao in proposices_pendentes:
        proposicao = extrair_texto_pdf_proposicao(ctx, proposicao)
        salvar_proposicao(ctx, proposicao)
        artigo = criar_artigo(ctx, proposicao)
        artigo = salvar_artigo(ctx, proposicao, artigo)
        resumo = resumir_artigo_para_x(ctx, artigo)
        publicar_post_x(ctx, artigo, resumo)