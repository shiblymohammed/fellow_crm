'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { FileDown, X, CheckCircle2, Loader2, Plus, Trash2, ChevronDown, ChevronUp, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

interface Activity {
  time: string;
  icon: string;
  description: string;
}

interface ItineraryDay {
  dayNumber: number;
  title: string;
  description: string;
  activities: Activity[];
}

interface GeneratePdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: 'itinerary' | 'quotation' | 'invoice';
  autoFieldsData: any;
}

const ACTIVITY_ICONS = ['✈️', '🏨', '🍽️', '🏛️', '📸', '🍷', '🚗', '🛥️', '🏖️', '⛰️', '🎭', '🛍️', '🚶', '🏊', '🌅'];

export default function GeneratePdfModal({ isOpen, onClose, category, autoFieldsData }: GeneratePdfModalProps) {
  const [installedTemplates, setInstalledTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<any | null>(null);
  const [step, setStep] = useState<'select' | 'build'>('select');
  const [userInputs, setUserInputs] = useState<Record<string, any>>({});
  const [days, setDays] = useState<ItineraryDay[]>([
    { dayNumber: 1, title: '', description: '', activities: [{ time: '', icon: '✈️', description: '' }] }
  ]);
  const [expandedDays, setExpandedDays] = useState<Record<number, boolean>>({ 0: true });
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchInstalledTemplates();
    } else {
      setSelectedTemplate(null);
      setStep('select');
      setUserInputs({});
      setDays([{ dayNumber: 1, title: '', description: '', activities: [{ time: '', icon: '✈️', description: '' }] }]);
      setExpandedDays({ 0: true });
    }
  }, [isOpen]);

  const fetchInstalledTemplates = async () => {
    try {
      const res = await api.get(`/marketplace-templates/installed?category=${category}`);
      setInstalledTemplates(res.data);
    } catch {
      toast.error('Failed to load your templates');
    }
  };

  // --- Day Builders ---
  const addDay = () => {
    const newIndex = days.length;
    setDays([...days, { dayNumber: newIndex + 1, title: '', description: '', activities: [] }]);
    setExpandedDays({ ...expandedDays, [newIndex]: true });
  };

  const removeDay = (index: number) => {
    const updated = days.filter((_, i) => i !== index).map((d, i) => ({ ...d, dayNumber: i + 1 }));
    setDays(updated);
  };

  const updateDay = (index: number, field: keyof Omit<ItineraryDay, 'activities' | 'dayNumber'>, value: string) => {
    const updated = [...days];
    updated[index] = { ...updated[index], [field]: value };
    setDays(updated);
  };

  const addActivity = (dayIndex: number) => {
    const updated = [...days];
    updated[dayIndex].activities = [...updated[dayIndex].activities, { time: '', icon: '📌', description: '' }];
    setDays(updated);
  };

  const removeActivity = (dayIndex: number, actIndex: number) => {
    const updated = [...days];
    updated[dayIndex].activities = updated[dayIndex].activities.filter((_, i) => i !== actIndex);
    setDays(updated);
  };

  const updateActivity = (dayIndex: number, actIndex: number, field: keyof Activity, value: string) => {
    const updated = [...days];
    updated[dayIndex].activities[actIndex] = { ...updated[dayIndex].activities[actIndex], [field]: value };
    setDays(updated);
  };

  const toggleDay = (index: number) => {
    setExpandedDays({ ...expandedDays, [index]: !expandedDays[index] });
  };

  // --- Repeatable Field Builders ---
  const addRepeatableItem = (fieldKey: string, subFields: any[]) => {
    const current = userInputs[fieldKey] || [];
    const newItem: any = {};
    subFields.forEach((sf: any) => newItem[sf.key] = '');
    setUserInputs({ ...userInputs, [fieldKey]: [...current, newItem] });
  };

  const removeRepeatableItem = (fieldKey: string, index: number) => {
    const current = [...(userInputs[fieldKey] || [])];
    current.splice(index, 1);
    setUserInputs({ ...userInputs, [fieldKey]: current });
  };

  const updateRepeatableItem = (fieldKey: string, index: number, subKey: string, value: string) => {
    const current = [...(userInputs[fieldKey] || [])];
    current[index] = { ...current[index], [subKey]: value };
    setUserInputs({ ...userInputs, [fieldKey]: current });
  };

  // --- Generation ---
  const handleGenerate = async () => {
    if (!selectedTemplate) return;
    setIsGenerating(true);

    try {
      const payload = {
        ...autoFieldsData,
        ...userInputs,
        days,  // Pass the structured days array to Handlebars {{#each days}}
      };

      const res = await api.post(
        `/marketplace-templates/installed/${selectedTemplate.id}/generate-pdf`,
        payload,
        { responseType: 'blob' }
      );

      const contentType = res.headers['content-type'] || '';
      if (contentType.includes('application/json')) {
        const text = await (res.data as Blob).text();
        const json = JSON.parse(text);
        throw new Error(json.message || 'Failed to generate PDF');
      }

      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${selectedTemplate.template.name.replace(/\s+/g, '_')}_Generated.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('PDF Generated successfully!');
      onClose();
    } catch (error: any) {
      let errorMessage = 'Failed to generate PDF';
      if (error?.response?.data instanceof Blob) {
        try {
          const text = await (error.response.data as Blob).text();
          const json = JSON.parse(text);
          errorMessage = json.message || errorMessage;
        } catch { /* ignore */ }
      } else if (error?.message) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

  // Get user-fillable fields from schema
  const schema = selectedTemplate
    ? (typeof selectedTemplate.template.fieldSchema === 'string'
        ? JSON.parse(selectedTemplate.template.fieldSchema)
        : (selectedTemplate.template.fieldSchema || []))
    : [];
  const userFields = schema.filter((f: any) => f.source === 'user_input' || f.source === 'user_upload');
  const hasItineraryDays = schema.some((f: any) => f.key === 'days' || f.type === 'itinerary_days');

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl">

        {/* Header */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100 dark:border-gray-800 shrink-0">
          <div className="flex items-center gap-3">
            {step === 'build' && (
              <button onClick={() => setStep('select')} className="text-gray-400 hover:text-gray-600 transition-colors mr-1">
                ← Back
              </button>
            )}
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <FileDown className="w-5 h-5 text-indigo-500" />
                Generate {category.charAt(0).toUpperCase() + category.slice(1)} PDF
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {step === 'select' ? 'Step 1: Select a template' : 'Step 2: Build your itinerary'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 rounded-full transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-gray-100 dark:bg-gray-800 shrink-0">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500"
            style={{ width: step === 'select' ? '50%' : '100%' }}
          />
        </div>

        {/* Body */}
        <div className="flex-grow overflow-y-auto p-6">

          {/* STEP 1: Select Template */}
          {step === 'select' && (
            <div className="space-y-4">
              {installedTemplates.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 dark:bg-gray-800/40 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                  <MapPin className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-bold mb-3">No installed templates for {category}</p>
                  <a href="/marketplace" className="text-indigo-600 font-bold hover:underline text-sm">
                    Browse Marketplace →
                  </a>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {installedTemplates.map((installed: any) => (
                    <div
                      key={installed.id}
                      onClick={() => { setSelectedTemplate(installed); setStep('build'); }}
                      className="border-2 border-gray-100 dark:border-gray-800 hover:border-indigo-500 dark:hover:border-indigo-400 rounded-2xl p-2 cursor-pointer transition-all group"
                    >
                      <div className="w-full h-36 bg-gray-100 dark:bg-gray-800 rounded-xl mb-3 overflow-hidden">
                        {installed.template.previewImageUrl && (
                          <img
                            src={installed.template.previewImageUrl}
                            alt="Preview"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        )}
                      </div>
                      <div className="px-1 pb-1">
                        <h4 className="font-bold text-gray-900 dark:text-white text-sm line-clamp-1">{installed.template.name}</h4>
                        <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">{installed.template.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STEP 2: Build Itinerary */}
          {step === 'build' && selectedTemplate && (
            <div className="space-y-6">

              {/* Selected template badge */}
              <div className="flex items-center gap-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-2xl p-3">
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl overflow-hidden shrink-0">
                  {selectedTemplate.template.previewImageUrl && (
                    <img src={selectedTemplate.template.previewImageUrl} className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-gray-900 dark:text-white truncate">{selectedTemplate.template.name}</p>
                  <p className="text-xs text-indigo-500 flex items-center gap-1 font-semibold mt-0.5">
                    <CheckCircle2 className="w-3 h-3" /> Template selected
                  </p>
                </div>
              </div>

              {/* User input fields (text/image/number/textarea from schema) */}
              {userFields.filter((f: any) => f.type !== 'repeatable').length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Template Variables</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {userFields.filter((f: any) => f.type !== 'repeatable').map((field: any, idx: number) => (
                      <div key={idx} className={field.type === 'textarea' ? 'sm:col-span-2' : ''}>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{field.label || field.key}</label>
                        {field.type === 'textarea' ? (
                          <textarea
                            placeholder={`Enter ${field.label || field.key}...`}
                            value={userInputs[field.key] || ''}
                            onChange={e => setUserInputs({ ...userInputs, [field.key]: e.target.value })}
                            rows={3}
                            className="w-full px-3 py-2 rounded-xl border-2 border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 focus:border-indigo-500 outline-none text-sm resize-none"
                          />
                        ) : (
                          <input
                            type={field.type === 'number' ? 'number' : 'text'}
                            placeholder={field.type === 'image' ? 'Paste image URL...' : `Enter ${field.label || field.key}...`}
                            value={userInputs[field.key] || ''}
                            onChange={e => setUserInputs({ ...userInputs, [field.key]: e.target.value })}
                            className="w-full h-10 px-3 rounded-xl border-2 border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 focus:border-indigo-500 outline-none text-sm"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Repeatable Lists (e.g. Inclusions, Hotels) */}
              {userFields.filter((f: any) => f.type === 'repeatable').map((field: any, idx: number) => {
                const items = userInputs[field.key] || [];
                return (
                  <div key={idx} className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                        {field.label || field.key} <span className="ml-2 px-2 py-0.5 bg-indigo-100 text-indigo-600 rounded-full text-xs font-bold">{items.length}</span>
                      </h3>
                      <button
                        onClick={() => addRepeatableItem(field.key, field.subFields || [])}
                        className="flex items-center gap-1.5 text-sm font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl transition-colors"
                      >
                        <Plus className="w-4 h-4" /> Add Item
                      </button>
                    </div>

                    <div className="space-y-3">
                      {items.map((item: any, itemIdx: number) => (
                        <div key={itemIdx} className="border-2 border-gray-100 dark:border-gray-800 rounded-2xl p-4 bg-gray-50/50 dark:bg-gray-900/20 relative group">
                          <button
                            onClick={() => removeRepeatableItem(field.key, itemIdx)}
                            className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-6">
                            {(field.subFields || []).map((sf: any, sfIdx: number) => (
                              <div key={sfIdx} className={sf.type === 'textarea' ? 'sm:col-span-2' : ''}>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{sf.label || sf.key}</label>
                                {sf.type === 'textarea' ? (
                                  <textarea
                                    placeholder={`Enter ${sf.label || sf.key}...`}
                                    value={item[sf.key] || ''}
                                    onChange={e => updateRepeatableItem(field.key, itemIdx, sf.key, e.target.value)}
                                    rows={2}
                                    className="w-full px-3 py-2 rounded-lg border-2 border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 focus:border-indigo-500 outline-none text-sm resize-none"
                                  />
                                ) : (
                                  <input
                                    type={sf.type === 'number' ? 'number' : 'text'}
                                    placeholder={sf.type === 'image' ? 'Image URL...' : `Enter ${sf.label || sf.key}...`}
                                    value={item[sf.key] || ''}
                                    onChange={e => updateRepeatableItem(field.key, itemIdx, sf.key, e.target.value)}
                                    className="w-full h-9 px-3 rounded-lg border-2 border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 focus:border-indigo-500 outline-none text-sm"
                                  />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* Days Builder */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                    Itinerary Days <span className="ml-2 px-2 py-0.5 bg-indigo-100 text-indigo-600 rounded-full text-xs font-bold">{days.length}</span>
                  </h3>
                  <button
                    onClick={addDay}
                    className="flex items-center gap-1.5 text-sm font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl transition-colors"
                  >
                    <Plus className="w-4 h-4" /> Add Day
                  </button>
                </div>

                {days.map((day, dayIdx) => (
                  <div key={dayIdx} className="border-2 border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden">
                    {/* Day Header */}
                    <div
                      className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800/50 cursor-pointer"
                      onClick={() => toggleDay(dayIdx)}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-600 text-white text-xs font-extrabold rounded-xl flex items-center justify-center shrink-0">
                          {day.dayNumber}
                        </span>
                        <span className="font-bold text-gray-800 dark:text-white text-sm">
                          {day.title || `Day ${day.dayNumber} — Click to expand`}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {days.length > 1 && (
                          <button
                            onClick={e => { e.stopPropagation(); removeDay(dayIdx); }}
                            className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {expandedDays[dayIdx] ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                      </div>
                    </div>

                    {/* Day Body */}
                    {expandedDays[dayIdx] && (
                      <div className="p-4 space-y-4">
                        <div className="grid grid-cols-1 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Day Title</label>
                            <input
                              type="text"
                              placeholder="e.g. Arrival & City Introduction"
                              value={day.title}
                              onChange={e => updateDay(dayIdx, 'title', e.target.value)}
                              className="w-full h-10 px-3 rounded-xl border-2 border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 focus:border-indigo-500 outline-none text-sm font-bold"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description</label>
                            <textarea
                              placeholder="Brief description of the day's plan..."
                              value={day.description}
                              onChange={e => updateDay(dayIdx, 'description', e.target.value)}
                              rows={2}
                              className="w-full px-3 py-2 rounded-xl border-2 border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 focus:border-indigo-500 outline-none text-sm resize-none"
                            />
                          </div>
                        </div>

                        {/* Activities */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Activities</label>
                            <button
                              onClick={() => addActivity(dayIdx)}
                              className="text-xs text-indigo-500 font-bold hover:text-indigo-700 flex items-center gap-1"
                            >
                              <Plus className="w-3 h-3" /> Add Activity
                            </button>
                          </div>
                          <div className="space-y-2">
                            {day.activities.map((act, actIdx) => (
                              <div key={actIdx} className="flex gap-2 items-center">
                                <select
                                  value={act.icon}
                                  onChange={e => updateActivity(dayIdx, actIdx, 'icon', e.target.value)}
                                  className="w-12 h-9 text-center rounded-lg border-2 border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 outline-none text-base cursor-pointer"
                                >
                                  {ACTIVITY_ICONS.map(icon => (
                                    <option key={icon} value={icon}>{icon}</option>
                                  ))}
                                </select>
                                <input
                                  type="text"
                                  placeholder="Time (e.g. 09:00)"
                                  value={act.time}
                                  onChange={e => updateActivity(dayIdx, actIdx, 'time', e.target.value)}
                                  className="w-24 h-9 px-2 text-xs rounded-lg border-2 border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 focus:border-indigo-500 outline-none"
                                />
                                <input
                                  type="text"
                                  placeholder="Activity description..."
                                  value={act.description}
                                  onChange={e => updateActivity(dayIdx, actIdx, 'description', e.target.value)}
                                  className="flex-1 h-9 px-3 text-sm rounded-lg border-2 border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 focus:border-indigo-500 outline-none"
                                />
                                {day.activities.length > 1 && (
                                  <button onClick={() => removeActivity(dayIdx, actIdx)} className="p-1.5 text-red-400 hover:text-red-600 transition-colors">
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {step === 'build' && (
          <div className="shrink-0 px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 flex items-center justify-between gap-4">
            <p className="text-xs text-gray-400">{days.length} day{days.length !== 1 ? 's' : ''} • {days.reduce((acc, d) => acc + d.activities.length, 0)} activities</p>
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none transition-all disabled:opacity-60"
            >
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
              {isGenerating ? 'Generating...' : 'Generate & Download PDF'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
