import { relations, sql } from "drizzle-orm";
import { foreignKey, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { likes } from "./likes";
import { users } from "./users";

export const threads = sqliteTable(
  "threads",
  {
    id: text("id").primaryKey().notNull(),
    authorId: text("author_id")
      .notNull()
      .references(() => users.id),
    text: text("text").notNull(),
    imagesUrl: text("images_url", { mode: "json" }).$type<string[]>(),
    gifUrl: text("gif_url"),
    hashtags: text("hashtags", { mode: "json" }).$type<string[]>(),
    mentions: text("mentions", { mode: "json" }).$type<string[]>(),
    likesAmount: integer("likes_amount", { mode: "number" }).notNull().default(0),
    repliesAmount: integer("replies_amount", { mode: "number" }).notNull().default(0),
    replyId: text("reply_id"),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(CURRENT_TIMESTAMP)`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`(CURRENT_TIMESTAMP)`),
  },
  (table) => ({
    foreignKeys: foreignKey({
      columns: [table.replyId],
      foreignColumns: [table.id],
      name: "reply_fk",
    }),
  }),
);

export const threadsRelations = relations(threads, ({ one, many }) => ({
  author: one(users, {
    fields: [threads.authorId],
    references: [users.id],
  }),
  reply: one(threads, {
    fields: [threads.replyId],
    references: [threads.id],
  }),
  likedPost: many(likes),
}));

export type SelectThreads = typeof threads.$inferSelect;
export type InsertThreads = typeof threads.$inferInsert;
