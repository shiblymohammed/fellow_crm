'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import ItineraryPreview from './ItineraryPreview';

interface Activity {
  time: string;
  icon: string;
  description: string;
}

interface ItineraryDay {
  id?: string;
  dayNumber: number;
  date?: string;
  title: string;
  description: string;
  activities: Activity[];
}

interface ItineraryBuilderProps {
  bookingId: string;
}

const ICONS = ['✈️', '🏨', '🚗', '🍽️', '📸', '🌴', '🎢', '🎟️', '🎭', '🚆', '📍'];

export default function ItineraryBuilder({ bookingId }: ItineraryBuilderProps) {
  const [title, setTitle] = useState('');
  const [days, setDays] = useState<ItineraryDay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [templates, setTemplates] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isSendingWa, setIsSendingWa] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [publicSlug, setPublicSlug] = useState<string | null>(null);

  useEffect(() => {
    fetchItinerary();
    fetchTemplates();
  }, [bookingId]);

  const fetchItinerary = async () => {
    try {
      setIsLoading(true);
      const res = await api.get(`/bookings/${bookingId}/itinerary`);
      if (res.data && res.data.id) {
        setTitle(res.data.title || '');
        setDays(res.data.days || []);
        setPdfUrl(res.data.pdfUrl || null);
        setPublicSlug(res.data.publicSlug || null);
      }
    } catch (error) {
      toast.error('Failed to load itinerary');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      // In a real scenario, we'd fetch templates based on destination or just list them
      // For now, let's fetch all packages to get their templates
      const res = await api.get('/packages');
      const pkgsWithTemplates = res.data.filter((p: any) => p.itineraryTemplate);
      setTemplates(pkgsWithTemplates.map((p: any) => p.itineraryTemplate));
    } catch (error) {
      console.error('Failed to load templates');
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.post(`/bookings/${bookingId}/itinerary`, {
        title,
        days: days.map(d => ({
          ...d,
          activities: d.activities || []
        }))
      });
      toast.success('Itinerary saved!');
      fetchItinerary();
    } catch (error) {
      toast.error('Failed to save itinerary');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCloneTemplate = async (templateId: string) => {
    if (!confirm('This will overwrite the current itinerary. Are you sure?')) return;
    
    setIsLoading(true);
    try {
      await api.post(`/bookings/${bookingId}/itinerary/clone`, { templateId });
      toast.success('Template cloned successfully!');
      fetchItinerary();
    } catch (error) {
      toast.error('Failed to clone template');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateAI = async () => {
    if (!confirm('This will overwrite the current itinerary with AI generated content. Are you sure?')) return;
    
    setIsGenerating(true);
    try {
      await api.post(`/bookings/${bookingId}/itinerary/generate-ai`);
      toast.success('AI Itinerary generated successfully!');
      fetchItinerary();
    } catch (error: any) {
      console.error("AI GENERATION ERROR:", error.response?.data, error.message);
      toast.error('AI Error: ' + JSON.stringify(error.response?.data || error.message));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGeneratePdf = async () => {
    setIsGeneratingPdf(true);
    try {
      const res = await api.post(`/bookings/${bookingId}/itinerary/pdf`);
      toast.success('PDF generated successfully!');
      if (res.data.pdfUrl) {
        setPdfUrl(res.data.pdfUrl);
      }
    } catch (error) {
      toast.error('Failed to generate PDF');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleSendWhatsapp = async () => {
    if (!confirm('Are you sure you want to send this PDF to the customer via WhatsApp?')) return;
    setIsSendingWa(true);
    try {
      await api.post(`/bookings/${bookingId}/itinerary/pdf/send-whatsapp`);
      toast.success('WhatsApp message sent successfully!');
    } catch (error) {
      toast.error('Failed to send WhatsApp message');
    } finally {
      setIsSendingWa(false);
    }
  };

  const addDay = () => {
    setDays([...days, {
      dayNumber: days.length + 1,
      title: `Day ${days.length + 1}`,
      description: '',
      activities: []
    }]);
  };

  const addActivity = (dayIndex: number) => {
    const newDays = [...days];
    newDays[dayIndex].activities.push({ time: '09:00', icon: '📍', description: '' });
    setDays(newDays);
  };

  const removeActivity = (dayIndex: number, actIndex: number) => {
    const newDays = [...days];
    newDays[dayIndex].activities.splice(actIndex, 1);
    setDays(newDays);
  };

  const updateActivity = (dayIndex: number, actIndex: number, field: keyof Activity, value: string) => {
    const newDays = [...days];
    newDays[dayIndex].activities[actIndex] = { ...newDays[dayIndex].activities[actIndex], [field]: value };
    setDays(newDays);
  };

  const updateDay = (dayIndex: number, field: keyof ItineraryDay, value: any) => {
    const newDays = [...days];
    newDays[dayIndex] = { ...newDays[dayIndex], [field]: value };
    setDays(newDays);
  };

  if (isLoading) return <div className="animate-pulse p-8 bg-white/40 rounded-3xl h-64 flex items-center justify-center">Loading itinerary...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Itinerary Builder</h2>
          <p className="text-sm text-gray-500">Plan the day-by-day schedule for this specific booking.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {publicSlug && (
            <>
              <button 
                onClick={() => {
                  const url = `${window.location.origin}/itinerary/${publicSlug}`;
                  navigator.clipboard.writeText(url);
                  toast.success('Public link copied to clipboard!');
                }}
                className="bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-bold py-2 px-4 rounded-xl transition-all"
              >
                🔗 Copy Link
              </button>
              <a 
                href={`/portal/${publicSlug}`}
                target="_blank"
                rel="noreferrer"
                className="bg-teal-100 dark:bg-teal-900/30 hover:bg-teal-200 dark:hover:bg-teal-900/50 text-teal-700 dark:text-teal-300 font-bold py-2 px-4 rounded-xl transition-all inline-block"
              >
                👤 View Portal
              </a>
            </>
          )}
          {pdfUrl && (
            <>
              <a 
                href={pdfUrl} 
                target="_blank" 
                rel="noreferrer"
                className="bg-green-100 hover:bg-green-200 text-green-700 font-bold py-2 px-4 rounded-xl transition-all"
              >
                📄 View PDF
              </a>
              <button 
                onClick={handleSendWhatsapp}
                disabled={isSendingWa}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-xl transition-all disabled:opacity-50"
              >
                {isSendingWa ? 'Sending...' : '💬 Send WA'}
              </button>
            </>
          )}
          {days.length > 0 && (
            <button 
              onClick={handleGeneratePdf}
              disabled={isGeneratingPdf}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-xl transition-all disabled:opacity-50"
            >
              {isGeneratingPdf ? '⏳ Generating...' : '📄 Generate PDF'}
            </button>
          )}
          <button 
            onClick={handleGenerateAI}
            disabled={isGenerating}
            className="bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 font-bold py-2 px-4 rounded-xl transition-all disabled:opacity-50"
          >
            {isGenerating ? '✨ Generating...' : '✨ Auto-Generate'}
          </button>
          <button 
            onClick={() => setShowPreview(true)}
            className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-bold py-2 px-4 rounded-xl transition-all"
          >
            👁️ Preview
          </button>
          {templates.length > 0 && (
            <div className="relative group">
              <button className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-primary text-gray-700 dark:text-gray-300 font-bold py-2 px-4 rounded-xl transition-all">
                Clone Template ▼
              </button>
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-xl rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                <div className="p-2 space-y-1">
                  {templates.map(t => (
                    <button 
                      key={t.id}
                      onClick={() => handleCloneTemplate(t.id)}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      {t.title || 'Untitled Template'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          <button 
            onClick={handleSave} 
            disabled={isSaving}
            className="bg-primary hover:bg-primary/90 text-white font-bold py-2 px-6 rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-70"
          >
            {isSaving ? 'Saving...' : 'Save Itinerary'}
          </button>
        </div>
      </div>

      {days.length === 0 ? (
        <div className="text-center py-16 bg-white/40 dark:bg-gray-800/40 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700">
          <div className="text-4xl mb-4">🗺️</div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No Itinerary Created Yet</h3>
          <p className="text-gray-500 mb-6">Start building from scratch or clone a template.</p>
          <button onClick={addDay} className="text-primary font-bold hover:underline">Start from scratch</button>
        </div>
      ) : (
        <>
          <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl p-6 rounded-3xl border border-white/50 dark:border-gray-700/50">
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Itinerary Title</label>
            <input 
              type="text" 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              placeholder="e.g. Honeymoon Trip to Bali"
              className="w-full h-12 px-4 rounded-xl border-2 border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 focus:border-primary outline-none"
            />
          </div>

          <div className="space-y-6">
            {days.map((day, dayIndex) => (
              <div key={dayIndex} className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm relative group transition-all hover:shadow-md">
                
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="flex-shrink-0 w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center flex-col">
                    <span className="text-xs font-bold text-primary uppercase">Day</span>
                    <span className="text-xl font-extrabold text-primary">{day.dayNumber}</span>
                  </div>
                  <div className="flex-grow space-y-3">
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={day.title} 
                        onChange={e => updateDay(dayIndex, 'title', e.target.value)} 
                        placeholder="Day Title"
                        className="flex-grow h-10 px-3 font-bold text-lg rounded-lg border-2 border-transparent hover:border-gray-100 focus:border-primary bg-transparent focus:bg-white dark:focus:bg-gray-800 outline-none transition-colors"
                      />
                      <input 
                        type="date"
                        value={day.date ? day.date.substring(0, 10) : ''}
                        onChange={e => updateDay(dayIndex, 'date', e.target.value)}
                        className="w-40 h-10 px-3 text-sm rounded-lg border-2 border-transparent hover:border-gray-100 focus:border-primary bg-transparent focus:bg-white dark:focus:bg-gray-800 outline-none transition-colors"
                      />
                    </div>
                    <textarea 
                      value={day.description || ''} 
                      onChange={e => updateDay(dayIndex, 'description', e.target.value)} 
                      placeholder="Day description..."
                      className="w-full h-20 p-3 text-sm rounded-lg border-2 border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 focus:border-primary outline-none resize-none"
                    />
                  </div>
                </div>

                <div className="ml-16 sm:ml-20 space-y-3 pl-4 border-l-2 border-dashed border-gray-200 dark:border-gray-700">
                  {day.activities?.map((activity, actIndex) => (
                    <div key={actIndex} className="flex gap-2 items-start relative group/act">
                      <input 
                        type="time" 
                        value={activity.time} 
                        onChange={e => updateActivity(dayIndex, actIndex, 'time', e.target.value)}
                        className="w-24 h-10 px-2 text-sm rounded-lg border-2 border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 outline-none focus:border-primary"
                      />
                      
                      <select
                        value={activity.icon}
                        onChange={e => updateActivity(dayIndex, actIndex, 'icon', e.target.value)}
                        className="w-12 h-10 text-center appearance-none rounded-lg border-2 border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 outline-none focus:border-primary text-lg cursor-pointer"
                      >
                        {ICONS.map(i => <option key={i} value={i}>{i}</option>)}
                      </select>

                      <input 
                        type="text" 
                        value={activity.description} 
                        onChange={e => updateActivity(dayIndex, actIndex, 'description', e.target.value)}
                        placeholder="Activity description"
                        className="flex-grow h-10 px-3 text-sm rounded-lg border-2 border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 outline-none focus:border-primary"
                      />

                      <button 
                        onClick={() => removeActivity(dayIndex, actIndex)} 
                        className="h-10 w-10 flex items-center justify-center text-red-500 bg-red-50 hover:bg-red-100 rounded-lg opacity-0 group-hover/act:opacity-100 transition-opacity"
                      >
                        ✕
                      </button>
                    </div>
                  ))}

                  <button 
                    onClick={() => addActivity(dayIndex)}
                    className="text-xs font-bold text-primary hover:text-primary/80 flex items-center gap-1 mt-2 py-1 px-3 bg-primary/5 rounded-lg w-fit transition-colors"
                  >
                    + Add Activity
                  </button>
                </div>
              </div>
            ))}
            
            <button 
              onClick={addDay}
              className="w-full py-4 bg-white/40 dark:bg-gray-800/40 hover:bg-white dark:hover:bg-gray-800 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl text-gray-500 font-bold transition-colors"
            >
              + Add Day
            </button>
          </div>
        </>
      )}

      {showPreview && (
        <ItineraryPreview 
          title={title}
          days={days}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
}
