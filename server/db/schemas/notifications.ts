import { relations, sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { users } from "./users";

export const notifications = sqliteTable("notifications", {
  id: text("id").primaryKey().notNull(),
  sender: text("sender")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  receiver: text("receiver")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  message: text("message").notNull(),
  type: text("type", { enum: ["mention", "like", "reply"] }).notNull(),
  readStatus: integer("read_status", { mode: "boolean" }).default(false),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`),
});

export const notificationsRelations = relations(notifications, ({ one }) => ({
  userActivity: one(users, {
    fields: [notifications.sender],
    references: [users.id],
  }),
  userTarget: one(users, {
    fields: [notifications.receiver],
    references: [users.id],
  }),
}));

export type SelectNotifications = typeof notifications.$inferSelect;
export type InsertNotifications = typeof notifications.$inferInsert;
