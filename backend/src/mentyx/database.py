import os
from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://localhost/mentyx")


class Base(DeclarativeBase):
    pass


# Engine is created on the first call to get_session, not at import time.
# This allows tests to override the dependency without needing asyncpg.
_engine = None
_async_session = None


def get_engine():
    global _engine, _async_session
    if _engine is None:
        _engine = create_async_engine(DATABASE_URL)
        _async_session = async_sessionmaker(_engine, expire_on_commit=False)
    return _engine


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    get_engine()
    async with _async_session() as session:
        yield session
