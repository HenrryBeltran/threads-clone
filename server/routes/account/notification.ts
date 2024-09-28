import { Hono } from "hono";
import { getUser } from "../../middleware/getUser";

export const notification = new Hono()
  .get("/all/:receiver", getUser, async (ctx) => {
    const receiver = ctx.req.param("receiver");

    return ctx.json({ receiver }, 200);
  })
  .get("/unread/:receiver", getUser, async (ctx) => {
    const receiver = ctx.req.param("receiver");

    return ctx.json({ receiver }, 200);
  })
  .post("/mark-as-read/:notificationId", getUser, async (ctx) => {
    const notificationId = ctx.req.param("notificationId");

    return ctx.json({ notificationId, message: "Read", readStatus: true }, 200);
  });
