# syntax=docker/dockerfile:1.7

ARG NODE_VERSION=22
ARG NGINX_VERSION=1.27

# ---------------------------------------------------------------------------
# base: Node + pnpm (vía corepack, usa la versión de "packageManager")
# ---------------------------------------------------------------------------
FROM node:${NODE_VERSION}-alpine AS base
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable
WORKDIR /app

# ---------------------------------------------------------------------------
# deps: instala dependencias. Solo depende de lockfile + package.json,
# así que esta capa se reutiliza mientras no cambien las dependencias.
# ---------------------------------------------------------------------------
FROM base AS deps
COPY pnpm-lock.yaml .npmrc* ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm fetch

COPY package.json ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --offline --frozen-lockfile

# ---------------------------------------------------------------------------
# build: compila la app (tsc + bundler)
# ---------------------------------------------------------------------------
FROM deps AS build
COPY . .

# Variables de build (Vite las incrusta en el bundle; usa prefijo VITE_)
ARG VITE_CALCULATOR_API_URL=/api/v1
ENV VITE_CALCULATOR_API_URL=$VITE_CALCULATOR_API_URL

RUN pnpm build

# ---------------------------------------------------------------------------
# runtime: solo archivos estáticos servidos por nginx sin privilegios
# ---------------------------------------------------------------------------
FROM nginxinc/nginx-unprivileged:${NGINX_VERSION}-alpine AS runtime

# Vite -> dist | Create React App -> build
ARG BUILD_DIR=dist

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/${BUILD_DIR} /usr/share/nginx/html

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget -q --spider http://127.0.0.1:8080/healthz || exit 1

# nginx-unprivileged ya corre como usuario no root (uid 101)
CMD ["nginx", "-g", "daemon off;"]