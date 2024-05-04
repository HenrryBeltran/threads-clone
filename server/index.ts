import app from "./app";

export const server = Bun.serve({
  fetch: app.fetch,
});

console.log(`~ Running on port ${server.port}`);
