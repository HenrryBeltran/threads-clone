import camelcaseKeys from "camelcase-keys";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { and, desc, eq, sql } from "drizzle-orm";
import { Hono } from "hono";
import { db } from "../db";
import { searchHistory } from "../db/schemas/search-history";
import { safeTry } from "../lib/safe-try";
import { getUser } from "../middleware/getUser";
import { nanoid } from "nanoid";
import { getSession } from "../middleware/getSession";

dayjs.extend(utc);

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export type SearchResult = {
  id: string;
  username: string;
  name: string;
  profilePictureId: string | null;
  followStatus: number;
}[];

export const search = new Hono()
  .get("/:userId/:keywords", async (ctx) => {
    const userId = ctx.req.param("userId");
    const keywords = ctx.req.param("keywords");

    const trimKeywords = keywords.split(" ").join("");
    const transformedKeywords = `%${trimKeywords.toLowerCase()}%`;

    const { error, result } = await safeTry(
      db.run(
        sql`
        SELECT
          id,
          username,
          name,
          profile_picture_id,
          (
            SELECT COUNT(follows.id)
            FROM follows 
            WHERE follows.target_id = users.id AND follows.user_id = ${userId}
          ) AS 'follow_status'
        FROM users 
        WHERE users.username LIKE ${transformedKeywords};
      `,
      ),
    );

    if (error) {
      return ctx.json(error, 500);
    }

    const rows = camelcaseKeys<SearchResult>(result.rows as any);

    return ctx.json(rows, 200);
  })
  .get("/history", getUser, async (ctx) => {
    const user = ctx.get("user");

    await delay(3000);

    const { error, result } = await safeTry(
      db.query.searchHistory.findMany({
        columns: { id: true },
        with: {
          userSearch: {
            columns: { id: true, username: true, name: true, profilePictureId: true },
          },
        },
        where: eq(searchHistory.owner, user.id),
        orderBy: [desc(searchHistory.updatedAt)],
      }),
    );

    if (error) {
      return ctx.json(error, 500);
    }

    return ctx.json(result, 200);
  })
  .post("/history/:targetId", getUser, async (ctx) => {
    const user = ctx.get("user");
    const targetId = ctx.req.param("targetId");

    const duplicate = await safeTry(
      db.query.searchHistory.findFirst({
        columns: { id: true },
        where: and(eq(searchHistory.owner, user.id), eq(searchHistory.userSearch, targetId)),
      }),
    );

    if (duplicate.error) {
      return ctx.json(duplicate.error, 500);
    }

    if (duplicate.result) {
      await safeTry(
        db
          .update(searchHistory)
          .set({
            updatedAt: dayjs().utc().format("YYYY-MM-DD HH:mm:ss"),
          })
          .where(eq(searchHistory.id, duplicate.result.id)),
      );

      return ctx.json(200, 200);
    }

    const { error } = await safeTry(
      db.insert(searchHistory).values({
        id: nanoid(),
        owner: user.id,
        userSearch: targetId,
      }),
    );

    if (error) {
      return ctx.json(error, 500);
    }

    return ctx.json(200, 200);
  })
  .delete("/history", getUser, async (ctx) => {
    const user = ctx.get("user");

    const { error } = await safeTry(db.delete(searchHistory).where(eq(searchHistory.owner, user.id)));

    if (error) {
      return ctx.json(error, 500);
    }

    return ctx.json(200, 200);
  })
  .delete("/history/:rowId", getSession, async (ctx) => {
    const rowId = ctx.req.param("rowId");

    const { error } = await safeTry(db.delete(searchHistory).where(eq(searchHistory.id, rowId)));

    if (error) {
      ctx.json(error, 500);
    }

    return ctx.json(200, 200);
  });
