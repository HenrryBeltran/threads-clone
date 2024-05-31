import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { and, eq } from "drizzle-orm";
import { Hono } from "hono";
import { nanoid } from "nanoid";
import { db } from "../../db";
import { follows } from "../../db/schemas/follows";
import { users } from "../../db/schemas/users";
import { safeTry } from "../../lib/safe-try";
import { getUser } from "../../middleware/getUser";

dayjs.extend(utc);

export const accountFollow = new Hono()
  .get("/follow/:target-username", getUser, async (ctx) => {
    const user = ctx.get("user");
    const targetUsername = ctx.req.param("target-username");

    const { error: targetError, result: target } = await safeTry(
      db.query.users.findFirst({
        columns: { id: true },
        where: eq(users.username, targetUsername),
      }),
    );

    if (targetError) {
      return ctx.json(targetError, 500);
    }

    if (!target) {
      return ctx.json({ message: "Current profile not found." }, 404);
    }

    const { error, result } = await safeTry(
      db.query.follows.findFirst({
        where: and(eq(follows.userId, user.id), eq(follows.targetId, target.id)),
      }),
    );

    if (error) {
      return ctx.json(error, 500);
    }

    if (result === undefined) {
      return ctx.json({ follow: false }, 200);
    }

    return ctx.json({ follow: true }, 200);
  })
  .post("/follow/:target-username", getUser, async (ctx) => {
    const user = ctx.get("user");
    const targetUsername = ctx.req.param("target-username");

    const { error: targetError, result: target } = await safeTry(
      db.query.users.findFirst({
        columns: { id: true, followersCount: true },
        where: eq(users.username, targetUsername),
      }),
    );

    if (targetError) {
      return ctx.json(targetError, 500);
    }

    if (!target) {
      return ctx.json({ message: "Target not found." }, 404);
    }

    const { result: followDuplicate } = await safeTry(
      db.query.follows.findFirst({
        where: and(eq(follows.userId, user.id), eq(follows.targetId, target.id)),
      }),
    );

    if (followDuplicate) {
      return ctx.json({ follow: true }, 200);
    }

    const { error: addFollowingCountError } = await safeTry(
      db
        .update(users)
        .set({
          followingsCount: user.followingsCount + 1,
          updatedAt: dayjs.utc().format("YYYY-MM-DD HH:mm:ss"),
        })
        .where(eq(users.id, user.id)),
    );
    const { error: addFollowerCountError } = await safeTry(
      db
        .update(users)
        .set({
          followersCount: target.followersCount + 1,
          updatedAt: dayjs.utc().format("YYYY-MM-DD HH:mm:ss"),
        })
        .where(eq(users.id, target.id)),
    );
    const { error: insertError } = await safeTry(
      db.insert(follows).values({
        id: nanoid(),
        userId: user.id,
        targetId: target.id,
      }),
    );

    if (addFollowingCountError || addFollowerCountError || insertError) {
      return ctx.json(addFollowingCountError || addFollowerCountError || insertError, 500);
    }

    return ctx.json({ follow: true }, 200);
  })
  .post("/unfollow/:target-username", getUser, async (ctx) => {
    const user = ctx.get("user");
    const targetUsername = ctx.req.param("target-username");

    const { error: targetError, result: target } = await safeTry(
      db.query.users.findFirst({
        columns: { id: true, followersCount: true },
        where: eq(users.username, targetUsername),
      }),
    );

    if (targetError) {
      return ctx.json(targetError, 500);
    }

    if (!target) {
      return ctx.json({ message: "Target not found." }, 404);
    }

    const { result: followDuplicate } = await safeTry(
      db.query.follows.findFirst({
        where: and(eq(follows.userId, user.id), eq(follows.targetId, target.id)),
      }),
    );

    if (followDuplicate === undefined) {
      return ctx.json({ follow: true }, 200);
    }

    const { error: subtractFollowingCountError } = await safeTry(
      db
        .update(users)
        .set({
          followingsCount: user.followingsCount - 1,
          updatedAt: dayjs.utc().format("YYYY-MM-DD HH:mm:ss"),
        })
        .where(eq(users.id, user.id)),
    );
    const { error: subtractFollowerCountError } = await safeTry(
      db
        .update(users)
        .set({
          followersCount: target.followersCount - 1,
          updatedAt: dayjs.utc().format("YYYY-MM-DD HH:mm:ss"),
        })
        .where(eq(users.id, target.id)),
    );
    const { error: deleteError } = await safeTry(
      db.delete(follows).where(and(eq(follows.userId, user.id), eq(follows.targetId, target.id))),
    );

    if (subtractFollowingCountError || subtractFollowerCountError || deleteError) {
      return ctx.json(subtractFollowingCountError || subtractFollowerCountError || deleteError, 500);
    }

    return ctx.json({ follow: false }, 200);
  });
