-- CreateTable
CREATE TABLE "activities" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sender" TEXT NOT NULL,
    "receiver" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "read_status" INTEGER DEFAULT false,
    "thread_post_id" TEXT,
    "created_at" TEXT NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
    "updated_at" TEXT NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
    CONSTRAINT "activities_receiver_fkey" FOREIGN KEY ("receiver") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT "activities_sender_fkey" FOREIGN KEY ("sender") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
);

-- CreateTable
CREATE TABLE "follows" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "target_id" TEXT NOT NULL,
    "created_at" TEXT NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
    "updated_at" TEXT NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
    CONSTRAINT "follows_target_id_fkey" FOREIGN KEY ("target_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT "follows_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
);

-- CreateTable
CREATE TABLE "likes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "liked_post" TEXT NOT NULL,
    "user_like" TEXT NOT NULL,
    "created_at" TEXT NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
    "updated_at" TEXT NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
    CONSTRAINT "likes_user_like_fkey" FOREIGN KEY ("user_like") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT "likes_liked_post_fkey" FOREIGN KEY ("liked_post") REFERENCES "threads" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
);

-- CreateTable
CREATE TABLE "reset_password" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TEXT NOT NULL,
    "created_at" TEXT NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
    "updated_at" TEXT NOT NULL DEFAULT 'CURRENT_TIMESTAMP'
);

-- CreateTable
CREATE TABLE "search_history" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "owner" TEXT NOT NULL,
    "user_search" TEXT NOT NULL,
    "created_at" TEXT NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
    "updated_at" TEXT NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
    CONSTRAINT "search_history_user_search_fkey" FOREIGN KEY ("user_search") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT "search_history_owner_fkey" FOREIGN KEY ("owner") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "token" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "expires" TEXT NOT NULL,
    "created_at" TEXT NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
    "updated_at" TEXT NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
    CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
);

-- CreateTable
CREATE TABLE "threads" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "post_id" TEXT NOT NULL,
    "author_id" TEXT NOT NULL,
    "root_id" TEXT NOT NULL,
    "parent_id" TEXT,
    "text" TEXT NOT NULL,
    "resources" TEXT,
    "hashtags" TEXT,
    "mentions" TEXT,
    "likes_count" INTEGER NOT NULL DEFAULT 0,
    "replies_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TEXT NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
    "updated_at" TEXT NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
    CONSTRAINT "threads_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "bio" TEXT NOT NULL,
    "link" TEXT,
    "profile_picture_id" TEXT,
    "roles" TEXT NOT NULL DEFAULT 'user',
    "followers_count" INTEGER NOT NULL DEFAULT 0,
    "followings_count" INTEGER NOT NULL DEFAULT 0,
    "email_verified" TEXT,
    "created_at" TEXT NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
    "updated_at" TEXT NOT NULL DEFAULT 'CURRENT_TIMESTAMP'
);

-- CreateTable
CREATE TABLE "verify_email" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "new_email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TEXT NOT NULL,
    "created_at" TEXT NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
    "updated_at" TEXT NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
    "old_email" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "verify_user" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "expires" TEXT NOT NULL,
    "created_at" TEXT NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
    "updated_at" TEXT NOT NULL DEFAULT 'CURRENT_TIMESTAMP'
);

-- CreateIndex
CREATE UNIQUE INDEX "reset_password_email_unique" ON "reset_password"("email");

-- CreateIndex
CREATE UNIQUE INDEX "reset_password_token_unique" ON "reset_password"("token");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_unique" ON "sessions"("token");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_unique" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_unique" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "verify_email_token_unique" ON "verify_email"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verify_user_email_unique" ON "verify_user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "verify_user_token_unique" ON "verify_user"("token");
