import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import { logger } from "hono/logger";
import { account } from "./routes/account";
import { auth } from "./routes/auth";
import { root } from "./routes/root";

const app = new Hono();

app.use(logger());

const apiRoutes = app
  .basePath("/api")
  .route("/", root)
  .route("/auth", auth)
  .route("/account", account);

app.get("*", serveStatic({ root: "./frontend/dist" }));
app.get("*", serveStatic({ path: "./frontend/dist/index.html" }));

export default app;
export type ApiRoutes = typeof apiRoutes;
