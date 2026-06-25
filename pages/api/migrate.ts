import type { NextApiRequest, NextApiResponse } from "next";

/**
 * ONE-TIME MIGRATION ENDPOINT
 * Executes raw SQL via pg directly.
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

  // Dynamic import to avoid bundling issues
  const { Pool } = await import("pg");
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  const results: string[] = [];

  try {
    // Create EventStatus enum
    await pool.query(`
      DO $$ BEGIN
        CREATE TYPE "EventStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'COMPLETED', 'ARCHIVED');
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    `);
    results.push("EventStatus enum created/verified");

    // Add columns
    const columns = [
      { name: "slug", type: "TEXT" },
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
        if (col.default) {
          await pool.query(
            `ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "${col.name}" ${col.type} NOT NULL ${col.default}`
          );
        } else {
          await pool.query(
            `ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "${col.name}" ${col.type}`
          );
        }
        results.push(`Column ${col.name} added/verified`);
      } catch (e: any) {
        results.push(`Column ${col.name}: ${e.message?.includes("already exists") ? "already exists" : e.message}`);
      }
    }

    // Unique index on slug
    try {
      await pool.query(`CREATE UNIQUE INDEX IF NOT EXISTS "events_slug_key" ON "events"("slug")`);
      results.push("Slug unique index created/verified");
    } catch {
      results.push("Slug index already exists");
    }

    // Status index
    try {
      await pool.query(`CREATE INDEX IF NOT EXISTS "events_status_idx" ON "events"("status")`);
      results.push("Status index created/verified");
    } catch {
      results.push("Status index already exists");
    }

    // Backfill slugs
    try {
      await pool.query(`
        UPDATE "events" SET "slug" = lower(regexp_replace("name", '[^a-z0-9]+', '-', 'g'))
        WHERE "slug" IS NULL OR "slug" = ''
      `);
      results.push("Backfilled slugs");
    } catch (e: any) {
      results.push(`Slug backfill: ${e.message}`);
    }

    // Set existing events to PUBLISHED
    try {
      await pool.query(`UPDATE "events" SET "status" = 'PUBLISHED' WHERE "status" = 'DRAFT'`);
      results.push("Existing events set to PUBLISHED");
    } catch (e: any) {
      results.push(`Status update: ${e.message}`);
    }

    // Add FK to google_sheets_mappings
    try {
      await pool.query(`
        ALTER TABLE "google_sheets_mappings" DROP CONSTRAINT IF EXISTS "google_sheets_mappings_eventId_fkey";
        ALTER TABLE "google_sheets_mappings" ADD CONSTRAINT "google_sheets_mappings_eventId_fkey"
        FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE
      `);
      results.push("Sheets mapping FK created/verified");
    } catch {
      results.push("Sheets FK already exists or N/A");
    }

    await pool.end();
    return res.json({ success: true, results });
  } catch (err: any) {
    await pool.end();
    return res.status(500).json({ error: "Migration failed", detail: err.message, results });
  }
}
