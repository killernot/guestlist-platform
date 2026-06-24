/**
 * Seed script — Manila Nightlife Demo Events
 * Creates 8 realistic events across Poblacion, BGC, Makati, Katipunan, Pasay
 *
 * Run: npx ts-node prisma/seed.ts
 * Reset: npx prisma migrate reset (includes seed via prisma config)
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const EVENTS = [
  {
    name: "Poblacion Block Party: House Nation",
    venue: "Agujas Island Grill, Poblacion",
    date: addDays(3, 22, 0), // Fri 10PM
    capacity: 200,
    description:
      "Manila's underground house scene takes over Poblacion for one night only. Expect deep grooves, soulful vocals, and an international DJ lineup spinning until sunrise. Strictly 21+.",
    bannerUrl: "https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=800&q=80",
  },
  {
    name: "Neon Nights: Tech House Takeover",
    venue: "The Fort Bonifacio, BGC",
    date: addDays(5, 23, 0), // Sat 11PM
    capacity: 350,
    description:
      "A high-energy tech house event in the heart of BGC. State-of-the-art sound system, immersive light installations, and a lineup curated for the true ravers. Doors open at 11PM.",
    bannerUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80",
  },
  {
    name: "Katipunan Sessions: Amapiano x Afro",
    venue: "12 Monkeys Music Hall, Katipunan",
    date: addDays(7, 21, 30), // Mon 9:30PM
    capacity: 150,
    description:
      "The Amapiano wave hits Katipunan. A night of log drums, basslines, and South African grooves mixed with local flavor. Perfect for students and young professionals looking for something fresh.",
    bannerUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80",
  },
  {
    name: "Hip-Hop & R&B: The Lounge",
    venue: "Valkyrie, Makati",
    date: addDays(10, 22, 0), // Thu 10PM
    capacity: 250,
    description:
      "Premium hip-hop and R&B night at Makati's most exclusive lounge. Curated playlist featuring OPM classics, US hits, and local talent. Dress code enforced. VIP tables available.",
    bannerUrl: "https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=800&q=80",
  },
  {
    name: "Sunset Sessions: Open Format",
    venue: "Sofitel Philippine Plaza, Pasay",
    date: addDays(12, 18, 0), // Sat 6PM
    capacity: 400,
    description:
      "Sunset cocktails meet open-format DJs at Sofitel's rooftop bar. From deep house to pop remixes, this is the perfect way to kick off your weekend with skyline views and premium vibes.",
    bannerUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80",
  },
  {
    name: "Underground: Warehouse Techno",
    venue: "Secret Location, Poblacion",
    date: addDays(14, 23, 30), // Mon 11:30PM
    capacity: 120,
    description:
      "Limited capacity. Exact venue revealed 24 hours before the event. Raw, unfiltered techno in a warehouse setting. Bring your energy. No phones on the dancefloor.",
    bannerUrl: "https://images.unsplash.com/photo-1574169208507-84376144848b?w=800&q=80",
  },
  {
    name: "BGC Beats: Friday Open Format",
    venue: "The Palace Manila, BGC",
    date: addDays(17, 22, 0), // Fri 10PM
    capacity: 500,
    description:
      "The biggest Friday night in BGC. Three rooms, three genres — house, hip-hop, and EDM. Massive crowd, premium production, and an atmosphere that keeps you dancing until 4AM.",
    bannerUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80",
  },
  {
    name: "Sunday Chill: Lo-Fi x Deep House",
    venue: "Yardstick Rockwell, Makati",
    date: addDays(19, 19, 0), // Sun 7PM
    capacity: 180,
    description:
      "Wind down your weekend with lo-fi beats and deep house grooves. Chill cocktails, good company, and the perfect soundtrack for Sunday night recovery. Casual dress code.",
    bannerUrl: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800&q=80",
  },
];

function addDays(daysFromNow: number, hour: number, minute: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  d.setHours(hour, minute, 0, 0);
  return d;
}

async function main() {
  console.log("🌙 Seeding Manila nightlife events...");

  // Clear existing data (respects relations)
  await prisma.reservation.deleteMany();
  await prisma.event.deleteMany();

  for (const event of EVENTS) {
    await prisma.event.create({
      data: {
        name: event.name,
        venue: event.venue,
        date: event.date,
        capacity: event.capacity,
        description: event.description,
        bannerUrl: event.bannerUrl,
      },
    });
    console.log(`  ✓ ${event.name}`);
  }

  console.log(`\n✅ Seeded ${EVENTS.length} events.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
