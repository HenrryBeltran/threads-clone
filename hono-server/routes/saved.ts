import { and, eq } from "drizzle-orm";
import { Hono } from "hono";
import { nanoid } from "nanoid";
import { db } from "../db";
import { saved as savedTable } from "../db/schemas/saved";
import { threads as threadsTable } from "../db/schemas/threads";
import { safeTry } from "../lib/safe-try";
import { getUser } from "../middleware/getUser";

export const postSaved = new Hono()
  .get("/post/save/:threadId", getUser, async (ctx) => {
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
      db.query.saved.findFirst({
        where: and(eq(savedTable.owner, user.id), eq(savedTable.savedPost, thread.id)),
      }),
    );

    if (error) {
      return ctx.json(error, 500);
    }

    if (result === undefined) {
      return ctx.json({ saved: false }, 200);
    }

    return ctx.json({ saved: true }, 200);
  })
  .post("/post/save/:threadId", getUser, async (ctx) => {
    const user = ctx.get("user");
    const threadId = ctx.req.param("threadId");

    const { error: threadError, result: thread } = await safeTry(
      db.query.threads.findFirst({
        columns: { id: true, authorId: true, postId: true },
        where: eq(threadsTable.id, threadId),
      }),
    );

    if (threadError) {
      return ctx.json(threadError, 500);
    }

    if (thread === undefined) {
      return ctx.json({ message: "Thread not found." }, 404);
    }

    const { result: duplicateSave } = await safeTry(
      db.query.saved.findFirst({
        where: and(eq(savedTable.owner, user.id), eq(savedTable.savedPost, thread.id)),
      }),
    );

    if (duplicateSave !== null && duplicateSave !== undefined) {
      return ctx.json({ saved: true }, 200);
    }

    const { error: insertError } = await safeTry(
      db.insert(savedTable).values({
        id: nanoid(),
        owner: user.id,
        savedPost: thread.id,
      }),
    );

    if (insertError) {
      return ctx.json(insertError, 500);
    }

    return ctx.json({ saved: true }, 200);
  })
  .post("/post/unsave/:threadId", getUser, async (ctx) => {
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

    if (!thread) {
      return ctx.json({ message: "Thread not found." }, 404);
    }

    const { result: duplicateSave } = await safeTry(
      db.query.saved.findFirst({
        where: and(eq(savedTable.owner, user.id), eq(savedTable.savedPost, thread.id)),
      }),
    );

    if (duplicateSave === undefined) {
      return ctx.json({ saved: true }, 200);
    }

    const { error: unsaveError } = await safeTry(
      db.delete(savedTable).where(and(eq(savedTable.owner, user.id), eq(savedTable.savedPost, thread.id))),
    );

    if (unsaveError) {
      return ctx.json(unsaveError, 500);
    }

    return ctx.json({ saved: false }, 200);
  });
