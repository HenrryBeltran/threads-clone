import { and, asc, desc, eq } from "drizzle-orm";
import { Hono } from "hono";
import { db } from "../../db";
import { activities as activitiesTable } from "../../db/schemas/activities";
import { safeTry } from "../../lib/safe-try";
import { getUser } from "../../middleware/getUser";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

export type ActivityResult = {
  id: string;
  message: string;
  type: "mention" | "reply" | "follow" | "like";
  sender: string;
  receiver: string;
  readStatus: boolean | null;
  threadPostId: string | null;
  senderInfo: {
    username: string;
    profilePictureId: string | null;
  };
  receiverInfo: {
    username: string;
    profilePictureId: string | null;
  };
  createdAt: string;
  updatedAt: string;
};

export const accountActivity = new Hono()
  .get("/all", getUser, zValidator("query", z.object({ page: z.string() })), async (ctx) => {
    const user = ctx.get("user");
    const page = ctx.req.query("page");
    const offset = page ? Number(page) * 6 : 0;

    const { error, result } = await safeTry(
      db.query.activities.findMany({
        with: {
          senderInfo: { columns: { username: true, profilePictureId: true } },
          receiverInfo: { columns: { username: true, profilePictureId: true } },
        },
        where: eq(activitiesTable.receiver, user.id),
        orderBy: [asc(activitiesTable.readStatus), desc(activitiesTable.updatedAt)],
        limit: 6,
        offset,
      }),
    );

    if (error !== null) {
      return ctx.json(error, 500);
    }

    return ctx.json(result, 200);
  })
  .get("/unread", getUser, async (ctx) => {
    const user = ctx.get("user");

    const { error, result } = await safeTry(
      db.query.activities.findFirst({
        columns: { readStatus: true },
        where: and(eq(activitiesTable.receiver, user.id), eq(activitiesTable.readStatus, false)),
      }),
    );

    if (error !== null) {
      return ctx.json(error, 500);
    }

    if (result === undefined) {
      return ctx.json({ unread: false });
    }

    if (result.readStatus === null) {
      return ctx.json({ unread: false });
    }

    return ctx.json({ unread: true });
  })
  .post("/mark-as-read", getUser, async (ctx) => {
    const user = ctx.get("user");

    const activitiesQuery = await safeTry(
      db.query.activities.findMany({
        columns: { id: true },
        where: and(eq(activitiesTable.receiver, user.id), eq(activitiesTable.readStatus, false)),
      }),
    );

    if (activitiesQuery.error !== null) {
      return ctx.json(activitiesQuery.error, 500);
    }

    const acitivitiesSize = activitiesQuery.result.length;
    if (acitivitiesSize === 0) {
      return ctx.json({ message: "Already read" }, 200);
    }

    const { error } = await safeTry(
      db.update(activitiesTable).set({ readStatus: true }).where(eq(activitiesTable.receiver, user.id)),
    );

    if (error !== null) {
      return ctx.json(error, 500);
    }

    return ctx.json({ message: "Read" }, 200);
  });
