# If you change the Python version here remember to update it in .python-version
ARG BUILD_PYTHON_VERSION=3.14
ARG DEBIAN_DISTRIBUTION="trixie"

# Loosely based on https://hynek.me/articles/docker-uv
# and https://github.com/astral-sh/uv-docker-example/blob/main/multistage.Dockerfile

# ── Build stage ──────────────────────────────────────────────────────────────
# Image with uv pre-installed; builds the virtualenv with all dependencies.
FROM ghcr.io/astral-sh/uv:python${BUILD_PYTHON_VERSION}-${DEBIAN_DISTRIBUTION} AS build
# Use bash with pipefail and set -e for better error handling in the RUN commands.
SHELL ["/bin/bash", "-o", "pipefail", "-exc"]

# Compile to bytecode for faster startup at runtime
ENV UV_COMPILE_BYTECODE=1
# Use the Python bundled in the base image, do not download another
ENV UV_PYTHON_DOWNLOADS=never
# Copy files instead of symlinking (required with --mount=type=cache)
ENV UV_LINK_MODE=copy
# Don't include dev dependencies in the runtime image
ENV UV_NO_DEV=1

# Create the virtualenv in /app so it can be cleanly copied to the final image
ENV PATH=/app/bin:$PATH VIRTUAL_ENV=/app
ENV UV_PROJECT_ENVIRONMENT=/app

# Bind mount lockfiles and install deps without the project
# so they are cached and not re-installed when the source code changes.
RUN --mount=type=cache,target=/root/.cache/uv \
    --mount=type=bind,source=uv.lock,target=uv.lock \
    --mount=type=bind,source=pyproject.toml,target=pyproject.toml \
    --mount=type=bind,source=.python-version,target=.python-version \
    uv sync --locked --no-install-project

# Now copy the source and install the package.
WORKDIR /build
COPY pyproject.toml uv.lock README.md /build/
COPY src/mentyx /build/src/mentyx
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --locked --no-editable

# ── Runtime stage ─────────────────────────────────────────────────────────────
# Minimal image: Python slim + tini + the /app copied from the build stage.
FROM python:${BUILD_PYTHON_VERSION}-slim-${DEBIAN_DISTRIBUTION} AS runtime
SHELL ["/bin/bash", "-o", "pipefail", "-exc"]

# Install tini and any extra packages we need.
ARG EXTRA_DEBIAN_PACKAGES=""

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update -qy && apt-get upgrade -qyy && \
    apt-get install -qyy --no-install-recommends tini ${EXTRA_DEBIAN_PACKAGES} && \
    apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* \
    /var/cache/apt/archives/* /var/log/*

# Do not run as root.
RUN groupadd --system --gid 999 appuser \
    && useradd --system --gid 999 --uid 999 --create-home appuser
WORKDIR /app
USER appuser

# Copy the virtualenv and the app from the build stage.
# If you need write access to the project, add --chown=appuser:appuser.
COPY --from=build /app /app

ENV PATH=/app/bin:$PATH VIRTUAL_ENV=/app

# Print Python traceback if the process crashes.
ENV PYTHONFAULTHANDLER=true
# Don't buffer output, logs should be printed immediately.
ENV PYTHONUNBUFFERED=true
# Set the signal to SIGINT for graceful Python shutdown.
STOPSIGNAL SIGINT

# Listen in a port defined by the environment variable.
# This is required by Cloud Run but also good practice in general.
ENV PORT=8080

# tini as init: handles signals and zombie reaping correctly.
# sh -c so that ${PORT} is expanded before being passed to uvicorn.
ENTRYPOINT ["tini", "-g", "--"]
CMD ["sh", "-c", "uvicorn mentyx.main:app --host 0.0.0.0 --port ${PORT}"]
