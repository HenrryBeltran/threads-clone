import { sql } from "drizzle-orm";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const resetPassword = sqliteTable("reset_password", {
  id: text("id").primaryKey().notNull(),
  email: text("email").unique().notNull(),
  token: text("token").unique().notNull(),
  expires: text("expires").notNull(),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`),
});

export type SelectResetPassword = typeof resetPassword.$inferSelect;
export type InsertResetPassword = typeof resetPassword.$inferInsert;
