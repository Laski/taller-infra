# If you change the Python version here remember to update it in .python-version
ARG BUILD_PYTHON_VERSION=3.14
ARG DEBIAN_DISTRIBUTION="trixie"

# ── Build stage ──────────────────────────────────────────────────────────────
# Image with uv pre-installed; builds the virtualenv with all dependencies.
FROM ghcr.io/astral-sh/uv:python${BUILD_PYTHON_VERSION}-${DEBIAN_DISTRIBUTION} AS build

# Compile to bytecode for faster startup at runtime:
ENV UV_COMPILE_BYTECODE=1
# Use the Python bundled in the base image, do not download another:
ENV UV_PYTHON_DOWNLOADS=0
# Copy files instead of symlinking (required with --mount=type=cache):
ENV UV_LINK_MODE=copy
# Don't include dev dependencies in the runtime image:
ENV UV_DEV=0

# Create the virtualenv in /venv so it can be cleanly copied to the final image:
RUN --mount=type=cache,target=/root/.cache uv venv /venv
ENV PATH=/venv/bin:$PATH VIRTUAL_ENV=/venv
ENV UV_PROJECT_ENVIRONMENT=/venv

WORKDIR /app

# Copy lock files first and install deps without the project.
# This layer is cached as long as pyproject.toml and uv.lock don't change.
COPY pyproject.toml uv.lock .python-version ./
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --locked --no-dev --no-install-project

# Now copy the source and install the package:
COPY . /app
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --locked --no-dev

# ── Runtime stage ─────────────────────────────────────────────────────────────
# Minimal image: Python slim + tini + the /venv copied from the build stage.
FROM python:${BUILD_PYTHON_VERSION}-slim-${DEBIAN_DISTRIBUTION} AS runtime

RUN export DEBIAN_FRONTEND=noninteractive && \
    apt-get update && apt-get upgrade --yes && \
    apt-get install --yes --no-install-recommends tini && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Do not run as root:
RUN useradd --create-home appuser
WORKDIR /app
USER appuser

# Copy the virtualenv and the app from the build stage.
# The --chown ensures the files are owned by appuser, not root.
COPY --from=build --chown=appuser:appuser /venv /venv
COPY --from=build --chown=appuser:appuser /app/ /app/

ENV PATH=/venv/bin:$PATH VIRTUAL_ENV=/venv

# Print Python traceback if the process crashes:
ENV PYTHONFAULTHANDLER=true

# Cloud Run injects this automatically (defaults to 8080).
ENV PORT=8080

# tini as init: handles signals and zombie reaping correctly.
# sh -c so that ${PORT} is expanded before being passed to uvicorn.
ENTRYPOINT ["tini", "-g", "--"]
CMD ["sh", "-c", "uvicorn mentyx.main:app --host 0.0.0.0 --port ${PORT}"]
