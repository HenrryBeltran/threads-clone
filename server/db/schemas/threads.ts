import { relations, sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { likes } from "./likes";
import { users } from "./users";

export const threads = sqliteTable("threads", {
  id: text("id").primaryKey().notNull(),
  postId: text("post_id").notNull(),
  authorId: text("author_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  rootId: text("root_id").notNull(),
  parentId: text("parent_id"),
  text: text("text").notNull(),
  resources: text("resources", { mode: "json" }).$type<string[]>(),
  hashtags: text("hashtags", { mode: "json" }).$type<string[]>(),
  mentions: text("mentions", { mode: "json" }).$type<string[]>(),
  likesCount: integer("likes_count", { mode: "number" }).notNull().default(0),
  repliesCount: integer("replies_count", { mode: "number" }).notNull().default(0),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`),
});

export const threadsRelations = relations(threads, ({ one, many }) => ({
  author: one(users, {
    fields: [threads.authorId],
    references: [users.id],
  }),
  parent: one(threads, {
    fields: [threads.parentId],
    references: [threads.id],
  }),
  root: one(threads, {
    fields: [threads.rootId],
    references: [threads.id],
  }),
  likedPost: many(likes),
}));

export type SelectThreads = typeof threads.$inferSelect;
export type InsertThreads = typeof threads.$inferInsert;
