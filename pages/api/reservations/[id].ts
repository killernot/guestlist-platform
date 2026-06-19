import { NextApiHandler } from "next";
import prisma from "../../../lib/prism";

const handler: NextApiHandler = async (req, res) => {
  const { id } = req.query;

  if (typeof id !== 'string') {
    return res.status(400).json({ error: "Invalid reservation ID" });
  }

  if (req.method === 'PATCH') {
    const { status } = req.body;

    if (!status || !['PENDING', 'APPROVED', 'REJECTED', 'CHECKED_IN'].includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    try {
      const updated = await prisma.reservation.update({
        where: { id },
        data: { status },
      });
      return res.json({ success: true, reservation: updated });
    } catch (e: any) {
      if (e.code === 'P2025') {
        return res.status(404).json({ error: "Reservation not found" });
      }
      throw e;
    }
  }

  if (req.method === 'GET') {
    const reservation = await prisma.reservation.findUnique({ where: { id } });
    if (!reservation) {
      return res.status(404).json({ error: "Reservation not found" });
    }
    return res.json(reservation);
  }

  return res.status(405).json({ error: "Method not allowed" });
};

export default handler;
