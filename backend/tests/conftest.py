import os
from collections.abc import AsyncGenerator
from pathlib import Path
from urllib.parse import urlparse, urlunparse

import pytest
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

import mentyx.models  # noqa: F401 — registers Question and Vote in Base.metadata
from mentyx.database import Base, get_session
from mentyx.main import app

_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///:memory:")


def _derive_urls(url: str) -> tuple[str, str | None]:
    """Return (test_db_url, maintenance_url).

    - SQLite in-memory: used as-is; already isolated.
    - SQLite file: used as-is only if the file does not exist yet; raises otherwise.
    - PostgreSQL: database name is replaced with 'test'; maintenance URL points to
      the built-in 'postgres' database so we can CREATE/DROP.
    - Anything else: raises ValueError — add support explicitly if needed.
    """
    parsed = urlparse(url)
    scheme = parsed.scheme.split("+")[0]  # strip driver suffix (e.g. "asyncpg")

    if scheme == "sqlite":
        path = parsed.path  # e.g. "/:memory:" or "/path/to/file.db"
        if path != "/:memory:":
            db_path = Path(path.lstrip("/"))
            if db_path.exists():
                raise FileExistsError(
                    f"SQLite test database file already exists: {db_path}. "
                    "Remove it or use an in-memory URL (sqlite+aiosqlite:///:memory:)."
                )
        return url, None

    if scheme == "postgresql":
        test_url = urlunparse(parsed._replace(path="/test"))
        maintenance_url = urlunparse(parsed._replace(path="/postgres"))
        return test_url, maintenance_url

    raise ValueError(
        f"Test database isolation is not implemented for scheme {scheme!r}. "
        "Add a case in _derive_urls() for this database."
    )


_TEST_URL, _MAINTENANCE_URL = _derive_urls(_DATABASE_URL)


@pytest.fixture
async def override_db():
    if _MAINTENANCE_URL is not None:
        maint = create_async_engine(_MAINTENANCE_URL, isolation_level="AUTOCOMMIT")
        async with maint.connect() as conn:
            await conn.execute(text("DROP DATABASE IF EXISTS test WITH (FORCE)"))
            await conn.execute(text("CREATE DATABASE test"))
        await maint.dispose()

    engine = create_async_engine(_TEST_URL)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    session_factory = async_sessionmaker(engine, expire_on_commit=False)

    async def get_test_session() -> AsyncGenerator[AsyncSession, None]:
        async with session_factory() as session:
            yield session

    app.dependency_overrides[get_session] = get_test_session
    yield
    app.dependency_overrides.clear()
    await engine.dispose()
