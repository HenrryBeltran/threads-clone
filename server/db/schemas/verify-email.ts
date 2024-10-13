import { sql } from "drizzle-orm";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const verifyEmail = sqliteTable("verify_email", {
  id: text("id").primaryKey().notNull(),
  oldEmail: text("old_email").notNull(),
  newEmail: text("new_email").notNull(),
  token: text("token").unique().notNull(),
  expires: text("expires").notNull(),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`),
});

export type SelectVerifyEmail = typeof verifyEmail.$inferSelect;
export type InsertVerifyEmail = typeof verifyEmail.$inferInsert;
