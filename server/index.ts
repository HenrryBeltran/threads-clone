import app from "./app";

export const server = Bun.serve({
  port: process.env.PORT || 3000,
  fetch: app.fetch,
});

console.log(`~ Running on port ${server.port}`);
