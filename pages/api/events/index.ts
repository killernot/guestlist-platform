import { NextApiHandler } from "next";
import { getEventList } from "../../../lib/events";

const handler: NextApiHandler = async (req, res) => {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { status, venue, search, page = "1", limit = "50", upcoming } = req.query;

    const data = await getEventList({
      status: typeof status === "string" ? status : undefined,
      venue: typeof venue === "string" ? venue : undefined,
      search: typeof search === "string" ? search : undefined,
      onlyUpcoming: upcoming === "true",
      page: parseInt(String(page), 10) || 1,
      limit: parseInt(String(limit), 10) || 50,
    });

    return res.json(data);
  } catch (err: any) {
    return res.status(500).json({
      error: "Internal server error",
      detail: process.env.NODE_ENV === "development" ? String(err) : undefined,
    });
  }
};

export default handler;
