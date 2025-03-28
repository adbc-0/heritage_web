FROM node:23.7.0 AS base
WORKDIR /app

COPY . .

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS build

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile
RUN pnpm run build

FROM caddy:2.9.1-alpine AS server
COPY --from=build /app/dist /srv