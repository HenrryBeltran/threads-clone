import { Hono } from "hono";

export const root = new Hono().get("/", (ctx) => {
  return ctx.text("Hi from Threads Clone server");
});
