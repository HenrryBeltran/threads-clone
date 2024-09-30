import { relations, sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { users } from "./users";

export const activities = sqliteTable("activities", {
  id: text("id").primaryKey().notNull(),
  sender: text("sender")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  receiver: text("receiver")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  message: text("message").notNull(),
  type: text("type", { enum: ["mention", "follow", "like", "reply"] }).notNull(),
  readStatus: integer("read_status", { mode: "boolean" }).default(false),
  threadPostId: text("thread_post_id"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`),
});

export const activitiesRelations = relations(activities, ({ one }) => ({
  senderInfo: one(users, {
    fields: [activities.sender],
    references: [users.id],
  }),
  receiverInfo: one(users, {
    fields: [activities.receiver],
    references: [users.id],
  }),
}));

export type SelectActivities = typeof activities.$inferSelect;
export type InsertActivities = typeof activities.$inferInsert;
