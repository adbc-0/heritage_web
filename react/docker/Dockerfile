FROM node:22.9.0 AS base
WORKDIR /app

COPY . .

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile
RUN pnpm run build

FROM caddy:2.8.4-alpine AS server
COPY --from=build /app/dist /srv