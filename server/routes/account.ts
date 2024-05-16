import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { insertUserSchema } from "../common/schemas/user";
import { db } from "../db";
import { users } from "../db/schemas/users";
import { safeTry } from "../lib/safe-try";
import { getUser } from "../middleware/getUser";

export const account = new Hono()
  .get("/user", getUser, async (ctx) => {
    const user = ctx.get("user");

    return ctx.json(user);
  })
  .put("/user", zValidator("json", insertUserSchema), getUser, async (ctx) => {
    const body = ctx.req.valid("json");
    const user = ctx.get("user");

    const newData = { ...user, ...body };

    const { error } = await safeTry(
      db.update(users).set(newData).where(eq(users.id, user.data.id)),
    );

    if (error) {
      return ctx.json(error, 500);
    }

    return ctx.json(200);
  })
  .delete("/user", getUser, async (ctx) => {
    const user = ctx.get("user");

    const { error } = await safeTry(db.delete(users).where(eq(users.id, user.data.id)));

    if (error) {
      return ctx.json(error, 500);
    }

    return ctx.json(200);
  });
