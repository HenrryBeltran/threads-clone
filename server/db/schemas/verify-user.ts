import { sql } from "drizzle-orm";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const verifyUser = sqliteTable("verify_user", {
  id: text("id").primaryKey().notNull(),
  email: text("email").unique().notNull(),
  token: text("token").unique().notNull(),
  code: text("code").notNull(),
  expires: text("expires").notNull(),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`),
});

export type SelectVerifyUser = typeof verifyUser.$inferSelect;
export type InsertVerifyUser = typeof verifyUser.$inferInsert;
