interface ItineraryPublicPageProps {
  params: { slug: string };
}

// Public route — no login required
export default function ItineraryPublicPage({ params }: ItineraryPublicPageProps) {
  return (
    <main>
      <h1>Your Itinerary</h1>
      <p>Slug: {params.slug}</p>
      {/* Mobile-first day cards with icons + timeline */}
    </main>
  );
}
