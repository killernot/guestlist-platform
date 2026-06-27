import { NextApiHandler } from "next";
import { getEventBySlug } from "../../../../lib/events";

const handler: NextApiHandler = async (req, res) => {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { slug } = req.query;
    if (typeof slug !== "string") {
      return res.status(400).json({ error: "Invalid slug" });
    }

    const event = await getEventBySlug(slug);

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    return res.json(event);
  } catch {
    return res.status(500).json({ error: "Internal server error" });
  }
};

export default handler;
