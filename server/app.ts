import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import { logger } from "hono/logger";
import { accountUser } from "./routes/account";
import { accountActivity } from "./routes/account/activity";
import { accountFollow } from "./routes/account/follow";
import { auth } from "./routes/auth";
import { postLikes } from "./routes/likes";
import { root } from "./routes/root";
import { search } from "./routes/search";
import { threads } from "./routes/threads";
import { user } from "./routes/user";

const app = new Hono();

app.use(logger());

const apiRoutes = app
  .basePath("/api")
  .route("/", root)
  .route("/threads", threads)
  .route("/thread", postLikes)
  .route("/search", search)
  .route("/user", user)
  .route("/auth", auth)
  .route("/account/user", accountUser)
  .route("/account/profile", accountFollow)
  .route("/account/activity", accountActivity);

app.get("*", serveStatic({ root: "./frontend/dist" }));
app.get("*", serveStatic({ path: "./frontend/dist/index.html" }));

export default app;
export type HonoApiRoutes = typeof apiRoutes;
