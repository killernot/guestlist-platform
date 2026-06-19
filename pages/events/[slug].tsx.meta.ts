export async function generateMetadata({ params }: { params: { slug: string } }) {
  return {
    title: `Event: ${params.slug} | Guest List Platform`,
    description: `Reserve your spot before the doors open. Premium access for DJs, promoters, and nightlife events.`,
    keywords: ["nightlife", "guest list", "reservations", "DJs", "promoters", "clubbing"],
    authors: [{ name: "Guest List Platform" }],
    creator: "Guest List Platform",
    openGraph: {
      title: `Event: ${params.slug}`,
      description: `Reserve your spot before the doors open. Premium access for DJs, promoters, and nightlife events.`,
      url: `/events/${params.slug}`,
      siteName: "Guest List Platform",
      images: ["/images/og-image.png"],
      type: "website"
    },
    twitter: {
      card: "summary_large_image",
      title: `Event: ${params.slug}`,
      description: `Reserve your spot before the doors open. Premium access for DJs, promoters, and nightlife events.`,
      images: ["/images/og-image.png"]
    }
  };
}

export default function EventPage() {
  return null; // Placeholder - actual page will be implemented separately
}