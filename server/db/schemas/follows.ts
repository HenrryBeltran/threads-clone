import { relations, sql } from "drizzle-orm";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { users } from "./users";

export const follows = sqliteTable("follows", {
  id: text("id").primaryKey().notNull(),
  follower: text("follower")
    .notNull()
    .references(() => users.id),
  following: text("following")
    .notNull()
    .references(() => users.id),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`),
});

export const followsRelations = relations(follows, ({ one }) => ({
  follower: one(users, {
    fields: [follows.follower],
    references: [users.id],
    relationName: "followers",
  }),
  following: one(users, {
    fields: [follows.following],
    references: [users.id],
    relationName: "followings",
  }),
}));

export type SelectFollows = typeof follows.$inferSelect;
export type InsertFollows = typeof follows.$inferInsert;
