import { MapPin, Calendar, Clock, Plane, Info, CheckCircle2 } from 'lucide-react';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';

interface ItineraryDay {
  id: string;
  dayNumber: number;
  date: string | null;
  title: string | null;
  description: string | null;
  activities: any[];
}

interface PublicItinerary {
  id: string;
  title: string;
  publicSlug: string;
  days: ItineraryDay[];
  tenant: {
    name: string;
    logoUrl: string | null;
    primaryColor: string | null;
  };
  booking: {
    destination: string;
    travelDate: string;
    returnDate: string;
    customer: {
      name: string;
    };
  };
}

async function getItinerary(slug: string): Promise<PublicItinerary | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/public/itineraries/${slug}`, {
      next: { revalidate: 60 } // Cache for 60 seconds
    });
    
    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error('Failed to fetch itinerary');
    }
    
    return res.json();
  } catch (error) {
    console.error('Error fetching itinerary:', error);
    return null;
  }
}

export default async function PublicItineraryPage({ params }: { params: { slug: string } }) {
  const itinerary = await getItinerary(params.slug);
  
  if (!itinerary) {
    notFound();
  }

  const primaryColor = itinerary.tenant.primaryColor || '#0ea5e9';

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {itinerary.tenant.logoUrl ? (
              <img src={itinerary.tenant.logoUrl} alt={itinerary.tenant.name} className="h-8 w-auto rounded" />
            ) : (
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: primaryColor }}
              >
                {itinerary.tenant.name.charAt(0)}
              </div>
            )}
            <span className="font-semibold text-gray-900 hidden sm:block">
              {itinerary.tenant.name}
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-500 hidden md:block">
              Prepared for {itinerary.booking.customer.name.split(' ')[0]}
            </span>
            <a 
              href={`/portal/${params.slug}`} 
              className="text-sm font-bold text-white px-4 py-2 rounded-xl transition-all shadow-sm hover:shadow"
              style={{ backgroundColor: primaryColor }}
            >
              Customer Portal
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8 pb-24">
        
        {/* Hero Section */}
        <div className="relative rounded-3xl overflow-hidden bg-white shadow-sm border border-gray-200/60 p-8 sm:p-12 text-center">
          <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, #000 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
          
          <div className="relative z-10 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}>
              <Plane className="w-4 h-4" />
              <span>Confirmed Trip</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
              {itinerary.title || `Trip to ${itinerary.booking.destination}`}
            </h1>
            
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-gray-600">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 opacity-70" />
                <span className="font-medium">{itinerary.booking.destination}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 opacity-70" />
                <span className="font-medium">
                  {format(new Date(itinerary.booking.travelDate), 'MMM d, yyyy')} 
                  {itinerary.booking.returnDate && ` - ${format(new Date(itinerary.booking.returnDate), 'MMM d, yyyy')}`}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Days List */}
        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
          {itinerary.days.map((day, index) => (
            <div key={day.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              
              {/* Timeline dot */}
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-gray-100 text-gray-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10" style={{ color: primaryColor }}>
                <span className="text-sm font-bold">{day.dayNumber}</span>
              </div>

              {/* Card */}
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 rounded-3xl bg-white border border-gray-200 shadow-sm transition-all hover:shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">
                    Day {day.dayNumber} {day.title && <span className="text-gray-400 font-normal ml-2">| {day.title}</span>}
                  </h3>
                  {day.date && (
                    <span className="text-sm font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
                      {format(new Date(day.date), 'MMM d')}
                    </span>
                  )}
                </div>

                {day.description && (
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {day.description}
                  </p>
                )}

                {day.activities && day.activities.length > 0 ? (
                  <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px before:h-full before:w-0.5 before:bg-gray-100">
                    {day.activities.map((activity, actIdx) => (
                      <div key={actIdx} className="relative flex items-start gap-4">
                        <div className="w-4 h-4 rounded-full bg-white border-2 shrink-0 mt-1 z-10" style={{ borderColor: primaryColor }}></div>
                        <div className="flex-1 bg-gray-50/80 rounded-2xl p-4 border border-gray-100">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-base">{activity.icon || '📍'}</span>
                            <span className="text-sm font-bold text-gray-900">{activity.time}</span>
                          </div>
                          <p className="text-gray-600 text-sm">
                            {activity.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-gray-400 italic text-sm">
                    <Info className="w-4 h-4" />
                    <span>Free day or travel time.</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-16 text-center text-gray-400 flex flex-col items-center justify-center">
          <CheckCircle2 className="w-8 h-8 mb-3 opacity-20" />
          <p className="text-sm">End of Itinerary</p>
          <p className="text-xs mt-1">Powered by Fellow CRM</p>
        </div>
      </main>
    </div>
  );
}
