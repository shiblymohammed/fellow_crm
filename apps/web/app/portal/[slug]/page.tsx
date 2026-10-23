import { notFound } from 'next/navigation';
import PortalClient from './PortalClient';

export default async function PortalPage({ params }: { params: { slug: string } }) {
  // We can fetch initial tenant details to brand the login page
  let tenant = null;
  let title = 'Customer Portal';
  
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/public/itineraries/${params.slug}`, {
      next: { revalidate: 60 }
    });
    
    if (res.ok) {
      const data = await res.json();
      tenant = data.tenant;
      title = data.title;
    } else if (res.status === 404) {
      notFound();
    }
  } catch (e) {}

  return (
    <PortalClient slug={params.slug} tenant={tenant} tripTitle={title} />
  );
}
