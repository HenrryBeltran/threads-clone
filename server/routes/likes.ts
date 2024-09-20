import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { and, eq } from "drizzle-orm";
import { Hono } from "hono";
import { nanoid } from "nanoid";
import { db } from "../db";
import { likes } from "../db/schemas/likes";
import { threads as threadsTable } from "../db/schemas/threads";
import { users } from "../db/schemas/users";
import { safeTry } from "../lib/safe-try";
import { getUser } from "../middleware/getUser";

dayjs.extend(utc);

export const postLikes = new Hono()
  .get("/post/like/:threadId", getUser, async (ctx) => {
    const user = ctx.get("user");
    const threadId = ctx.req.param("threadId");

    const { error: threadError, result: thread } = await safeTry(
      db.query.threads.findFirst({
        columns: { id: true },
        where: eq(threadsTable.id, threadId),
      }),
    );

    if (threadError) {
      return ctx.json(threadError, 500);
    }

    if (thread === undefined) {
      return ctx.json({ message: "Current profile not found." }, 404);
    }

    const { error, result } = await safeTry(
      db.query.likes.findFirst({
        where: and(eq(likes.userLike, user.id), eq(likes.likedPost, thread.id)),
      }),
    );

    if (error) {
      return ctx.json(error, 500);
    }

    if (result === undefined) {
      return ctx.json({ like: false }, 200);
    }

    return ctx.json({ like: true }, 200);
  })
  .post("/post/like/:threadId", getUser, async (ctx) => {
    const user = ctx.get("user");
    const threadId = ctx.req.param("threadId");

    const { error: threadError, result: thread } = await safeTry(
      db.query.threads.findFirst({
        columns: { id: true, likesCount: true },
        where: eq(threadsTable.id, threadId),
      }),
    );

    if (threadError) {
      return ctx.json(threadError, 500);
    }

    if (thread === undefined) {
      return ctx.json({ message: "Thread not found." }, 404);
    }

    const { result: duplicateLike } = await safeTry(
      db.query.likes.findFirst({
        where: and(eq(likes.userLike, user.id), eq(likes.likedPost, thread.id)),
      }),
    );

    if (duplicateLike !== null && duplicateLike !== undefined) {
      return ctx.json({ like: true }, 200);
    }

    const { error: updateLikeThreadsError } = await safeTry(
      db
        .update(threadsTable)
        .set({
          likesCount: thread.likesCount + 1,
          updatedAt: dayjs.utc().format("YYYY-MM-DD HH:mm:ss"),
        })
        .where(eq(threadsTable.id, thread.id)),
    );

    const { error: insertLikeError } = await safeTry(
      db.insert(likes).values({
        id: nanoid(),
        userLike: user.id,
        likedPost: thread.id,
      }),
    );

    if (updateLikeThreadsError || insertLikeError) {
      return ctx.json(updateLikeThreadsError || insertLikeError, 500);
    }

    return ctx.json({ like: true }, 200);
  })
  .post("/post/unlike/:threadId", getUser, async (ctx) => {
    const user = ctx.get("user");
    const threadId = ctx.req.param("threadId");

    const { error: threadError, result: thread } = await safeTry(
      db.query.threads.findFirst({
        columns: { id: true, likesCount: true },
        where: eq(threadsTable.id, threadId),
      }),
    );

    if (threadError) {
      return ctx.json(threadError, 500);
    }

    if (!thread) {
      return ctx.json({ message: "Thread not found." }, 404);
    }

    const { result: duplicateLike } = await safeTry(
      db.query.likes.findFirst({
        where: and(eq(likes.userLike, user.id), eq(likes.likedPost, thread.id)),
      }),
    );

    if (duplicateLike === undefined) {
      return ctx.json({ like: true }, 200);
    }

    const { error: unlikeThreadError } = await safeTry(
      db
        .update(threadsTable)
        .set({
          likesCount: thread.likesCount - 1,
          updatedAt: dayjs.utc().format("YYYY-MM-DD HH:mm:ss"),
        })
        .where(eq(threadsTable.id, thread.id)),
    );

    const { error: unlikeError } = await safeTry(
      db.delete(likes).where(and(eq(likes.userLike, user.id), eq(likes.likedPost, thread.id))),
    );

    if (unlikeThreadError || unlikeError) {
      return ctx.json(unlikeThreadError || unlikeError, 500);
    }

    return ctx.json({ like: false }, 200);
  });
