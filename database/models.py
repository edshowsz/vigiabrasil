from typing import Optional, List, Dict
from datetime import datetime, timezone

from sqlmodel import SQLModel, Field, Relationship, Column, Index
from sqlalchemy import DateTime, JSON, Text
from sqlalchemy.sql import func


def _now() -> datetime:
    return datetime.now(timezone.utc)


# ─── Deputado ─────────────────────────────────────────────────


class Deputado(SQLModel, table=True):
    __tablename__ = "deputados"

    id: int = Field(primary_key=True)
    uri: str
    nome: str
    sigla_partido: str = Field(alias="siglaPartido")
    uri_partido: str = Field(alias="uriPartido")
    id_legislatura: int = Field(alias="idLegislatura")
    url_foto: str = Field(alias="urlFoto")
    email: str
    sigla_uf: Optional[str] = Field(default=None, alias="siglaUF")

    created_at: datetime = Field(
        default_factory=_now, sa_column=Column(DateTime(timezone=True), server_default=func.now())
    )
    updated_at: datetime = Field(
        default_factory=_now, sa_column=Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    )

    despesas: List["Despesa"] = Relationship(back_populates="deputado")



# ─── Despesa ──────────────────────────────────────────────────


class Despesa(SQLModel, table=True):
    __tablename__ = "despesas"

    id: Optional[int] = Field(default=None, primary_key=True)
    id_deputado: int = Field(foreign_key="deputados.id", index=True, alias="idDeputado")
    ano: int
    mes: int
    cod_documento: Optional[int] = Field(default=None, unique=True, index=True, alias="codDocumento")
    cnpj_cpf_fornecedor: Optional[str] = Field(default=None, alias="cnpjCpfFornecedor")
    cod_lote: Optional[int] = Field(default=None, alias="codLote")
    cod_tipo_documento: Optional[int] = Field(default=None, alias="codTipoDocumento")
    data_documento: Optional[str] = Field(default=None, alias="dataDocumento")
    nome_fornecedor: Optional[str] = Field(default=None, alias="nomeFornecedor")
    num_documento: Optional[str] = Field(default=None, alias="numDocumento")
    num_ressarcimento: Optional[str] = Field(default=None, alias="numRessarcimento")
    parcela: Optional[int] = None
    tipo_despesa: Optional[str] = Field(default=None, alias="tipoDespesa")
    tipo_documento: Optional[str] = Field(default=None, alias="tipoDocumento")
    url_documento: Optional[str] = Field(default=None, alias="urlDocumento")
    valor_documento: Optional[float] = Field(default=None, alias="valorDocumento")
    valor_glosa: Optional[float] = Field(default=None, alias="valorGlosa")
    valor_liquido: Optional[float] = Field(default=None, alias="valorLiquido")

    created_at: datetime = Field(
        default_factory=_now, sa_column=Column(DateTime(timezone=True), server_default=func.now())
    )

    deputado: Optional[Deputado] = Relationship(back_populates="despesas")


# ─── Proposicao ───────────────────────────────────────────────


class Proposicao(SQLModel, table=True):
    __tablename__ = "proposicoes"
    __table_args__ = (Index("ix_proposicoes_ano", "ano"),)

    id: int = Field(primary_key=True)
    uri: str
    sigla_tipo: str = Field(alias="siglaTipo")
    cod_tipo: int = Field(alias="codTipo")
    numero: int
    ano: int
    ementa: str = Field(sa_column=Column(Text, nullable=False))
    data_apresentacao: Optional[str] = Field(default=None, alias="dataApresentacao")
    uri_orgao_numerador: Optional[str] = Field(default=None, alias="uriOrgaoNumerador")
    uri_autores: Optional[str] = Field(default=None, alias="uriAutores")
    descricao_tipo: Optional[str] = Field(default=None, alias="descricaoTipo")
    ementa_detalhada: Optional[str] = Field(default=None, sa_column=Column(Text, nullable=True), alias="ementaDetalhada")
    keywords: Optional[str] = None
    uri_prop_principal: Optional[str] = Field(default=None, alias="uriPropPrincipal")
    uri_prop_anterior: Optional[str] = Field(default=None, alias="uriPropAnterior")
    uri_prop_posterior: Optional[str] = Field(default=None, alias="uriPropPosterior")
    url_inteiro_teor: Optional[str] = Field(default=None, alias="urlInteiroTeor")
    urn_final: Optional[str] = Field(default=None, alias="urnFinal")
    texto_inteiro_teor: Optional[str] = Field(default=None, sa_column=Column(Text, nullable=True))
    justificativa: Optional[str] = Field(default=None, sa_column=Column(Text, nullable=True))
    tramitacoes: Optional[List[Dict]] = Field(default=None, sa_column=Column(JSON, nullable=True))
    votacoes: Optional[List[Dict]] = Field(default=None, sa_column=Column(JSON, nullable=True))
    autores: Optional[List[Dict]] = Field(default=None, sa_column=Column(JSON, nullable=True))

    created_at: datetime = Field(
        default_factory=_now, sa_column=Column(DateTime(timezone=True), server_default=func.now())
    )
    updated_at: datetime = Field(
        default_factory=_now, sa_column=Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    )



# ─── Artigo ───────────────────────────────────────────────────


class Artigo(SQLModel, table=True):
    __tablename__ = "artigos"

    id: Optional[int] = Field(default=None, primary_key=True)
    id_proposicao: int = Field(index=True)
    titulo: str
    subtitulo: str
    lide: str = Field(sa_column=Column(Text, nullable=False))
    corpo: str = Field(sa_column=Column(Text, nullable=False))
    relevante: bool = Field(default=False)
    post_url: Optional[str] = Field(default=None)

    created_at: datetime = Field(
        default_factory=_now, sa_column=Column(DateTime(timezone=True), server_default=func.now())
    )
