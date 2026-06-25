import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

/**
 * ONE-TIME MIGRATION ENDPOINT
 * Executes raw SQL to add missing columns.
 * Protected by MIGRATION_TOKEN env var.
 * Remove this file immediately after use.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const token = process.env.MIGRATION_TOKEN;
  if (!token) return res.status(404).json({ error: "Not found" });

  const auth = req.headers.authorization;
  if (!auth || auth !== `Bearer ${token}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (!process.env.DATABASE_URL) {
    return res.status(500).json({ error: "DATABASE_URL not set" });
  }

  const prisma = new PrismaClient();

  try {
    const results: string[] = [];

    // Check and add EventStatus enum
    await prisma.$executeRawUnsafe(`
      DO $$ BEGIN
        CREATE TYPE "EventStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'COMPLETED', 'ARCHIVED');
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    `);
    results.push("EventStatus enum created/verified");

    // Add columns to events table
    const columns = [
      { name: "slug", type: "TEXT", constraint: "UNIQUE" },
      { name: "address", type: "TEXT" },
      { name: "startTime", type: "TEXT" },
      { name: "endTime", type: "TEXT" },
      { name: "minAge", type: "INTEGER" },
      { name: "dressCode", type: "TEXT" },
      { name: "genres", type: "TEXT" },
      { name: "djLineup", type: "TEXT" },
      { name: "coverImage", type: "TEXT" },
      { name: "galleryImages", type: "TEXT" },
      { name: "status", type: "EventStatus", default: "DEFAULT 'DRAFT'" },
    ];

    for (const col of columns) {
      try {
        if (col.name === "status") {
          await prisma.$executeRawUnsafe(
            `ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "status" "EventStatus" NOT NULL DEFAULT 'DRAFT'`
          );
        } else if (col.constraint === "UNIQUE") {
          await prisma.$executeRawUnsafe(
            `ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "${col.name}" ${col.type}`
          );
        } else {
          await prisma.$executeRawUnsafe(
            `ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "${col.name}" ${col.type}`
          );
        }
        results.push(`Column ${col.name} added/verified`);
      } catch (e: any) {
        if (e.message?.includes("already exists")) {
          results.push(`Column ${col.name} already exists`);
        } else {
          results.push(`Column ${col.name} ERROR: ${e.message}`);
        }
      }
    }

    // Add unique index on slug
    try {
      await prisma.$executeRawUnsafe(
        `CREATE UNIQUE INDEX IF NOT EXISTS "events_slug_key" ON "events"("slug")`
      );
      results.push("Unique index on slug created/verified");
    } catch {
      results.push("Slug index already exists");
    }

    // Add index on status
    try {
      await prisma.$executeRawUnsafe(
        `CREATE INDEX IF NOT EXISTS "events_status_idx" ON "events"("status")`
      );
      results.push("Index on status created/verified");
    } catch {
      results.push("Status index already exists");
    }

    // Backfill slugs for existing events
    try {
      await prisma.$executeRawUnsafe(`
        UPDATE "events" SET "slug" = lower(regexp_replace("name", '[^a-z0-9]+', '-', 'g'))
        WHERE "slug" IS NULL OR "slug" = ''
      `);
      results.push("Backfilled slugs for existing events");
    } catch (e: any) {
      results.push(`Slug backfill skipped: ${e.message}`);
    }

    // Set existing events to PUBLISHED
    try {
      await prisma.$executeRawUnsafe(
        `UPDATE "events" SET "status" = 'PUBLISHED' WHERE "status" = 'DRAFT'`
      );
      results.push("Set existing events to PUBLISHED");
    } catch {
      results.push("Status update skipped");
    }

    // Add event relation to google_sheets_mappings
    try {
      await prisma.$executeRawUnsafe(
        `ALTER TABLE "google_sheets_mappings" ADD CONSTRAINT IF NOT EXISTS "google_sheets_mappings_eventId_fkey"
         FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE`
      );
      results.push("GoogleSheetsMapping event relation created/verified");
    } catch {
      results.push("Sheets relation already exists or not applicable");
    }

    await prisma.$disconnect();
    return res.json({ success: true, results });
  } catch (err: any) {
    await prisma.$disconnect();
    return res.status(500).json({ error: "Migration failed", detail: err.message });
  }
}
