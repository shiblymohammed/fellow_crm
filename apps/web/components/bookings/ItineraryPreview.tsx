'use client';

import { format } from 'date-fns';

interface Activity {
  time: string;
  icon: string;
  description: string;
}

interface ItineraryDay {
  dayNumber: number;
  date?: string;
  title: string;
  description: string;
  activities: Activity[];
}

interface ItineraryPreviewProps {
  title: string;
  days: ItineraryDay[];
  onClose: () => void;
}

export default function ItineraryPreview({ title, days, onClose }: ItineraryPreviewProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-4xl max-h-full overflow-y-auto shadow-2xl flex flex-col relative">
        
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800 p-6 flex justify-between items-center rounded-t-3xl">
          <div>
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Preview</h2>
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
              {title || 'Your Awesome Trip'}
            </h1>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-10 space-y-12">
          {days.length === 0 ? (
            <div className="text-center text-gray-500 py-10">
              No itinerary days added yet.
            </div>
          ) : (
            days.map((day, index) => (
              <div key={index} className="relative pl-8 sm:pl-16">
                
                {/* Timeline Line */}
                {index !== days.length - 1 && (
                  <div className="absolute top-10 bottom-[-3rem] left-[15px] sm:left-[31px] w-0.5 bg-gray-200 dark:bg-gray-800" />
                )}

                {/* Day Marker */}
                <div className="absolute top-0 left-0 sm:left-4 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shadow-md ring-4 ring-white dark:ring-gray-900 z-10">
                  {day.dayNumber}
                </div>

                {/* Day Header */}
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {day.title || `Day ${day.dayNumber}`}
                  </h3>
                  {day.date && (
                    <p className="text-sm font-bold text-primary mt-1">
                      {format(new Date(day.date), 'EEEE, MMMM do, yyyy')}
                    </p>
                  )}
                  {day.description && (
                    <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm leading-relaxed">
                      {day.description}
                    </p>
                  )}
                </div>

                {/* Activities */}
                {day.activities && day.activities.length > 0 && (
                  <div className="space-y-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
                    {day.activities.map((act, actIndex) => (
                      <div key={actIndex} className="flex gap-4 items-start">
                        <div className="text-sm font-bold text-gray-500 dark:text-gray-400 w-12 pt-1 flex-shrink-0">
                          {act.time}
                        </div>
                        <div className="text-xl bg-white dark:bg-gray-700 w-8 h-8 rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
                          {act.icon || '📍'}
                        </div>
                        <div className="pt-1 text-gray-800 dark:text-gray-200 text-sm">
                          {act.description}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
