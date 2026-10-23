"use client";

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { format, isPast, isToday } from 'date-fns';

interface Followup {
  id: string;
  due_at: string;
  type: string;
  note: string | null;
  status: string;
  completed_at: string | null;
  lead: { id: string; destination: string | null; customer: { name: string; phone: string } } | null;
  booking: { id: string; booking_number: string; destination: string } | null;
  assigned_user: { id: string; name: string } | null;
}

const FOLLOWUP_TYPES: Record<string, { icon: string; label: string }> = {
  call: { icon: '📞', label: 'Call' },
  whatsapp: { icon: '💬', label: 'WhatsApp' },
  email: { icon: '📧', label: 'Email' },
  visit: { icon: '🏢', label: 'Visit' },
  other: { icon: '📋', label: 'Other' },
};

const FILTERS = [
  { key: '', label: 'All' },
  { key: 'today', label: 'Today' },
  { key: 'overdue', label: 'Overdue' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'done', label: 'Completed' },
];

export default function FollowupsPage() {
  const [followups, setFollowups] = useState<Followup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('today');

  // Create modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    leadId: '',
    dueAt: '',
    type: 'call' as string,
    note: '',
  });

  useEffect(() => {
    fetchFollowups();
  }, [filter]);

  const fetchFollowups = async () => {
    try {
      const params = filter ? `?filter=${filter}` : '';
      const { data } = await api.get(`/followups${params}`);
      setFollowups(data);
    } catch (error) {
      toast.error('Failed to load follow-ups');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkDone = async (id: string) => {
    try {
      await api.patch(`/followups/${id}`, { status: 'done' });
      toast.success('Follow-up completed!');
      fetchFollowups();
    } catch (error) {
      toast.error('Failed to update follow-up');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/followups', formData);
      toast.success('Follow-up scheduled!');
      setIsModalOpen(false);
      setFormData({ leadId: '', dueAt: '', type: 'call', note: '' });
      fetchFollowups();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create follow-up');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getUrgencyClass = (dueAt: string, status: string) => {
    if (status === 'done') return 'border-l-green-500';
    if (isPast(new Date(dueAt))) return 'border-l-red-500';
    if (isToday(new Date(dueAt))) return 'border-l-yellow-500';
    return 'border-l-blue-500';
  };

  return (
    <div className="w-full space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl p-6 rounded-3xl border border-white/50 dark:border-gray-700/50 shadow-sm relative overflow-hidden">
        <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Follow-ups
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">
            {followups.length} follow-ups {filter ? `(${filter})` : ''}
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="relative z-10 bg-primary hover:bg-primary/90 text-white font-bold py-3 px-6 rounded-2xl shadow-lg shadow-primary/30 transition-all active:scale-95 flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Schedule Follow-up
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => { setFilter(f.key); setIsLoading(true); }}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
              filter === f.key
                ? 'bg-primary text-white shadow-md shadow-primary/30'
                : 'bg-white/60 dark:bg-gray-800/60 text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700 border border-white/60 dark:border-gray-700/60'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Follow-up List */}
      <div className="space-y-3">
        {isLoading ? (
          [1,2,3,4].map(i => <div key={i} className="h-20 bg-white/50 dark:bg-gray-800/50 rounded-2xl animate-pulse"></div>)
        ) : followups.length === 0 ? (
          <div className="text-center py-20 bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl rounded-3xl border border-white/50 dark:border-gray-700/50">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
            </svg>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">No follow-ups</h3>
            <p className="text-gray-500 mt-1">Nothing to do here right now. 🎉</p>
          </div>
        ) : (
          followups.map(followup => (
            <div
              key={followup.id}
              className={`bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl border border-white/60 dark:border-gray-700/60 shadow-sm p-5 flex items-center gap-4 border-l-4 ${getUrgencyClass(followup.due_at, followup.status)} group hover:shadow-md transition-all`}
            >
              {/* Type Icon */}
              <div className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-gray-900 flex items-center justify-center text-2xl shrink-0 border border-gray-100 dark:border-gray-700">
                {FOLLOWUP_TYPES[followup.type]?.icon || '📋'}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-sm text-gray-900 dark:text-white truncate">
                    {followup.lead?.customer?.name || followup.booking?.destination || 'Unknown'}
                  </h3>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-500">
                    {FOLLOWUP_TYPES[followup.type]?.label}
                  </span>
                </div>
                {followup.note && (
                  <p className="text-xs text-gray-500 truncate">{followup.note}</p>
                )}
                <p className="text-[10px] text-gray-400 mt-1">
                  {followup.lead?.destination ? `📍 ${followup.lead.destination}` : ''}
                  {followup.assigned_user ? ` • Assigned to ${followup.assigned_user.name}` : ''}
                </p>
              </div>

              {/* Due Date + Actions */}
              <div className="shrink-0 text-right flex flex-col items-end gap-2">
                <span className={`text-xs font-bold ${
                  followup.status === 'done' ? 'text-green-600' :
                  isPast(new Date(followup.due_at)) ? 'text-red-600' :
                  isToday(new Date(followup.due_at)) ? 'text-yellow-600' : 'text-gray-500'
                }`}>
                  {format(new Date(followup.due_at), 'MMM d, h:mm a')}
                </span>
                {followup.status === 'pending' && (
                  <button
                    onClick={() => handleMarkDone(followup.id)}
                    className="text-[10px] font-bold px-3 py-1 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    ✓ Done
                  </button>
                )}
                {followup.status === 'done' && (
                  <span className="text-[10px] font-bold px-3 py-1 rounded-lg bg-green-50 text-green-600">Completed</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white dark:bg-gray-800 w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Schedule Follow-up</h2>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Due Date & Time *</label>
                  <input type="datetime-local" required value={formData.dueAt} onChange={e => setFormData({...formData, dueAt: e.target.value})} className="w-full h-12 px-4 rounded-xl border-2 border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:border-primary focus:ring-0 outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Type</label>
                  <div className="flex gap-2 flex-wrap">
                    {Object.entries(FOLLOWUP_TYPES).map(([key, val]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setFormData({...formData, type: key})}
                        className={`px-3 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-1.5 ${
                          formData.type === key
                            ? 'bg-primary text-white shadow-md'
                            : 'bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-100 dark:border-gray-700 hover:border-primary/50'
                        }`}
                      >
                        <span>{val.icon}</span> {val.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Note</label>
                  <textarea value={formData.note} onChange={e => setFormData({...formData, note: e.target.value})} className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:border-primary focus:ring-0 outline-none transition-colors resize-none" placeholder="What needs to be done?" rows={3} />
                </div>
                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 h-12 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="flex-1 h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/30 transition-all active:scale-95 disabled:opacity-70">
                    {isSubmitting ? 'Scheduling...' : 'Schedule'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
