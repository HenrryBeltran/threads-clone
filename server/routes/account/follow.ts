import { zValidator } from "@hono/zod-validator";
import camelcaseKeys from "camelcase-keys";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { and, eq, sql } from "drizzle-orm";
import { Hono } from "hono";
import { nanoid } from "nanoid";
import { z } from "zod";
import { db } from "../../db";
import { follows } from "../../db/schemas/follows";
import { users } from "../../db/schemas/users";
import { safeTry } from "../../lib/safe-try";
import { getUser } from "../../middleware/getUser";
import { createActivity } from "../../lib/create-activity";

dayjs.extend(utc);

type FollowsResult = {
  id: string;
  username: string;
  name: string;
  profilePictureId: string | null;
  followStatus: number;
}[];

export const accountFollow = new Hono()
  .get("/follow/:targetUsername", getUser, async (ctx) => {
    const user = ctx.get("user");
    const targetUsername = ctx.req.param("targetUsername");

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
  .post("/follow/:targetUsername", getUser, async (ctx) => {
    const user = ctx.get("user");
    const targetUsername = ctx.req.param("targetUsername");

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

    const { result: isFollowingMe } = await safeTry(
      db.query.follows.findFirst({
        where: and(eq(follows.userId, target.id), eq(follows.targetId, user.id)),
      }),
    );

    if (isFollowingMe !== undefined && isFollowingMe !== null) {
      const activity = await safeTry(createActivity("follow", user.id, target.id, "Followed you back"));

      if (activity.error !== null) {
        return ctx.json(activity.error, 500);
      }
    } else {
      const activity = await safeTry(createActivity("follow", user.id, target.id, "Followed you"));

      if (activity.error !== null) {
        return ctx.json(activity.error, 500);
      }
    }

    return ctx.json({ follow: true }, 200);
  })
  .post("/unfollow/:targetUsername", getUser, async (ctx) => {
    const user = ctx.get("user");
    const targetUsername = ctx.req.param("targetUsername");

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
  })
  .get("/followers/:targetId", getUser, zValidator("query", z.object({ page: z.string() })), async (ctx) => {
    const user = ctx.get("user");
    const targetId = ctx.req.param("targetId");
    const page = ctx.req.query("page");
    const offset = page ? Number(page) * 10 : 0;

    const { error, result } = await safeTry(
      db.run(
        sql`
          SELECT
            users.id,
            users.username,
            users.name,
            users.profile_picture_id,
            (
              SELECT COUNT(follows.id)
              FROM follows
              WHERE follows.target_id = users.id AND follows.user_id = ${user.id}
            ) AS 'follow_status'
          FROM follows 
          INNER JOIN users
            ON users.id = follows.user_id
          WHERE follows.target_id = ${targetId}
          ORDER BY follows.created_at DESC
          LIMIT 10 OFFSET ${offset};
        `,
      ),
    );

    if (error !== null) {
      return ctx.json(error, 500);
    }

    const rows = camelcaseKeys<FollowsResult>(result.rows as any);

    return ctx.json(rows, 200);
  })
  .get("/followings/:targetId", getUser, zValidator("query", z.object({ page: z.string() })), async (ctx) => {
    const user = ctx.get("user");
    const targetId = ctx.req.param("targetId");
    const page = ctx.req.query("page");
    const offset = page ? Number(page) * 10 : 0;

    const { error, result } = await safeTry(
      db.run(
        sql`
          SELECT
            users.id,
            users.username,
            users.name,
            users.profile_picture_id,
            (
              SELECT COUNT(follows.id)
              FROM follows
              WHERE follows.target_id = users.id AND follows.user_id = ${user.id}
            ) AS 'follow_status'
          FROM follows 
          INNER JOIN users
            ON users.id = follows.target_id
          WHERE follows.user_id = ${targetId}
          ORDER BY follows.created_at DESC
          LIMIT 10 OFFSET ${offset};
        `,
      ),
    );

    if (error !== null) {
      return ctx.json(error, 500);
    }

    const rows = camelcaseKeys<FollowsResult>(result.rows as any);

    return ctx.json(rows, 200);
  });
