import os

from typing import Generator
from sqlmodel import create_engine, Session, SQLModel
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/autonews")

engine = create_engine(DATABASE_URL, echo=False)


def get_engine():
    return engine


def setup():
    """Cria todas as tabelas definidas nos modelos SQLModel."""
      # noqa: F401 — garante que os modelos sejam registrados
    SQLModel.metadata.create_all(engine)


def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session
        
        
