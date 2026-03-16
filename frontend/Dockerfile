# ── Build stage ────────────────────────────────────────────────────────────────
# Builds the static bundle with Vite.
FROM node:lts-alpine AS build

RUN corepack enable pnpm

WORKDIR /app

# Install dependencies first (cached unless lockfile changes)
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,target=/pnpm-store \
    pnpm install --frozen-lockfile --store-dir /pnpm-store

# VITE_API_URL is baked into the bundle at build time by Vite.
# Pass it as: docker build --build-arg VITE_API_URL=https://...
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

COPY . /app
RUN pnpm build

# ── Runtime stage ──────────────────────────────────────────────────────────────
# Serves the static files with nginx.
FROM nginx:alpine AS runtime

COPY --from=build /app/dist /usr/share/nginx/html

# The nginx image processes *.template files from /etc/nginx/templates/ at startup,
# substituting env vars and writing the result to /etc/nginx/conf.d/.
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

# Cloud Run injects PORT at runtime; default to 3000.
ENV PORT=3000

# Do not daemonize nginx, so it runs in the foreground and keeps the container alive:
CMD ["nginx", "-g", "daemon off;"]
