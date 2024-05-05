import { relations, sql } from "drizzle-orm";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { threads } from "./threads";
import { users } from "./users";

export const likes = sqliteTable("likes", {
  id: text("id").primaryKey().notNull(),
  likedPost: text("liked_post")
    .notNull()
    .references(() => threads.id),
  userLike: text("user_like")
    .notNull()
    .references(() => users.id),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`),
});

export const likesRelations = relations(likes, ({ one }) => ({
  likedPost: one(threads, {
    fields: [likes.likedPost],
    references: [threads.id],
  }),
  userLike: one(users, {
    fields: [likes.userLike],
    references: [users.id],
  }),
}));

export type SelectLikes = typeof likes.$inferSelect;
export type InsertLikes = typeof likes.$inferInsert;
