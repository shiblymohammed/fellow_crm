'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { Sparkles, X, Wand2 } from 'lucide-react';

interface Activity {
  time: string;
  icon: string;
  description: string;
}

interface TemplateDay {
  id?: string;
  dayNumber: number;
  title: string;
  description: string;
  activities: Activity[];
}

interface ItineraryTemplateBuilderProps {
  packageId: string;
  durationDays: number;
}

const ICONS = ['✈️', '🏨', '🚗', '🍽️', '📸', '🌴', '🎢', '🎟️', '🎭', '🚆'];

export default function ItineraryTemplateBuilder({ packageId, durationDays }: ItineraryTemplateBuilderProps) {
  const [title, setTitle] = useState('');
  const [days, setDays] = useState<TemplateDay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');

  useEffect(() => {
    fetchTemplate();
  }, [packageId]);

  const fetchTemplate = async () => {
    try {
      setIsLoading(true);
      const res = await api.get(`/packages/${packageId}/itinerary-template`);
      if (res.data && res.data.id) {
        setTitle(res.data.title || '');
        setDays(res.data.templateDays || []);
      } else {
        // Initialize default empty days based on durationDays
        const defaultDays = Array.from({ length: durationDays }, (_, i) => ({
          dayNumber: i + 1,
          title: `Day ${i + 1}`,
          description: '',
          activities: []
        }));
        setDays(defaultDays);
      }
    } catch (error: any) {
      toast.error('Failed to load itinerary template: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateAI = async () => {
    if (!aiPrompt.trim()) {
      toast.error('Please enter some preferences for the AI.');
      return;
    }

    setIsAiModalOpen(false);
    setIsLoading(true);
    const loadingToast = toast.loading('AI is crafting the perfect itinerary based on your package and preferences...');
    
    try {
      const { data } = await api.post('/ai/generate-itinerary', { 
        preferences: aiPrompt,
        packageId 
      });
      
      setTitle(data.title || '');
      
      // Ensure activities array exists and is valid
      const generatedDays = (data.days || []).map((d: any, i: number) => ({
        dayNumber: d.dayNumber || i + 1,
        title: d.title || `Day ${i + 1}`,
        description: d.description || '',
        activities: Array.isArray(d.activities) ? d.activities : []
      }));
      
      setDays(generatedDays);
      toast.success('Itinerary generated! Please review and save.', { id: loadingToast });
      setAiPrompt('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to generate itinerary with AI', { id: loadingToast });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.post(`/packages/${packageId}/itinerary-template`, {
        title,
        days: days.map(d => ({
          ...d,
          activities: d.activities || []
        }))
      });
      toast.success('Itinerary template saved!');
      fetchTemplate();
    } catch (error) {
      toast.error('Failed to save template');
    } finally {
      setIsSaving(false);
    }
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

  const updateDay = (dayIndex: number, field: keyof TemplateDay, value: any) => {
    const newDays = [...days];
    newDays[dayIndex] = { ...newDays[dayIndex], [field]: value };
    setDays(newDays);
  };

  if (isLoading) return <div className="animate-pulse p-8 bg-white/40 rounded-3xl h-64"></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Itinerary Template</h2>
          <p className="text-sm text-gray-500">Define the day-by-day plan for this package. This will be cloned when a booking is created.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsAiModalOpen(true)} 
            disabled={isLoading}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold py-2 px-4 rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-70 flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" /> Auto-Fill with AI
          </button>
          <button 
            onClick={handleSave} 
            disabled={isSaving}
            className="bg-primary hover:bg-primary/90 text-white font-bold py-2 px-6 rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-70"
          >
            {isSaving ? 'Saving...' : 'Save Template'}
          </button>
        </div>
      </div>

      <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl p-6 rounded-3xl border border-white/50 dark:border-gray-700/50">
        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Itinerary Title (Optional)</label>
        <input 
          type="text" 
          value={title} 
          onChange={e => setTitle(e.target.value)} 
          placeholder="e.g. Magical 5 Days in Dubai"
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
                <input 
                  type="text" 
                  value={day.title} 
                  onChange={e => updateDay(dayIndex, 'title', e.target.value)} 
                  placeholder="Day Title (e.g. Arrival & Leisure)"
                  className="w-full h-10 px-3 font-bold text-lg rounded-lg border-2 border-transparent hover:border-gray-100 focus:border-primary bg-transparent focus:bg-white dark:focus:bg-gray-800 outline-none transition-colors"
                />
                <textarea 
                  value={day.description || ''} 
                  onChange={e => updateDay(dayIndex, 'description', e.target.value)} 
                  placeholder="Day description..."
                  className="w-full h-20 p-3 text-sm rounded-lg border-2 border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 focus:border-primary outline-none resize-none"
                />
              </div>
            </div>

            {/* Activities List */}
            <div className="ml-16 sm:ml-20 space-y-3 pl-4 border-l-2 border-dashed border-gray-200 dark:border-gray-700">
              {day.activities?.map((activity, actIndex) => (
                <div key={actIndex} className="flex gap-2 items-start relative group/act">
                  <input 
                    type="time" 
                    value={activity.time} 
                    onChange={e => updateActivity(dayIndex, actIndex, 'time', e.target.value)}
                    className="w-24 h-10 px-2 text-sm rounded-lg border-2 border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 outline-none focus:border-primary"
                  />
                  
                  <div className="relative">
                    <select
                      value={activity.icon}
                      onChange={e => updateActivity(dayIndex, actIndex, 'icon', e.target.value)}
                      className="w-12 h-10 text-center appearance-none rounded-lg border-2 border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 outline-none focus:border-primary text-lg cursor-pointer"
                    >
                      {ICONS.map(i => <option key={i} value={i}>{i}</option>)}
                      <option value="📍">📍</option>
                    </select>
                  </div>

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
      </div>

      {/* AI Modal */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-lg p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600">
                  <Wand2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">AI Itinerary Generator</h3>
                  <p className="text-xs text-gray-500">I will use the package items you've added to build a smart timeline.</p>
                </div>
              </div>
              <button onClick={() => setIsAiModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Trip Vibe & Preferences
              </label>
              <textarea
                value={aiPrompt}
                onChange={e => setAiPrompt(e.target.value)}
                placeholder="e.g. Keep it relaxed with late mornings. Focus on local food and cultural experiences. We are a family of 4 with young kids."
                className="w-full h-32 p-4 rounded-xl border-2 border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 focus:border-indigo-500 outline-none resize-none text-sm"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button onClick={() => setIsAiModalOpen(false)} className="px-5 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors">
                Cancel
              </button>
              <button 
                onClick={handleGenerateAI}
                className="px-5 py-2.5 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-md transition-all active:scale-95 flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" /> Generate Plan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
