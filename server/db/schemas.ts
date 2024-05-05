// import { relations, sql } from "drizzle-orm";
// import { foreignKey, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

// export const users = sqliteTable("users", {
//   id: text("id").primaryKey().notNull(),
//   email: text("email").unique().notNull(),
//   username: text("username").unique().notNull(),
//   password: text("password").notNull(),
//   name: text("name").notNull(),
//   bio: text("bio").notNull(),
//   link: text("link"),
//   profilePictureUrl: text("profile_picture_url"),
//   roles: text("roles", { enum: ["user", "admin", "viewer"] })
//     .notNull()
//     .default("user"),
//   emailVerified: text("email_verified"),
//   createdAt: text("created_at")
//     .notNull()
//     .default(sql`(CURRENT_TIMESTAMP)`),
//   updatedAt: text("updated_at")
//     .notNull()
//     .default(sql`(CURRENT_TIMESTAMP)`),
// });
//
// export const usersRelations = relations(users, ({ many }) => ({
//   threads: many(threads),
//   followers: many(follows, { relationName: "followers" }),
//   followings: many(follows, { relationName: "followings" }),
//   sessions: many(sessions),
//   owner: many(searchHistory, { relationName: "owner" }),
//   userSearch: many(searchHistory, { relationName: "user_search" }),
// }));
//
// export type SelectUsers = typeof users.$inferSelect;
// export type InsertUsers = typeof users.$inferInsert;
//
// export const sessions = sqliteTable("sessions", {
//   id: text("id").primaryKey().notNull(),
//   token: text("token").unique().notNull(),
//   userId: text("user_id")
//     .notNull()
//     .references(() => users.id),
//   expires: text("expires").notNull(),
//   createdAt: text("created_at")
//     .notNull()
//     .default(sql`(CURRENT_TIMESTAMP)`),
//   updatedAt: text("updated_at")
//     .notNull()
//     .default(sql`(CURRENT_TIMESTAMP)`),
// });
//
// export const sessionsRelations = relations(sessions, ({ one }) => ({
//   userId: one(users, {
//     fields: [sessions.userId],
//     references: [users.id],
//   }),
// }));
//
// export type SelectSessions = typeof sessions.$inferSelect;
// export type InsertSessions = typeof sessions.$inferInsert;
//
// export const verifyUser = sqliteTable("verify_user", {
//   id: text("id").primaryKey().notNull(),
//   email: text("email").unique().notNull(),
//   token: text("token").unique().notNull(),
//   code: text("code").notNull(),
//   expires: text("expires").notNull(),
//   createdAt: text("created_at")
//     .notNull()
//     .default(sql`(CURRENT_TIMESTAMP)`),
//   updatedAt: text("updated_at")
//     .notNull()
//     .default(sql`(CURRENT_TIMESTAMP)`),
// });
//
// export type SelectVerifyUser = typeof verifyUser.$inferSelect;
// export type InsertVerifyUser = typeof verifyUser.$inferInsert;
//
// export const resetPassword = sqliteTable("reset_password", {
//   id: text("id").primaryKey().notNull(),
//   email: text("email").unique().notNull(),
//   token: text("token").unique().notNull(),
//   expires: text("expires").notNull(),
//   createdAt: text("created_at")
//     .notNull()
//     .default(sql`(CURRENT_TIMESTAMP)`),
//   updatedAt: text("updated_at")
//     .notNull()
//     .default(sql`(CURRENT_TIMESTAMP)`),
// });
//
// export type SelectResetPassword = typeof resetPassword.$inferSelect;
// export type InsertResetPassword = typeof resetPassword.$inferInsert;

// export const follows = sqliteTable("follows", {
//   id: text("id").primaryKey().notNull(),
//   follower: text("follower")
//     .notNull()
//     .references(() => users.id),
//   following: text("following")
//     .notNull()
//     .references(() => users.id),
//   createdAt: text("created_at")
//     .notNull()
//     .default(sql`(CURRENT_TIMESTAMP)`),
//   updatedAt: text("updated_at")
//     .notNull()
//     .default(sql`(CURRENT_TIMESTAMP)`),
// });
//
// export const followsRelations = relations(follows, ({ one }) => ({
//   follower: one(users, {
//     fields: [follows.follower],
//     references: [users.id],
//     relationName: "followers",
//   }),
//   following: one(users, {
//     fields: [follows.following],
//     references: [users.id],
//     relationName: "followings",
//   }),
// }));
//
// export type SelectFollows = typeof follows.$inferSelect;
// export type InsertFollows = typeof follows.$inferInsert;
//
// export const threads = sqliteTable(
//   "threads",
//   {
//     id: text("id").primaryKey().notNull(),
//     authorId: text("author_id")
//       .notNull()
//       .references(() => users.id),
//     text: text("text").notNull(),
//     imagesUrl: text("images_url", { mode: "json" }).$type<string[]>(),
//     gifUrl: text("gif_url"),
//     hashtags: text("hashtags", { mode: "json" }).$type<string[]>(),
//     mentions: text("mentions", { mode: "json" }).$type<string[]>(),
//     likesAmount: integer("likes_amount", { mode: "number" }).notNull().default(0),
//     repliesAmount: integer("replies_amount", { mode: "number" }).notNull().default(0),
//     replyId: text("reply_id"),
//     createdAt: text("created_at")
//       .notNull()
//       .default(sql`(CURRENT_TIMESTAMP)`),
//     updatedAt: text("updated_at")
//       .notNull()
//       .default(sql`(CURRENT_TIMESTAMP)`),
//   },
//   (table) => ({
//     foreignKeys: foreignKey({
//       columns: [table.replyId],
//       foreignColumns: [table.id],
//       name: "reply_fk",
//     }),
//   }),
// );
//
// export const threadsRelations = relations(threads, ({ one, many }) => ({
//   author: one(users, {
//     fields: [threads.authorId],
//     references: [users.id],
//   }),
//   reply: one(threads, {
//     fields: [threads.replyId],
//     references: [threads.id],
//   }),
//   likedPost: many(likes),
// }));
//
// export type SelectThreads = typeof threads.$inferSelect;
// export type InsertThreads = typeof threads.$inferInsert;

// export const likes = sqliteTable("likes", {
//   id: text("id").primaryKey().notNull(),
//   likedPost: text("liked_post")
//     .notNull()
//     .references(() => threads.id),
//   userLike: text("user_like")
//     .notNull()
//     .references(() => users.id),
//   createdAt: text("created_at")
//     .notNull()
//     .default(sql`(CURRENT_TIMESTAMP)`),
//   updatedAt: text("updated_at")
//     .notNull()
//     .default(sql`(CURRENT_TIMESTAMP)`),
// });
//
// export const likesRelations = relations(likes, ({ one }) => ({
//   likedPost: one(threads, {
//     fields: [likes.likedPost],
//     references: [threads.id],
//   }),
//   userLike: one(users, {
//     fields: [likes.userLike],
//     references: [users.id],
//   }),
// }));
//
// export type SelectLikes = typeof likes.$inferSelect;
// export type InsertLikes = typeof likes.$inferInsert;

// export const searchHistory = sqliteTable("search_history", {
//   id: text("id").primaryKey().notNull(),
//   owner: text("owner")
//     .references(() => users.id)
//     .notNull(),
//   userSearch: text("user_search")
//     .references(() => users.id)
//     .notNull(),
//   createdAt: text("created_at")
//     .notNull()
//     .default(sql`(CURRENT_TIMESTAMP)`),
//   updatedAt: text("updated_at")
//     .notNull()
//     .default(sql`(CURRENT_TIMESTAMP)`),
// });
//
// export const searchHistoryRelations = relations(searchHistory, ({ one }) => ({
//   owner: one(users, {
//     fields: [searchHistory.owner],
//     references: [users.id],
//     relationName: "owner",
//   }),
//   userSearch: one(users, {
//     fields: [searchHistory.userSearch],
//     references: [users.id],
//     relationName: "user_search",
//   }),
// }));
//
// export type SelectSearchHistory = typeof searchHistory.$inferSelect;
// export type InsertSearchHistory = typeof searchHistory.$inferInsert;
