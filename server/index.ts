import app from "./app";

const port = Number(process.env.PORT ?? 3000);

export const server = Bun.serve({
  port,
  fetch: app.fetch,
});

console.log(`~ Running on port ${server.port}`);
