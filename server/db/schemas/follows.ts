import { relations, sql } from "drizzle-orm";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { users } from "./users";

export const follows = sqliteTable("follows", {
  id: text("id").primaryKey().notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  targetId: text("target_id")
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
    fields: [follows.userId],
    references: [users.id],
    relationName: "follower",
  }),
  following: one(users, {
    fields: [follows.targetId],
    references: [users.id],
    relationName: "following",
  }),
}));

export type SelectFollows = typeof follows.$inferSelect;
export type InsertFollows = typeof follows.$inferInsert;
