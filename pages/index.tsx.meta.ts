export async function generateMetadata() {
  return {
    title: "Guest List Platform | Reserve Your Spot",
    description: "Reserve your spot before the doors open. Premium access for DJs, promoters, and nightlife events.",
    keywords: ["nightlife", "guest list", "reservations", "DJs", "promoters", "clubbing", "events"],
    authors: [{ name: "Guest List Platform" }],
    creator: "Guest List Platform",
    openGraph: {
      title: "Guest List Platform",
      description: "Reserve your spot before the doors open. Premium access for DJs, promoters, and nightlife events.",
      url: "/",
      siteName: "Guest List Platform",
      images: ["/images/og-image.png"],
      type: "website"
    },
    twitter: {
      card: "summary_large_image",
      title: "Guest List Platform",
      description: "Reserve your spot before the doors open. Premium access for DJs, promoters, and nightlife events.",
      images: ["/images/og-image.png"]
    }
  };
}

export default function Home() {
  return null; // Placeholder - actual page will be implemented separately
}