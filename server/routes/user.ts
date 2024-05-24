import { Hono } from "hono";
import { safeTry } from "../lib/safe-try";
import { db } from "../db";
import { eq } from "drizzle-orm";
import { users } from "../db/schemas/users";

export const user = new Hono().get("/profile/:username", async (ctx) => {
  const username = ctx.req.param("username");
  const { error, result } = await safeTry(
    db.query.users.findFirst({
      columns: {
        username: true,
        name: true,
        bio: true,
        profilePictureId: true,
        link: true,
        followersCount: true,
        followingsCount: true,
      },
      where: eq(users.username, username),
    }),
  );

  if (error) {
    return ctx.json(error, 500);
  }

  if (!result) {
    return ctx.json({ message: "Profile account not found." }, 404);
  }

  return ctx.json(result, 200);
});
