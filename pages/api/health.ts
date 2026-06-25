import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prism";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Lightweight DB check — just verify connectivity with a trivial query
    await prisma.$queryRaw`SELECT 1`;

    return res.status(200).json({
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  } catch (error) {
    // Still return 200 but indicate degraded status so the container stays up
    // while signaling to orchestrators that DB is unreachable
    return res.status(503).json({
      status: "degraded",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      error: "Database connectivity check failed",
    });
  }
}
