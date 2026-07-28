import { relations, sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { follows } from "./follows";
import { searchHistory } from "./search-history";
import { sessions } from "./sessions";
import { threads } from "./threads";

export const users = sqliteTable("users", {
  id: text("id").primaryKey().notNull(),
  email: text("email").unique().notNull(),
  username: text("username").unique().notNull(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  bio: text("bio").notNull(),
  link: text("link"),
  profilePictureId: text("profile_picture_id"),
  roles: text("roles", { enum: ["user", "admin", "viewer"] })
    .notNull()
    .default("user"),
  followersCount: integer("followers_count", { mode: "number" }).notNull().default(0),
  followingsCount: integer("followings_count", { mode: "number" }).notNull().default(0),
  emailVerified: text("email_verified"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`),
});

export const usersRelations = relations(users, ({ many }) => ({
  threads: many(threads),
  userId: many(follows, { relationName: "user_id" }),
  targetId: many(follows, { relationName: "target_id" }),
  sessions: many(sessions),
  owner: many(searchHistory, { relationName: "owner" }),
  userSearch: many(searchHistory, { relationName: "user_search" }),
}));

export type SelectUsers = typeof users.$inferSelect;
export type InsertUsers = typeof users.$inferInsert;
