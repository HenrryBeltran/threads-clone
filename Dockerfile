FROM oven/bun:1.3.14-slim AS build

WORKDIR /app

ENV NODE_ENV=production

RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y \
    build-essential \
    pkg-config \
    python-is-python3

COPY bun.lockb package.json ./
RUN bun install --frozen-lockfile

COPY frontend/package.json frontend/bun.lockb ./frontend/
RUN cd frontend && bun install --frozen-lockfile

COPY . .

WORKDIR /app/frontend
RUN bun run build

WORKDIR /app
RUN bun run build:server


# ---------------- Runtime ----------------

FROM oven/bun:1.3.14-slim

WORKDIR /app

ENV NODE_ENV=production

COPY --from=build /app/server.js .

COPY --from=build /app/frontend/dist ./frontend/dist

EXPOSE 3000

CMD ["bun", "server.js"]
