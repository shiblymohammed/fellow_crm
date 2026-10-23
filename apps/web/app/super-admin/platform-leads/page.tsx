"use client";

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

interface PlatformLead {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  agencyName: string | null;
  message: string | null;
  source: string | null;
  status: string;
  notes: string | null;
  createdAt: string;
}

const STATUS_STAGES = [
  { id: 'new', label: 'New Lead', color: 'blue' },
  { id: 'contacted', label: 'Contacted', color: 'orange' },
  { id: 'demo_scheduled', label: 'Demo Scheduled', color: 'purple' },
  { id: 'closed_won', label: 'Closed Won', color: 'green' },
  { id: 'closed_lost', label: 'Closed Lost', color: 'red' },
];

export default function PlatformLeadsPage() {
  const [leads, setLeads] = useState<PlatformLead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Slide-out panel state
  const [selectedLead, setSelectedLead] = useState<PlatformLead | null>(null);
  
  // Form states
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const { data } = await api.get('/platform-leads');
      setLeads(data);
    } catch (error) {
      toast.error('Failed to load leads');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenPanel = (lead: PlatformLead) => {
    setSelectedLead(lead);
    setNotes(lead.notes || '');
    setStatus(lead.status);
  };

  const handleClosePanel = () => {
    setSelectedLead(null);
  };

  const handleSaveLead = async () => {
    if (!selectedLead) return;
    setIsSaving(true);
    try {
      await api.patch(`/platform-leads/${selectedLead.id}`, { status, notes });
      toast.success('Lead updated successfully');
      fetchLeads();
      handleClosePanel();
    } catch (error) {
      toast.error('Failed to update lead');
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusColorClass = (color: string) => {
    const map: Record<string, string> = {
      blue: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/50',
      orange: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800/50',
      purple: 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800/50',
      green: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800/50',
      red: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/50',
    };
    return map[color] || map.blue;
  };

  const getStatusIcon = (statusId: string) => {
    switch (statusId) {
      case 'new': return '✨';
      case 'contacted': return '📞';
      case 'demo_scheduled': return '📅';
      case 'closed_won': return '🎉';
      case 'closed_lost': return '❌';
      default: return '📋';
    }
  };

  // Group leads by status for the board view
  const groupedLeads = STATUS_STAGES.reduce((acc, stage) => {
    acc[stage.id] = leads.filter(l => l.status === stage.id);
    return acc;
  }, {} as Record<string, PlatformLead[]>);

  return (
    <div className="w-full h-[calc(100vh-8rem)] flex flex-col space-y-6 relative overflow-hidden">
      
      {/* Header section */}
      <div className="flex justify-between items-center bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl p-6 rounded-3xl border border-white/50 dark:border-gray-700/50 shadow-sm shrink-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
            CRM Leads
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">
            Track inquiries from your public landing page.
          </p>
        </div>
        <div className="px-4 py-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 font-bold text-gray-700 dark:text-gray-300">
          Total Leads: {leads.length}
        </div>
      </div>

      {/* Board View */}
      {isLoading ? (
        <div className="flex-1 flex gap-6 overflow-x-auto pb-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="min-w-[320px] w-80 h-full bg-white/30 dark:bg-gray-800/30 rounded-3xl animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="flex-1 flex gap-6 overflow-x-auto pb-4 snap-x">
          {STATUS_STAGES.map(stage => (
            <div key={stage.id} className="min-w-[320px] w-[320px] max-w-[320px] flex flex-col bg-gray-50/50 dark:bg-gray-800/20 rounded-[2rem] border border-gray-200/50 dark:border-gray-700/30 overflow-hidden snap-center shrink-0">
              <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50 flex items-center justify-between bg-white/40 dark:bg-gray-800/40 backdrop-blur-md">
                <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  {getStatusIcon(stage.id)} {stage.label}
                </h3>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${getStatusColorClass(stage.color)} border`}>
                  {groupedLeads[stage.id]?.length || 0}
                </span>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {groupedLeads[stage.id]?.map(lead => (
                  <div 
                    key={lead.id}
                    onClick={() => handleOpenPanel(lead)}
                    className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md cursor-pointer transition-all active:scale-[0.98] group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors line-clamp-1">{lead.name || lead.email}</h4>
                      <span className="text-xs text-gray-400 shrink-0 font-medium">{format(new Date(lead.createdAt), 'MMM d')}</span>
                    </div>
                    {lead.agencyName && (
                      <div className="text-xs font-semibold text-primary/80 mb-3 bg-primary/5 inline-block px-2 py-1 rounded-lg">
                        🏢 {lead.agencyName}
                      </div>
                    )}
                    <div className="text-sm text-gray-500 flex items-center gap-2 mb-1">
                      <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                      <span className="truncate">{lead.email}</span>
                    </div>
                    {lead.phone && (
                      <div className="text-sm text-gray-500 flex items-center gap-2">
                        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                        <span className="truncate">{lead.phone}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Slide-out Panel Overlay */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-gray-900/20 backdrop-blur-sm transition-opacity" onClick={handleClosePanel}></div>
          <div className="relative w-full max-w-md bg-white dark:bg-gray-800 h-full shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col border-l border-gray-100 dark:border-gray-700">
            
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Lead Details</h2>
              <button onClick={handleClosePanel} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white">{selectedLead.name || 'Unknown Name'}</h3>
                  {selectedLead.agencyName && <p className="text-primary font-bold mt-1">🏢 {selectedLead.agencyName}</p>}
                </div>
                
                <div className="flex flex-col gap-2 bg-gray-50 dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-700">
                  <a href={`mailto:${selectedLead.email}`} className="flex items-center gap-3 text-gray-600 dark:text-gray-300 hover:text-primary transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    <span className="font-medium">{selectedLead.email}</span>
                  </a>
                  {selectedLead.phone && (
                    <a href={`tel:${selectedLead.phone}`} className="flex items-center gap-3 text-gray-600 dark:text-gray-300 hover:text-primary transition-colors">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                      <span className="font-medium">{selectedLead.phone}</span>
                    </a>
                  )}
                </div>
              </div>

              {selectedLead.message && (
                <div>
                  <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Message</h4>
                  <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-2xl border border-orange-100 dark:border-orange-900/50 text-orange-800 dark:text-orange-200 text-sm leading-relaxed whitespace-pre-wrap">
                    "{selectedLead.message}"
                  </div>
                </div>
              )}

              <hr className="border-gray-100 dark:border-gray-700" />

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Lead Status</label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-primary focus:ring-0 outline-none transition-colors appearance-none font-medium"
                  >
                    {STATUS_STAGES.map(stage => (
                      <option key={stage.id} value={stage.id}>{stage.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Internal Notes</label>
                  <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    className="w-full p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-primary focus:ring-0 outline-none transition-colors resize-none text-sm"
                    rows={5}
                    placeholder="Add notes about this lead..."
                  />
                </div>
              </div>

            </div>

            <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex gap-4">
              <button
                onClick={handleClosePanel}
                className="flex-1 py-4 rounded-xl font-bold text-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveLead}
                disabled={isSaving}
                className="flex-1 py-4 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/30 transition-all active:scale-95 disabled:opacity-70 flex justify-center items-center gap-2"
              >
                {isSaving ? 'Saving...' : 'Save Lead'}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
