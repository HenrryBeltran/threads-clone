-- AlterTable
ALTER TABLE "sessions" ADD COLUMN "device_name" TEXT;
ALTER TABLE "sessions" ADD COLUMN "device_type" TEXT;
ALTER TABLE "sessions" ADD COLUMN "ip_address" TEXT;
ALTER TABLE "sessions" ADD COLUMN "last_active_at" TEXT;
ALTER TABLE "sessions" ADD COLUMN "user_agent" TEXT;
