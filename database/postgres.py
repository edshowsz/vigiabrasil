from typing import List, Optional

from sqlmodel import Session, select
from sqlalchemy import func

from database.connection import get_engine
from database.models import Deputado, Despesa, Proposicao, Artigo
from database.protocols import CamaraRepositoryProtocol, ArtigosRepositoryProtocol


class PostgresCamaraRepository(CamaraRepositoryProtocol):
    """Implementação PostgreSQL do protocolo CamaraRepository."""

    def __init__(self):
        self.engine = get_engine()


    # ─── Deputados ────────────────────────────────────────────

    def salvar_deputado(self, deputado: Deputado) -> None:
        with Session(self.engine) as session:
            session.add(deputado)
            session.commit()

    def deputado_existe(self, deputado_id: int) -> bool:
        with Session(self.engine) as session:
            return session.get(Deputado, deputado_id) is not None

    def obter_deputado(self, deputado_id: int) -> Optional[Deputado]:
        with Session(self.engine) as session:
            return session.get(Deputado, deputado_id)

    def listar_ids_deputados(self) -> List[int]:
        with Session(self.engine) as session:
            rows = session.exec(select(Deputado.id)).all()
            return list(rows)

    # ─── Despesas ─────────────────────────────────────────────

    def salvar_despesa(self, despesa: Despesa) -> None:
        with Session(self.engine) as session:
            session.merge(despesa)
            session.commit()

    def despesa_existe(self, cod_documento: int) -> bool:
        if not cod_documento:
            return False
        with Session(self.engine) as session:
            row = session.exec(
                select(Despesa).where(Despesa.cod_documento == cod_documento)
            ).first()
            return row is not None

    # ─── Proposições ──────────────────────────────────────────

    def salvar_proposicao(self, proposicao: Proposicao) -> None:
        with Session(self.engine) as session:
            session.merge(proposicao)
            session.commit()

    def proposicao_existe(self, proposicao_id: int) -> bool:
        with Session(self.engine) as session:
            return session.get(Proposicao, proposicao_id) is not None

    def obter_ultimo_id_proposicao(self) -> Optional[int]:
        with Session(self.engine) as session:
            return session.execute(select(func.max(Proposicao.id))).scalar()

    def listar_ids_proposicoes(self) -> List[int]:
        with Session(self.engine) as session:
            rows = session.exec(select(Proposicao.id)).all()
            return list(rows)

    def listar_proposicoes_sem_autores(self, limit: Optional[int] = None) -> List[int]:
        with Session(self.engine) as session:
            stmt = select(Proposicao.id).where(Proposicao.autores.is_(None))  # type: ignore
            if limit:
                stmt = stmt.limit(limit)
            rows = session.exec(stmt).all()
            return list(rows)



class PostgresArtigosRepository(ArtigosRepositoryProtocol):
    """Implementação PostgreSQL do protocolo ArtigosRepository."""

    def __init__(self):
        self.engine = get_engine()

    def salvar_artigo(self, artigo: Artigo) -> Artigo:
        with Session(self.engine) as session:
            merged = session.merge(artigo)
            session.commit()
            session.refresh(merged)
            return merged

    def artigo_existe_para_proposicao(self, id_proposicao: int) -> bool:
        with Session(self.engine) as session:
            row = session.exec(
                select(Artigo).where(Artigo.id_proposicao == id_proposicao)
            ).first()
            return row is not None

    def obter_artigo_por_proposicao(self, id_proposicao: int) -> Optional[Artigo]:
        with Session(self.engine) as session:
            return session.exec(
                select(Artigo).where(Artigo.id_proposicao == id_proposicao)
            ).first()

    def listar_artigos(self, limit: Optional[int] = None) -> List[Artigo]:
        with Session(self.engine) as session:
            stmt = select(Artigo).order_by(Artigo.created_at.desc())  # type: ignore
            if limit:
                stmt = stmt.limit(limit)
            rows = session.exec(stmt).all()
            return list(rows)

    def listar_artigos_sem_resumo_x(self, limit: Optional[int] = None) -> List[Artigo]:
        """Retorna artigos relevantes que ainda não têm resumo para o X."""
        with Session(self.engine) as session:
            stmt = (
                select(Artigo)
                .where(Artigo.relevante == True)  # noqa: E712
                .where(Artigo.x_resumo.is_(None))  # type: ignore
                .order_by(Artigo.created_at.desc())  # type: ignore
            )
            if limit:
                stmt = stmt.limit(limit)
            rows = session.exec(stmt).all()
            return list(rows)

    def listar_artigos_para_publicar_x(self, limit: Optional[int] = None) -> List[Artigo]:
        """Retorna artigos com resumo para X gerado mas ainda não publicados."""
        with Session(self.engine) as session:
            stmt = (
                select(Artigo)
                .where(Artigo.relevante == True)  # noqa: E712
                .where(Artigo.x_resumo.isnot(None))  # type: ignore
                .where(Artigo.x_publicado == False)  # noqa: E712
                .order_by(Artigo.created_at.desc())  # type: ignore
            )
            if limit:
                stmt = stmt.limit(limit)
            rows = session.exec(stmt).all()
            return list(rows)


    def marcar_como_publicado_no_x(self, artigo_id: int, post_url: str | None = None) -> None:
        """Marca o artigo como publicado no X e salva a URL do post."""
        with Session(self.engine) as session:
            artigo = session.get(Artigo, artigo_id)
            if not artigo: return
            if not post_url: return 
            artigo.post_url = post_url
            session.add(artigo)
            session.commit()
