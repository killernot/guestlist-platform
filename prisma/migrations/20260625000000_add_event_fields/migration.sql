-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'COMPLETED', 'ARCHIVED');

-- AlterTable: Add new columns to Event
ALTER TABLE "events" ADD COLUMN "slug" TEXT;
ALTER TABLE "events" ADD COLUMN "address" TEXT;
ALTER TABLE "events" ADD COLUMN "startTime" TEXT;
ALTER TABLE "events" ADD COLUMN "endTime" TEXT;
ALTER TABLE "events" ADD COLUMN "minAge" INTEGER;
ALTER TABLE "events" ADD COLUMN "dressCode" TEXT;
ALTER TABLE "events" ADD COLUMN "genres" TEXT;
ALTER TABLE "events" ADD COLUMN "djLineup" TEXT;
ALTER TABLE "events" ADD COLUMN "coverImage" TEXT;
ALTER TABLE "events" ADD COLUMN "galleryImages" TEXT;
ALTER TABLE "events" ADD COLUMN "status" "EventStatus" NOT NULL DEFAULT 'DRAFT';

-- CreateIndex
CREATE UNIQUE INDEX "events_slug_key" ON "events"("slug");
CREATE INDEX "events_status_idx" ON "events"("status");

-- Backfill: Generate slugs from existing event names
UPDATE "events" SET "slug" = lower(regexp_replace("name", '[^a-z0-9]+', '-', 'g')) WHERE "slug" IS NULL;
UPDATE "events" SET "status" = 'PUBLISHED' WHERE "status" = 'DRAFT';
