interface PortalPageProps {
  params: { slug: string };
}

export default function CustomerPortalPage({ params }: PortalPageProps) {
  return (
    <main>
      <h1>Customer Portal</h1>
      <p>Booking: {params.slug}</p>
      {/* OTP login + booking status + documents + itinerary view */}
    </main>
  );
}
