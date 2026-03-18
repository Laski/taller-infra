# ── Build stage ────────────────────────────────────────────────────────────────
# Builds the static bundle with Vite.
ARG NODE_VERSION="24"
ARG NGINX_VERSION="1.29"

FROM node:${NODE_VERSION}-alpine AS build

RUN corepack enable pnpm

WORKDIR /app

# Install dependencies first (cached unless lockfile changes)
RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=pnpm-lock.yaml,target=pnpm-lock.yaml \
    pnpm install --frozen-lockfile

# VITE_API_URL is baked into the bundle at build time by Vite.
# Pass it as: docker build --build-arg VITE_API_URL=https://...
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

COPY src/ /app/src/
COPY public/ /app/public/
COPY index.html vite.config.ts package.json tsconfig* pnpm* /app/

RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    pnpm build

# ── Runtime stage ──────────────────────────────────────────────────────────────
# Serves the static files with nginx.
FROM nginx:${NGINX_VERSION}-alpine AS runtime

# Cloud Run injects PORT at runtime; default to 3000.
ENV PORT=3000

RUN chown -R nginx:nginx /var/cache/nginx /var/log/nginx /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid

COPY --from=build --chown=nginx:nginx /app/dist /usr/share/nginx/html

# The nginx image processes *.template files from /etc/nginx/templates/ at startup,
# substituting env vars and writing the result to /etc/nginx/conf.d/.
COPY --chown=nginx:nginx nginx.conf.template /etc/nginx/templates/default.conf.template

USER nginx

# Do not daemonize nginx, so it runs in the foreground and keeps the container alive:
CMD ["nginx", "-g", "daemon off;"]
