import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import { logger } from "hono/logger";
import { root } from "./routes/root";
import { users } from "./routes/users";
import { authSession, authUser } from "./routes/auth";

const app = new Hono();

app.use(logger());

const apiRoutes = app
  .basePath("/api")
  .route("/", root)
  .route("/users", users)
  .route("/auth", authSession)
  .route("/auth", authUser);

app.get("*", serveStatic({ root: "./frontend/dist" }));
app.get("*", serveStatic({ path: "./frontend/dist/index.html" }));

export default app;
export type ApiRoutes = typeof apiRoutes;
