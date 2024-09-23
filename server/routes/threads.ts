import { zValidator } from "@hono/zod-validator";
import { v2 as cloudinary } from "cloudinary";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { and, desc, eq, isNull, ne, sql } from "drizzle-orm";
import { Hono } from "hono";
import { customAlphabet, nanoid } from "nanoid";
import { z } from "zod";
import { postThreadSchema } from "../common/schemas/thread";
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
        where: isNull(threadsTable.parentId),
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
        where: and(eq(threadsTable.authorId, userId), eq(threadsTable.id, threadsTable.rootId)),
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
  .get("/post/:id", async (ctx) => {
    const id = ctx.req.param("id");

    const { error, result } = await safeTry(
      db.query.threads.findFirst({
        with: { author: { columns: { username: true, name: true, profilePictureId: true } } },
        where: eq(threadsTable.id, id),
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

    const newId = nanoid();
    const rootId = body.rootId !== null ? body.rootId : newId;

    let previusId = "";
    let allThreads: {
      text: string;
      id: string;
      createdAt: string;
      updatedAt: string;
      postId: string;
      authorId: string;
      rootId: string;
      parentId: string | null;
      resources: string[] | null;
      hashtags: string[] | null;
      mentions: string[] | null;
      likesCount: number;
      repliesCount: number;
      author: {
        username: string;
        name: string;
        profilePictureId: string | null;
      };
    }[] = [];

    for (let i = 0; i < body.body.length; i++) {
      const post = body.body[i];

      const hashtags = filterHashtagAndMentions(post.text, "#");
      const mentions = filterHashtagAndMentions(post.text, "@");

      let resources: string[] | null = null;

      if (post.resources !== null && post.resources.length > 0) {
        if (post.resources[0].includes("data:image/jpeg;base64,")) {
          const resourceList = post.resources;

          const imagesToUpload = resourceList.map(async (image) => {
            const result = await cloudinary.uploader.upload(image, { folder: "/threads" }, (error) => {
              if (error !== undefined) {
                console.error(error);
                return ctx.json(error, 500);
              }
            });
            return result;
          });

          const uploads = await Promise.all(imagesToUpload);
          const uploadsPublicIds = uploads.map((upload) => upload.public_id);
          resources = uploadsPublicIds;
        } else {
          resources = post.resources;
        }
      }

      const id = i === 0 ? newId : nanoid();

      let parentId: string | null = null;
      if (i === 0 && body.parentId !== null) {
        parentId = body.parentId;
      }
      if (i > 0) {
        parentId = previusId;
      }

      const { error, result } = await safeTry(
        db
          .insert(threadsTable)
          .values({
            id,
            postId: shortNanoId(),
            authorId: user.id,
            rootId: rootId,
            parentId: parentId,
            text: post.text,
            resources: resources,
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

      allThreads.push(fullThread.result);

      if (body.parentId !== null && i === 0) {
        const increaseReplyCount = await safeTry(
          db.run(sql`
            UPDATE threads
            SET replies_count = replies_count + 1
            WHERE id = ${body.parentId}
          `),
        );

        if (increaseReplyCount.error !== null) {
          return ctx.json(increaseReplyCount.error, 500);
        }
      }

      if (i > 0) {
        const increaseReplyCount = await safeTry(
          db.run(sql`
            UPDATE threads
            SET replies_count = replies_count + 1
            WHERE id = ${previusId}
          `),
        );

        if (increaseReplyCount.error !== null) {
          return ctx.json(increaseReplyCount.error, 500);
        }
      }

      previusId = fullThread.result.id;
    }

    return ctx.json(allThreads);
  })
  .delete("/post/:threadId", getUser, async (ctx) => {
    const threadId = ctx.req.param("threadId");
    const user = ctx.get("user");

    const thread = await safeTry(
      db.query.threads.findFirst({ columns: { id: true, authorId: true }, where: eq(threadsTable.id, threadId) }),
    );

    if (thread.error !== null) {
      return ctx.json(thread.error, 500);
    }

    if (thread.result === undefined) {
      return ctx.json({ message: "Thread not found." }, 404);
    }

    if (user.id !== thread.result.authorId) {
      return ctx.json({ message: "Action not allowed." }, 403);
    }

    const { error } = await safeTry(db.delete(threadsTable).where(eq(threadsTable.id, thread.result.id)));

    if (error !== null) {
      return ctx.json(error, 500);
    }

    return ctx.json({ message: "Thread delete successfully" }, 200);
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
  .get("/replies/posts/:userId", zValidator("query", z.object({ page: z.string() })), async (ctx) => {
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
        where: and(eq(threadsTable.authorId, userId), ne(threadsTable.id, threadsTable.rootId)),
      }),
    );

    if (error !== null) {
      return ctx.json(error, 500);
    }

    return ctx.json(result);
  });
