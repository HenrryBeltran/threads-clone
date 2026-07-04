FROM oven/bun:1.3.14-slim AS base

LABEL fly_launch_runtime="Bun"

WORKDIR /app

ENV NODE_ENV="production"


FROM base as build

RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential pkg-config python-is-python3

COPY --link bun.lockb package.json ./
RUN bun install --ci 

COPY --link frontend/bun.lockb frontend/package.json ./frontend/
RUN cd frontend && bun install --ci

COPY --link . .

WORKDIR /app/frontend
RUN bun run build

RUN find . -mindepth 1 ! -regex '^./dist\(/.*\)?' -delete

FROM base

COPY --from=build /app /app

EXPOSE 3000
CMD [ "bun", "run", "start" ]
