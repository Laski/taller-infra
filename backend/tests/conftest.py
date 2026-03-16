import pytest
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from mentyx.database import Base, get_session
from mentyx.main import app
import mentyx.models  # noqa: F401 — registers Question and Vote in Base.metadata


@pytest.fixture
async def override_db():
    # SQLite in-memory database for testing, no need for asyncpg or a real PostgreSQL instance.
    engine = create_async_engine("sqlite+aiosqlite:///:memory:")

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    session_factory = async_sessionmaker(engine, expire_on_commit=False)

    async def get_test_session() -> AsyncSession:
        async with session_factory() as session:
            yield session

    app.dependency_overrides[get_session] = get_test_session

    yield

    app.dependency_overrides.clear()
    await engine.dispose()
