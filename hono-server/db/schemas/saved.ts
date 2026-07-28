import { relations, sql } from "drizzle-orm";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { threads } from "./threads";
import { users } from "./users";

export const saved = sqliteTable("saved", {
  id: text("id").primaryKey().notNull(),
  savedPost: text("saved_post")
    .notNull()
    .references(() => threads.id, { onDelete: "cascade" }),
  owner: text("owner")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`),
});

export const savedRelations = relations(saved, ({ one }) => ({
  savedPost: one(threads, {
    fields: [saved.savedPost],
    references: [threads.id],
  }),
  owner: one(users, {
    fields: [saved.owner],
    references: [users.id],
  }),
}));

export type SelectSaved = typeof saved.$inferSelect;
export type InsertSaved = typeof saved.$inferInsert;
