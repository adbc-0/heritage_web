FROM node:22.9.0 AS build
WORKDIR /app

# Install dependencies
COPY lib ./lib/
COPY package.json .
COPY pnpm-lock.yaml .
RUN npm install

COPY nginx ./nginx/
COPY public ./public/
COPY src ./src/
COPY eslint.config.js .
COPY index.html .
COPY postcss.config.js .
COPY tailwind.config.js .
COPY tsconfig.json .
COPY tsconfig.app.json .
COPY tsconfig.node.json .
COPY vite.config.ts .
COPY .env.production .

RUN npm run build