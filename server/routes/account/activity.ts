import { Hono } from "hono";
import { getUser } from "../../middleware/getUser";
import { safeTry } from "../../lib/safe-try";
import { db } from "../../db";
import { and, eq } from "drizzle-orm";
import { notifications as notificationsTable } from "../../db/schemas/notifications";

type NotificationResult = {
  id: string;
  message: string;
  type: "mention" | "like" | "reply";
  sender: string;
  receiver: string;
  readStatus: boolean | null;
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

export const activity = new Hono()
  .get("/all", getUser, async (ctx) => {
    const user = ctx.get("user");

    const notifications = await safeTry(
      db.query.notifications.findMany({
        with: {
          senderInfo: { columns: { username: true, profilePictureId: true } },
          receiverInfo: { columns: { username: true, profilePictureId: true } },
        },
        where: eq(notificationsTable.receiver, user.id),
      }),
    );

    if (notifications.error !== null) {
      return ctx.json(notifications.error, 500);
    }

    const notificationsSize = notifications.result.length;

    if (notificationsSize === 0) {
      return ctx.json({ read: [], unread: [] }, 200);
    }

    const read: NotificationResult[] = [];
    const unread: NotificationResult[] = [];

    for (let i = 0; i < notificationsSize; i++) {
      const notification = notifications.result[i];

      if (notification.readStatus === null) continue;

      if (notification.readStatus === true) {
        read.push(notification);
      } else {
        unread.push(notification);
      }
    }

    return ctx.json({ read, unread }, 200);
  })
  .get("/unread", getUser, async (ctx) => {
    const user = ctx.get("user");

    const { error, result } = await safeTry(
      db.query.notifications.findFirst({
        columns: { readStatus: true },
        where: and(eq(notificationsTable.receiver, user.id), eq(notificationsTable.readStatus, false)),
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

    console.log("~ Read status", result.readStatus);

    return ctx.json({ unread: true });
  })
  .post("/mark-as-read", getUser, async (ctx) => {
    const user = ctx.get("user");

    const notifications = await safeTry(
      db.query.notifications.findMany({
        columns: { id: true },
        where: and(eq(notificationsTable.receiver, user.id), eq(notificationsTable.readStatus, false)),
      }),
    );

    if (notifications.error !== null) {
      return ctx.json(notifications.error, 500);
    }

    const notificationsSize = notifications.result.length;
    if (notificationsSize === 0) {
      return ctx.json({ message: "Already read" }, 200);
    }

    const { error } = await safeTry(
      db.update(notificationsTable).set({ readStatus: true }).where(eq(notificationsTable.receiver, user.id)),
    );

    if (error !== null) {
      return ctx.json(error, 500);
    }

    return ctx.json({ message: "Read" }, 200);
  });
