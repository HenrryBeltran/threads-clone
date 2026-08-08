-- CreateTable
CREATE TABLE "saved" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "owner" TEXT NOT NULL,
    "saved_post" TEXT NOT NULL,
    "created_at" TEXT NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
    "updated_at" TEXT NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
    CONSTRAINT "saved_owner_fkey" FOREIGN KEY ("owner") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT "saved_saved_post_fkey" FOREIGN KEY ("saved_post") REFERENCES "threads" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
);

-- CreateIndex
CREATE UNIQUE INDEX "saved_owner_post_unique" ON "saved"("owner", "saved_post");
