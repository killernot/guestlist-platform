import prisma from "./prism";

/**
 * Check if an event has remaining capacity for additional guests.
 * Only APPROVED reservations count toward capacity.
 *
 * @param eventId - The event ID to check
 * @param additionalGuests - Number of additional guests to accommodate
 * @returns true if the event has capacity, false if it would be exceeded
 */
export async function hasCapacity(
  eventId: string,
  additionalGuests: number
): Promise<boolean> {
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) return false;

  const approved = await prisma.reservation.aggregate({
    where: { eventId, status: "APPROVED" },
    _sum: { guestCount: true },
  });

  const currentApproved = approved._sum.guestCount ?? 0;
  return currentApproved + additionalGuests <= event.capacity;
}
