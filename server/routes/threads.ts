import { zValidator } from "@hono/zod-validator";
import { v2 as cloudinary } from "cloudinary";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { and, desc, eq } from "drizzle-orm";
import { Hono } from "hono";
import { customAlphabet, nanoid } from "nanoid";
import { z } from "zod";
import { postThreadSchema, replyThreadSchema } from "../common/schemas/thread";
import { db } from "../db";
import { threads as threadsTable } from "../db/schemas/threads";
import { users } from "../db/schemas/users";
import { safeTry } from "../lib/safe-try";
import { getUser } from "../middleware/getUser";

dayjs.extend(utc);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const shortNanoId = customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz", 11);

function filterHashtagAndMentions(text: string, char: "#" | "@") {
  const splitSpaces = text.split(/[\s]/).filter((s) => s.startsWith(char));
  const splitChars = splitSpaces
    .join("")
    .split(char)
    .filter((s) => s.length > 1);
  const reduceDuplicates = [...new Set(splitChars)];
  const words = reduceDuplicates.map((word) => `${char}${word.toLowerCase()}`);

  return words;
}

export const threads = new Hono()
  .get("/posts", zValidator("query", z.object({ page: z.string() })), async (ctx) => {
    const rawPage = ctx.req.query("page");
    const page = rawPage ? Number(rawPage) : 0;

    const { error, result } = await safeTry(
      db.query.threads.findMany({
        with: { author: { columns: { username: true, name: true, profilePictureId: true } } },
        limit: 6,
        offset: page * 6,
        orderBy: desc(threadsTable.createdAt),
      }),
    );

    if (error !== null) {
      return ctx.json(error, 500);
    }

    return ctx.json(result);
  })
  .get("/posts/:userId", zValidator("query", z.object({ page: z.string() })), async (ctx) => {
    const userId = ctx.req.param("userId");
    const rawPage = ctx.req.query("page");
    const page = rawPage ? Number(rawPage) : 0;

    const { error, result } = await safeTry(
      db.query.threads.findMany({
        with: {
          author: {
            columns: { username: true, name: true, profilePictureId: true },
          },
        },
        limit: 6,
        offset: page * 6,
        orderBy: desc(threadsTable.createdAt),
        where: eq(threadsTable.authorId, userId),
      }),
    );

    if (error !== null) {
      return ctx.json(error, 500);
    }

    return ctx.json(result);
  })
  .get("/post/:username/:postId", async (ctx) => {
    const username = ctx.req.param("username");
    const postId = ctx.req.param("postId");

    const author = await safeTry(
      db.query.users.findFirst({
        columns: { id: true },
        where: eq(users.username, username),
      }),
    );

    if (author.error !== null) {
      return ctx.json(author.error, 500);
    }

    if (author.result === undefined) {
      return ctx.json({ message: "Thread author not found." }, 404);
    }

    const { error, result } = await safeTry(
      db.query.threads.findFirst({
        with: { author: { columns: { username: true, name: true, profilePictureId: true } } },
        where: and(eq(threadsTable.authorId, author.result.id), eq(threadsTable.postId, postId)),
      }),
    );

    if (error !== null) {
      return ctx.json(error, 500);
    }

    if (result === undefined) {
      return ctx.json({ message: "Thread not found." }, 404);
    }

    return ctx.json(result);
  })
  .post("/post", getUser, zValidator("json", postThreadSchema), async (ctx) => {
    const user = ctx.get("user");
    const body = ctx.req.valid("json");

    const hashtags = filterHashtagAndMentions(body.text, "#");
    const mentions = filterHashtagAndMentions(body.text, "@");

    let resources: string[] = [];

    if (body.resources) {
      if (body.resources[0].includes("data:image/jpeg;base64,")) {
        const resourceList = body.resources;
        for (const resource of resourceList) {
          const uploadResult = await cloudinary.uploader.upload(resource, { folder: "/threads" }, (error) => {
            if (error !== undefined) {
              console.error(error);
              return ctx.json(error, 500);
            }
          });

          resources.push(uploadResult.public_id);
        }
      } else {
        resources = body.resources;
      }
    }

    const { error, result } = await safeTry(
      db
        .insert(threadsTable)
        .values({
          id: nanoid(),
          postId: shortNanoId(),
          authorId: user.id,
          rootId: user.id,
          parentId: null,
          text: body.text,
          resources: resources.length > 0 ? resources : null,
          hashtags,
          mentions,
          likesCount: 0,
          repliesCount: 0,
          createdAt: dayjs.utc().format("YYYY-MM-DD HH:mm:ss"),
          updatedAt: dayjs.utc().format("YYYY-MM-DD HH:mm:ss"),
        })
        .returning(),
    );

    if (error !== null) {
      return ctx.json(error, 500);
    }

    const fullThread = await safeTry(
      db.query.threads.findFirst({
        with: { author: { columns: { username: true, name: true, profilePictureId: true } } },
        where: eq(threadsTable.id, result[0].id),
      }),
    );

    if (fullThread.error !== null) {
      return ctx.json(error, 500);
    }

    if (fullThread.result === undefined) {
      return ctx.json({ message: "Thread not found." }, 404);
    }

    return ctx.json(fullThread.result);
  })
  .get("/replies/:parentId", zValidator("query", z.object({ offset: z.string() })), async (ctx) => {
    const parentId = ctx.req.param("parentId");
    const rawPage = ctx.req.query("offset");
    const page = rawPage ? Number(rawPage) : 0;

    const { error, result } = await safeTry(
      db.query.threads.findMany({
        with: {
          author: {
            columns: { username: true, name: true, profilePictureId: true },
          },
        },
        limit: 6,
        offset: page * 6,
        orderBy: desc(threadsTable.createdAt),
        where: eq(threadsTable.parentId, parentId),
      }),
    );

    if (error !== null) {
      return ctx.json(error, 500);
    }

    return ctx.json(result);
  })
  .post("/reply", getUser, zValidator("json", replyThreadSchema), async (ctx) => {
    const user = ctx.get("user");
    const body = ctx.req.valid("json");

    const findRootThread = await safeTry(
      db.query.threads.findFirst({ columns: { id: true }, where: eq(threadsTable.id, body.rootId) }),
    );

    if (findRootThread.error !== null) {
      return ctx.json(findRootThread.error, 500);
    }

    if (findRootThread.result === undefined) {
      return ctx.json({ message: "Wrong root id" }, 404);
    }

    const findParentThread = await safeTry(
      db.query.threads.findFirst({
        columns: { id: true, repliesCount: true },
        where: eq(threadsTable.id, body.parentId),
      }),
    );

    if (findParentThread.error !== null) {
      return ctx.json(findParentThread.error, 500);
    }

    if (findParentThread.result === undefined) {
      return ctx.json({ message: "Wrong parent id" }, 404);
    }

    const hashtags = filterHashtagAndMentions(body.text, "#");
    const mentions = filterHashtagAndMentions(body.text, "@");

    let resources: string[] = [];

    if (body.resources) {
      if (body.resources[0].includes("data:image/jpeg;base64,")) {
        for (const resource in body.resources) {
          const uploadResult = await cloudinary.uploader.upload(resource, { folder: "/threads" }, (error) => {
            if (error !== undefined) {
              console.error(error);
              return ctx.json(error, 500);
            }
          });

          resources.push(uploadResult.public_id);
        }
      } else {
        resources = body.resources;
      }
    }

    const { error, result } = await safeTry(
      db.insert(threadsTable).values({
        id: nanoid(),
        postId: shortNanoId(),
        authorId: user.id,
        rootId: body.rootId,
        parentId: body.parentId,
        text: body.text,
        resources: resources.length > 0 ? resources : null,
        hashtags,
        mentions,
        likesCount: 0,
        repliesCount: 0,
        createdAt: dayjs.utc().format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: dayjs.utc().format("YYYY-MM-DD HH:mm:ss"),
      }),
    );

    if (error !== null) {
      return ctx.json(error, 500);
    }

    const increaseReplyCount = await safeTry(
      db
        .update(threadsTable)
        .set({ repliesCount: findParentThread.result.repliesCount + 1 })
        .where(eq(threadsTable.id, findParentThread.result.id)),
    );

    if (increaseReplyCount.error !== null) {
      return ctx.json(increaseReplyCount.error, 500);
    }

    return ctx.json(result, 200);
  });

/// TODO: get all the replies from a post. To know what post is wee use the id of the thread NOT THE SHORT ONE.
//  To get the correct root post you need to use the normal id NOT THE SHORT ONE.
//  The same to get the parent post. Use the url to get username an short postId.
//  This way you can make the thread
//
