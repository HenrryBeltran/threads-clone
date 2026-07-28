import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { db } from "../db";
import { users } from "../db/schemas/users";
import { safeTry } from "../lib/safe-try";

export type UserProfile = {
  id: string;
  username: string;
  name: string;
  bio: string;
  link: string | null;
  profilePictureId: string | null;
  followersCount: number;
  followingsCount: number;
};

export const user = new Hono()
  .get("/profile/:username", async (ctx) => {
    const username = ctx.req.param("username");
    const { error, result } = await safeTry(
      db.query.users.findFirst({
        columns: {
          id: true,
          username: true,
          name: true,
          bio: true,
          profilePictureId: true,
          link: true,
          followersCount: true,
          followingsCount: true,
        },
        with: {
          targetId: {
            columns: {},
            with: { userId: { columns: { profilePictureId: true } } },
            limit: 2,
            orderBy: ({ createdAt }, { desc }) => [desc(createdAt)],
          },
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
  })
  .get("/test-accounts", async (ctx) => {
    const { error, result } = await safeTry(
      db.query.users.findMany({
        where: eq(users.roles, "viewer"),
        orderBy: ({ createdAt }, { asc }) => [asc(createdAt)],
      }),
    );

    if (error !== null) {
      return ctx.json(error, 500);
    }

    const accounts = result.map((account) => ({ ...account, password: "123456Clone" }));

    return ctx.json(accounts, 200);
  });
