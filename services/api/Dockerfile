# syntax=docker/dockerfile:1

# Fastify API in a pnpm monorepo.
# Runs via tsx (like local dev) - avoids compiling source-only @dreamai/contracts.
FROM node:24.16.0-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /repo

FROM base AS runtime
ENV NODE_ENV=production

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml tsconfig.base.json ./
COPY packages/contracts packages/contracts
COPY services/api services/api

RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile

WORKDIR /repo/services/api
EXPOSE 3001
CMD ["pnpm", "exec", "tsx", "src/index.ts"]