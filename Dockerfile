# syntax=docker/dockerfile:1

# ---------------- Build stage: Nest + Prisma ----------------
FROM node:22-slim AS server-build

WORKDIR /app/server

RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y \
    build-essential \
    python3 \
    && rm -rf /var/lib/apt/lists/*

COPY server/package.json server/package-lock.json ./
RUN npm ci

COPY server/ ./
RUN npx prisma generate
RUN npm run build

# ---------------- Build stage: Vite frontend ----------------
FROM oven/bun:1.3.14-slim AS frontend-build

WORKDIR /app/frontend

COPY frontend/package.json frontend/bun.lockb ./
RUN bun install --frozen-lockfile

COPY frontend/ ./
RUN bun run build

# ---------------- Runtime ----------------
FROM node:22-slim AS runtime

WORKDIR /app/server

ENV NODE_ENV=production

COPY --from=server-build /app/server/node_modules ./node_modules
COPY --from=server-build /app/server/dist ./dist

COPY --from=frontend-build /app/frontend/dist /app/frontend/dist

EXPOSE 3000

CMD ["node", "dist/src/main.js"]
