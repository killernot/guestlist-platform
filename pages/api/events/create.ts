import { NextApiHandler } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth";
import prisma from "../../../lib/prism";

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

const handler: NextApiHandler = async (req, res) => {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method === "POST") {
    const {
      name, slug, description, venue, address, date, startTime, endTime,
      capacity, minAge, dressCode, genres, djLineup, coverImage,
      galleryImages, status,
    } = req.body;

    if (!name || name.trim().length < 2) {
      return res.status(400).json({ error: "Event name is required (min 2 chars)" });
    }
    if (!date) {
      return res.status(400).json({ error: "Event date is required" });
    }
    if (!venue || venue.trim().length < 1) {
      return res.status(400).json({ error: "Venue is required" });
    }
    if (!capacity || Number(capacity) < 1) {
      return res.status(400).json({ error: "Capacity must be at least 1" });
    }

    const eventSlug = slug?.trim() || generateSlug(name);
    const eventDate = new Date(date);
    if (eventDate < new Date()) {
      return res.status(400).json({ error: "Event date cannot be in the past" });
    }

    try {
      // Check for duplicate slug
      const existing = await prisma.event.findUnique({ where: { slug: eventSlug } });
      if (existing) {
        return res.status(409).json({ error: "An event with this slug already exists" });
      }

      const event = await prisma.event.create({
        data: {
          name: name.trim(),
          slug: eventSlug,
          description: description?.trim() || null,
          venue: venue.trim(),
          address: address?.trim() || null,
          date: eventDate,
          startTime: startTime?.trim() || null,
          endTime: endTime?.trim() || null,
          capacity: Number(capacity),
          minAge: minAge ? Number(minAge) : null,
          dressCode: dressCode?.trim() || null,
          genres: genres?.trim() || null,
          djLineup: djLineup?.trim() || null,
          coverImage: coverImage?.trim() || null,
          galleryImages: galleryImages?.trim() || null,
          status: status || "DRAFT",
        },
      });

      return res.json({ success: true, event: { id: event.id, slug: event.slug, name: event.name, status: event.status } });
    } catch (e: any) {
      if (e.code === "P2002") {
        return res.status(409).json({ error: "Unique constraint violation" });
      }
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  if (req.method === "PATCH") {
    const { id } = req.query;
    if (typeof id !== "string") {
      return res.status(400).json({ error: "Invalid event ID" });
    }

    const {
      name, slug, description, venue, address, date, startTime, endTime,
      capacity, minAge, dressCode, genres, djLineup, coverImage,
      galleryImages, status,
    } = req.body;

    try {
      const data: any = {};
      if (name !== undefined) {
        if (name.trim().length < 2) return res.status(400).json({ error: "Name too short" });
        data.name = name.trim();
      }
      if (slug !== undefined) data.slug = slug.trim();
      if (description !== undefined) data.description = description?.trim() || null;
      if (venue !== undefined) data.venue = venue.trim();
      if (address !== undefined) data.address = address?.trim() || null;
      if (date !== undefined) {
        const d = new Date(date);
        if (d < new Date()) return res.status(400).json({ error: "Date cannot be in the past" });
        data.date = d;
      }
      if (startTime !== undefined) data.startTime = startTime?.trim() || null;
      if (endTime !== undefined) data.endTime = endTime?.trim() || null;
      if (capacity !== undefined) {
        if (Number(capacity) < 1) return res.status(400).json({ error: "Capacity must be at least 1" });
        data.capacity = Number(capacity);
      }
      if (minAge !== undefined) data.minAge = minAge ? Number(minAge) : null;
      if (dressCode !== undefined) data.dressCode = dressCode?.trim() || null;
      if (genres !== undefined) data.genres = genres?.trim() || null;
      if (djLineup !== undefined) data.djLineup = djLineup?.trim() || null;
      if (coverImage !== undefined) data.coverImage = coverImage?.trim() || null;
      if (galleryImages !== undefined) data.galleryImages = galleryImages?.trim() || null;
      if (status !== undefined) data.status = status;

      const event = await prisma.event.update({ where: { id }, data });
      return res.json({ success: true, event: { id: event.id, slug: event.slug, name: event.name, status: event.status } });
    } catch (e: any) {
      if (e.code === "P2025") return res.status(404).json({ error: "Event not found" });
      if (e.code === "P2002") return res.status(409).json({ error: "Slug already in use" });
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
};

export default handler;
