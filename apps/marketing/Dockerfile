# syntax=docker/dockerfile:1

FROM node:24.16.0-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /repo

FROM base AS runtime
ENV NODE_ENV=production

# Browser opens app on host port 5173, not Docker internal hostname
ARG NEXT_PUBLIC_APP_URL=http://localhost:5173
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml tsconfig.base.json ./
COPY apps/marketing apps/marketing

RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile --prod=false

WORKDIR /repo/apps/marketing
RUN pnpm build

EXPOSE 3000
CMD ["pnpm", "start"]