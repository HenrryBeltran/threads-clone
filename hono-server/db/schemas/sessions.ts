import { relations, sql } from "drizzle-orm";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { users } from "./users";

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey().notNull(),
  token: text("token").unique().notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: text("expires").notNull(),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`),
});

export const sessionsRelations = relations(sessions, ({ one }) => ({
  userId: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export type SelectSessions = typeof sessions.$inferSelect;
export type InsertSessions = typeof sessions.$inferInsert;
