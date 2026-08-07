/*
  Warnings:

  - A unique constraint covering the columns `[user_id,target_id]` on the table `follows` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "follows_user_id_target_id_unique" ON "follows"("user_id", "target_id");
