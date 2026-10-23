"use client";

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

interface Lead {
  id: string;
  destination: string | null;
  travel_date: string | null;
  return_date: string | null;
  adults: number;
  children: number;
  infants: number;
  budget_per_person: number | null;
  source: string;
  status: string;
  created_at: string;
  customer: { id: string; name: string; phone: string; email: string | null };
  assigned_user: { id: string; name: string } | null;
  _count: { followups: number; quotations: number };
}

const LEAD_STATUSES = [
  { key: 'new', label: 'New', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { key: 'contacted', label: 'Contacted', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  { key: 'interested', label: 'Interested', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { key: 'quotation_sent', label: 'Quotation Sent', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
  { key: 'negotiating', label: 'Negotiating', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  { key: 'won', label: 'Won', color: 'bg-green-100 text-green-700 border-green-200' },
  { key: 'lost', label: 'Lost', color: 'bg-red-100 text-red-700 border-red-200' },
  { key: 'cold', label: 'Cold', color: 'bg-gray-100 text-gray-700 border-gray-200' },
];

const SOURCES = ['whatsapp', 'phone', 'website', 'walk_in', 'instagram', 'facebook', 'google', 'referral'];

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [view, setView] = useState<'table' | 'kanban'>('kanban');

  // Create Lead Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    destination: '',
    travelDate: '',
    returnDate: '',
    adults: 1,
    children: 0,
    infants: 0,
    budgetPerPerson: 0,
    specialRequests: '',
    source: 'phone' as string,
  });

  useEffect(() => {
    fetchLeads();
  }, [search, statusFilter]);

  const fetchLeads = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      const { data } = await api.get(`/leads?${params.toString()}`);
      setLeads(data);
    } catch (error) {
      toast.error('Failed to load leads');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/leads', formData);
      toast.success('Lead created!');
      setIsModalOpen(false);
      setFormData({ customerName: '', customerPhone: '', customerEmail: '', destination: '', travelDate: '', returnDate: '', adults: 1, children: 0, infants: 0, budgetPerPerson: 0, specialRequests: '', source: 'phone' });
      fetchLeads();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create lead');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    try {
      await api.patch(`/leads/${leadId}`, { status: newStatus });
      toast.success(`Lead moved to ${newStatus.replace('_', ' ')}`);
      fetchLeads();
    } catch (error) {
      toast.error('Failed to update lead status');
    }
  };

  const getStatusColor = (status: string) => {
    return LEAD_STATUSES.find(s => s.key === status)?.color || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="w-full space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl p-6 rounded-3xl border border-white/50 dark:border-gray-700/50 shadow-sm relative overflow-hidden">
        <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Leads
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">
            {leads.length} total leads in pipeline
          </p>
        </div>
        <div className="relative z-10 flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
            <button onClick={() => setView('kanban')} className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${view === 'kanban' ? 'bg-white dark:bg-gray-600 shadow text-primary' : 'text-gray-500'}`}>
              Kanban
            </button>
            <button onClick={() => setView('table')} className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${view === 'table' ? 'bg-white dark:bg-gray-600 shadow text-primary' : 'text-gray-500'}`}>
              Table
            </button>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-primary hover:bg-primary/90 text-white font-bold py-3 px-6 rounded-2xl shadow-lg shadow-primary/30 transition-all active:scale-95 flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            New Lead
          </button>
        </div>
      </div>

      {/* Search + Filter Row */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input
            type="text"
            placeholder="Search by destination, customer name or phone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full h-12 pl-12 pr-4 rounded-2xl border border-white/60 dark:border-gray-700/60 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl focus:border-primary focus:ring-0 outline-none shadow-sm transition-colors"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="h-12 px-4 rounded-2xl border border-white/60 dark:border-gray-700/60 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl focus:border-primary focus:ring-0 outline-none shadow-sm appearance-none font-bold text-sm"
        >
          <option value="">All Statuses</option>
          {LEAD_STATUSES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
        </select>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-64 bg-white/50 dark:bg-gray-800/50 rounded-3xl animate-pulse"></div>)}
        </div>
      ) : view === 'kanban' ? (
        /* KANBAN VIEW */
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-2 px-2">
          {LEAD_STATUSES.filter(s => !statusFilter || s.key === statusFilter).map(status => {
            const statusLeads = leads.filter(l => l.status === status.key);
            return (
              <div key={status.key} className="flex-shrink-0 w-72 bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl rounded-2xl border border-white/50 dark:border-gray-700/50 flex flex-col max-h-[75vh]">
                {/* Column Header */}
                <div className="p-4 border-b border-gray-100 dark:border-gray-700/50">
                  <div className="flex items-center justify-between">
                    <span className={`px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wider rounded-lg border ${status.color}`}>
                      {status.label}
                    </span>
                    <span className="text-xs font-bold text-gray-400">{statusLeads.length}</span>
                  </div>
                </div>
                
                {/* Cards */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                  {statusLeads.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-8 italic">No leads</p>
                  ) : (
                    statusLeads.map(lead => (
                      <div key={lead.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all group">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-bold text-sm text-gray-900 dark:text-white">{lead.customer?.name}</h4>
                        </div>
                        {lead.destination && (
                          <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" /></svg>
                            <span className="font-medium">{lead.destination}</span>
                          </div>
                        )}
                        {lead.travel_date && (
                          <p className="text-[10px] text-gray-400 mb-2">
                            📅 {format(new Date(lead.travel_date), 'MMM d, yyyy')}
                            {lead.adults && ` • ${lead.adults}A`}{lead.children ? ` ${lead.children}C` : ''}
                          </p>
                        )}
                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-50 dark:border-gray-700/50">
                          <span className="text-[10px] font-bold text-gray-400">{lead.source.replace('_', ' ')}</span>
                          {/* Status quick move */}
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {status.key !== 'won' && status.key !== 'lost' && (
                              <>
                                {LEAD_STATUSES.findIndex(s => s.key === status.key) < LEAD_STATUSES.length - 3 && (
                                  <button
                                    onClick={() => handleStatusChange(lead.id, LEAD_STATUSES[LEAD_STATUSES.findIndex(s => s.key === status.key) + 1].key)}
                                    className="text-[9px] font-bold px-2 py-0.5 rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                                    title="Move to next stage"
                                  >
                                    Next →
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-2xl rounded-3xl border border-white/60 dark:border-gray-700/60 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/80 dark:bg-gray-900/50">
                <tr>
                  <th className="text-left text-[11px] font-extrabold uppercase tracking-wider text-gray-500 px-6 py-4">Customer</th>
                  <th className="text-left text-[11px] font-extrabold uppercase tracking-wider text-gray-500 px-6 py-4">Destination</th>
                  <th className="text-left text-[11px] font-extrabold uppercase tracking-wider text-gray-500 px-6 py-4">Travel Date</th>
                  <th className="text-left text-[11px] font-extrabold uppercase tracking-wider text-gray-500 px-6 py-4">Pax</th>
                  <th className="text-left text-[11px] font-extrabold uppercase tracking-wider text-gray-500 px-6 py-4">Source</th>
                  <th className="text-left text-[11px] font-extrabold uppercase tracking-wider text-gray-500 px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100/50 dark:divide-gray-700/50">
                {leads.map(lead => (
                  <tr key={lead.id} className="hover:bg-white/40 dark:hover:bg-gray-700/40 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-sm text-gray-900 dark:text-white">{lead.customer?.name}</p>
                      <p className="text-xs text-gray-500">{lead.customer?.phone}</p>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-700 dark:text-gray-300">{lead.destination || '—'}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{lead.travel_date ? format(new Date(lead.travel_date), 'MMM d, yyyy') : '—'}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{lead.adults}A {lead.children ? `${lead.children}C` : ''}</td>
                    <td className="px-6 py-4 text-xs font-medium text-gray-500 capitalize">{lead.source.replace('_', ' ')}</td>
                    <td className="px-6 py-4">
                      <select
                        value={lead.status}
                        onChange={e => handleStatusChange(lead.id, e.target.value)}
                        className={`text-[11px] font-extrabold uppercase tracking-wider px-3 py-1.5 rounded-lg border appearance-none cursor-pointer ${getStatusColor(lead.status)}`}
                      >
                        {LEAD_STATUSES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Lead Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white dark:bg-gray-800 w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden overflow-y-auto max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">New Lead</h2>
              
              <form onSubmit={handleCreateLead} className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700 space-y-3">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Customer Info</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" required placeholder="Customer Name *" value={formData.customerName} onChange={e => setFormData({...formData, customerName: e.target.value})} className="col-span-2 h-11 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:border-primary focus:ring-0 outline-none" />
                    <input type="text" required placeholder="Phone *" value={formData.customerPhone} onChange={e => setFormData({...formData, customerPhone: e.target.value})} className="h-11 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:border-primary focus:ring-0 outline-none" />
                    <input type="email" placeholder="Email" value={formData.customerEmail} onChange={e => setFormData({...formData, customerEmail: e.target.value})} className="h-11 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:border-primary focus:ring-0 outline-none" />
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Trip Details</h3>
                  <input type="text" placeholder="Destination" value={formData.destination} onChange={e => setFormData({...formData, destination: e.target.value})} className="w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:border-primary focus:ring-0 outline-none" />
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 mb-0.5 block">Travel Date</label>
                      <input type="date" value={formData.travelDate} onChange={e => setFormData({...formData, travelDate: e.target.value})} className="w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:border-primary focus:ring-0 outline-none" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 mb-0.5 block">Return Date</label>
                      <input type="date" value={formData.returnDate} onChange={e => setFormData({...formData, returnDate: e.target.value})} className="w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:border-primary focus:ring-0 outline-none" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 mb-0.5 block">Adults</label>
                      <input type="number" min="1" value={formData.adults} onChange={e => setFormData({...formData, adults: parseInt(e.target.value)})} className="w-full h-11 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:border-primary focus:ring-0 outline-none" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 mb-0.5 block">Children</label>
                      <input type="number" min="0" value={formData.children} onChange={e => setFormData({...formData, children: parseInt(e.target.value)})} className="w-full h-11 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:border-primary focus:ring-0 outline-none" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 mb-0.5 block">Infants</label>
                      <input type="number" min="0" value={formData.infants} onChange={e => setFormData({...formData, infants: parseInt(e.target.value)})} className="w-full h-11 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:border-primary focus:ring-0 outline-none" />
                    </div>
                  </div>
                  <select value={formData.source} onChange={e => setFormData({...formData, source: e.target.value})} className="w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:border-primary focus:ring-0 outline-none appearance-none">
                    {SOURCES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                  </select>
                  <textarea placeholder="Special Requests" value={formData.specialRequests} onChange={e => setFormData({...formData, specialRequests: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:border-primary focus:ring-0 outline-none resize-none" rows={2} />
                </div>

                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 h-12 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="flex-1 h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/30 transition-all active:scale-95 disabled:opacity-70">
                    {isSubmitting ? 'Creating...' : 'Create Lead'}
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
