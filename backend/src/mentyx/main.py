import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import mentyx.models  # noqa: F401 — registers models in Base.metadata
from mentyx.database import Base, get_engine
from mentyx.routers import question, votes


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create all tables on startup if they don't exist yet.
    # For production, replace this with Alembic migrations.
    engine = get_engine()
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield


app = FastAPI(title="Mentyx", lifespan=lifespan)

# CORS_ORIGINS: comma-separated list of allowed origins.
# Defaults to "*" for local dev; lock it down in production via env var.
cors_origins = os.getenv("CORS_ORIGINS", "*").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(question.router)
app.include_router(votes.router)


@app.get("/health")
async def health():
    return {"status": "ok"}
