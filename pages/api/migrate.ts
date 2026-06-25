import type { NextApiRequest, NextApiResponse } from "next";
import { execSync } from "child_process";

/**
 * ONE-TIME MIGRATION ENDPOINT
 * Protected by MIGRATION_TOKEN env var.
 * Remove this file immediately after use.
 *
 * Usage:
 *   POST /api/migrate
 *   Headers: Authorization: Bearer <MIGRATION_TOKEN>
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

  try {
    const result = execSync("npx prisma migrate deploy", {
      cwd: process.cwd(),
      env: process.env,
      encoding: "utf-8",
      timeout: 120000,
    });

    return res.json({ success: true, output: result });
  } catch (err: any) {
    return res.status(500).json({
      error: "Migration failed",
      output: err.stdout || err.message,
      stderr: err.stderr,
    });
  }
}
