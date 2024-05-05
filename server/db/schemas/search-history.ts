import { relations, sql } from "drizzle-orm";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { users } from "./users";

export const searchHistory = sqliteTable("search_history", {
  id: text("id").primaryKey().notNull(),
  owner: text("owner")
    .references(() => users.id)
    .notNull(),
  userSearch: text("user_search")
    .references(() => users.id)
    .notNull(),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`),
});

export const searchHistoryRelations = relations(searchHistory, ({ one }) => ({
  owner: one(users, {
    fields: [searchHistory.owner],
    references: [users.id],
    relationName: "owner",
  }),
  userSearch: one(users, {
    fields: [searchHistory.userSearch],
    references: [users.id],
    relationName: "user_search",
  }),
}));

export type SelectSearchHistory = typeof searchHistory.$inferSelect;
export type InsertSearchHistory = typeof searchHistory.$inferInsert;
