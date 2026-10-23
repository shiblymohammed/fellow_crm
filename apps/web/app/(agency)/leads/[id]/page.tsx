"use client";

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { useParams, useRouter } from 'next/navigation';

export default function LeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const leadId = params.id as string;

  const [lead, setLead] = useState<any>(null);
  const [notes, setNotes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Note Form
  const [noteContent, setNoteContent] = useState('');
  const [noteType, setNoteType] = useState('note');
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);

  useEffect(() => {
    if (leadId) {
      fetchLeadData();
      fetchNotes();
    }
  }, [leadId]);

  const fetchLeadData = async () => {
    try {
      const { data } = await api.get(`/leads/${leadId}`);
      setLead(data);
    } catch (error) {
      toast.error('Failed to load lead details');
      router.push('/leads');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchNotes = async () => {
    try {
      const { data } = await api.get(`/lead-notes/lead/${leadId}`);
      setNotes(data);
    } catch (error) {
      console.error('Failed to load notes', error);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim()) return;
    
    setIsSubmittingNote(true);
    try {
      await api.post('/lead-notes', {
        leadId,
        type: noteType,
        content: noteContent,
      });
      setNoteContent('');
      setNoteType('note');
      toast.success('Note added');
      fetchNotes();
    } catch (error) {
      toast.error('Failed to add note');
    } finally {
      setIsSubmittingNote(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      await api.patch(`/leads/${leadId}`, { status: newStatus });
      toast.success('Status updated');
      fetchLeadData();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div></div>;
  }

  if (!lead) return null;

  return (
    <div className="w-full space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/60 dark:bg-gray-800/60 backdrop-blur-2xl p-6 rounded-3xl border border-white/60 dark:border-gray-700/60 shadow-xl">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
              {lead.customer?.name}
              <span className="text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
                {lead.status.replace('_', ' ')}
              </span>
            </h1>
            <p className="text-sm font-medium text-gray-500 mt-1">
              {lead.destination || 'No destination specified'} • {lead.travelDate ? format(new Date(lead.travelDate), 'MMM d, yyyy') : 'No dates'}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
           <select 
              value={lead.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="px-4 py-2.5 rounded-xl border-2 border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 font-bold text-sm shadow-sm outline-none focus:border-primary cursor-pointer appearance-none"
            >
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="interested">Interested</option>
              <option value="quotation_sent">Quotation Sent</option>
              <option value="negotiating">Negotiating</option>
              <option value="won">Won</option>
              <option value="lost">Lost</option>
              <option value="cold">Cold</option>
            </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Details */}
        <div className="lg:col-span-1 space-y-6">
          {/* Customer Card */}
          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-2xl p-6 rounded-3xl border border-white/60 dark:border-gray-700/60 shadow-xl">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Customer Info</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  {lead.customer?.name?.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white">{lead.customer?.name}</p>
                  <p className="text-xs text-gray-500">Customer</p>
                </div>
              </div>
              <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-700/50">
                <p className="text-sm flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <span className="w-5 text-center">📞</span> {lead.customer?.phone}
                </p>
                {lead.customer?.email && (
                  <p className="text-sm flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <span className="w-5 text-center">✉️</span> {lead.customer?.email}
                  </p>
                )}
                {lead.source && (
                  <p className="text-sm flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <span className="w-5 text-center">🏷️</span> Source: <span className="capitalize">{lead.source.replace('_', ' ')}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Trip Details */}
          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-2xl p-6 rounded-3xl border border-white/60 dark:border-gray-700/60 shadow-xl">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Trip Requirements</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 font-medium">Destination</p>
                <p className="font-bold text-sm text-gray-900 dark:text-white">{lead.destination || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Passengers</p>
                <p className="font-bold text-sm text-gray-900 dark:text-white">
                  {lead.adults} Adults {lead.children > 0 && `, ${lead.children} Children`} {lead.infants > 0 && `, ${lead.infants} Infants`}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Travel Date</p>
                <p className="font-bold text-sm text-gray-900 dark:text-white">
                  {lead.travelDate ? format(new Date(lead.travelDate), 'MMM d, yyyy') : '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Return Date</p>
                <p className="font-bold text-sm text-gray-900 dark:text-white">
                   {lead.returnDate ? format(new Date(lead.returnDate), 'MMM d, yyyy') : '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Budget/Person</p>
                <p className="font-bold text-sm text-gray-900 dark:text-white">{lead.budgetPerPerson ? `₹${lead.budgetPerPerson}` : '—'}</p>
              </div>
            </div>
            {lead.specialRequests && (
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700/50">
                <p className="text-xs text-gray-500 font-medium mb-1">Special Requests</p>
                <p className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-900/50 p-3 rounded-xl border border-gray-100 dark:border-gray-700">
                  {lead.specialRequests}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Notes & Activity */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-2xl p-6 rounded-3xl border border-white/60 dark:border-gray-700/60 shadow-xl flex flex-col h-[600px]">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 shrink-0">Communication Log</h3>
            
            {/* Timeline */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-4 mb-4">
              {notes.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <span className="text-4xl mb-2 block">📝</span>
                  <p className="text-sm">No notes yet. Add your first note below.</p>
                </div>
              ) : (
                notes.map(note => (
                  <div key={note.id} className="flex gap-4">
                    <div className="shrink-0 flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-sm border border-gray-200 dark:border-gray-600">
                        {note.type === 'call' ? '📞' : note.type === 'whatsapp' ? '💬' : note.type === 'email' ? '✉️' : note.type === 'meeting' ? '🤝' : '📝'}
                      </div>
                      <div className="w-0.5 h-full bg-gray-100 dark:bg-gray-700 mt-2"></div>
                    </div>
                    <div className="pb-4 flex-1">
                      <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm relative group">
                         <div className="absolute top-4 -left-2 w-4 h-4 bg-white dark:bg-gray-800 border-t border-l border-gray-100 dark:border-gray-700 rotate-45 transform origin-center"></div>
                         <div className="relative z-10">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{note.type}</span>
                              <span className="text-xs text-gray-400">{format(new Date(note.createdAt), 'MMM d, h:mm a')}</span>
                            </div>
                            <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">{note.content}</p>
                         </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Add Note Form */}
            <div className="shrink-0 pt-4 border-t border-gray-100 dark:border-gray-700/50">
              <form onSubmit={handleAddNote}>
                <div className="flex gap-2 mb-2">
                  {['note', 'call', 'whatsapp', 'email', 'meeting'].map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setNoteType(type)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                        noteType === type 
                          ? 'bg-primary text-white shadow-md' 
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <textarea
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    placeholder={`Log a ${noteType}...`}
                    className="w-full pl-4 pr-24 py-3 rounded-2xl border-2 border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:border-primary focus:ring-0 outline-none transition-colors resize-none text-sm"
                    rows={3}
                    required
                  />
                  <button 
                    type="submit" 
                    disabled={isSubmittingNote || !noteContent.trim()}
                    className="absolute right-2 bottom-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white text-sm font-bold rounded-xl transition-all disabled:opacity-50"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
