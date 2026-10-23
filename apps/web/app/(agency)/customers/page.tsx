"use client";

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { toast } from 'react-hot-toast';


interface Customer {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  whatsapp: string | null;
  city: string | null;
  state: string | null;
  source: string;
  notes: string | null;
  tags: string[];
  created_at: string;
  _count: { leads: number; bookings: number };
}

const SOURCES = ['whatsapp', 'phone', 'website', 'walk_in', 'instagram', 'facebook', 'google', 'referral'];

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    whatsapp: '',
    city: '',
    state: '',
    source: 'phone' as string,
    notes: '',
    tags: [] as string[],
  });

  useEffect(() => {
    fetchCustomers();
  }, [search]);

  const fetchCustomers = async () => {
    try {
      const params = search ? `?search=${encodeURIComponent(search)}` : '';
      const { data } = await api.get(`/customers${params}`);
      setCustomers(data);
    } catch (error) {
      toast.error('Failed to load customers');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setIsEditing(false);
    setCurrentId(null);
    setFormData({ name: '', email: '', phone: '', whatsapp: '', city: '', state: '', source: 'phone', notes: '', tags: [] });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: Customer) => {
    setIsEditing(true);
    setCurrentId(c.id);
    setFormData({
      name: c.name,
      email: c.email || '',
      phone: c.phone,
      whatsapp: c.whatsapp || '',
      city: c.city || '',
      state: c.state || '',
      source: c.source,
      notes: c.notes || '',
      tags: c.tags || [],
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = { ...formData };
      if (isEditing && currentId) {
        await api.patch(`/customers/${currentId}`, payload);
        toast.success('Customer updated');
      } else {
        await api.post('/customers', payload);
        toast.success('Customer created');
      }
      setIsModalOpen(false);
      fetchCustomers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save customer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'whatsapp': return '💬';
      case 'phone': return '📞';
      case 'website': return '🌐';
      case 'walk_in': return '🚶';
      case 'instagram': return '📸';
      case 'facebook': return '👍';
      case 'google': return '🔍';
      case 'referral': return '🤝';
      default: return '📋';
    }
  };

  return (
    <div className="w-full space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl p-6 rounded-3xl border border-white/50 dark:border-gray-700/50 shadow-sm relative overflow-hidden">
        <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Customers
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">
            {customers.length} total customers
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="relative z-10 bg-primary hover:bg-primary/90 text-white font-bold py-3 px-6 rounded-2xl shadow-lg shadow-primary/30 transition-all active:scale-95 flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Customer
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
        </svg>
        <input
          type="text"
          placeholder="Search by name, phone, email or city..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full h-14 pl-12 pr-4 rounded-2xl border border-white/60 dark:border-gray-700/60 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl text-gray-900 dark:text-white placeholder-gray-400 focus:border-primary focus:ring-0 outline-none shadow-md transition-colors"
        />
      </div>

      {/* Customers Table */}
      <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-2xl rounded-3xl border border-white/60 dark:border-gray-700/60 shadow-xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-4">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="h-16 bg-white/50 dark:bg-gray-700/50 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : customers.length === 0 ? (
          <div className="text-center py-20">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
            </svg>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">No customers yet</h3>
            <p className="text-gray-500 mt-1">Add your first customer to get started.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100/50 dark:divide-gray-700/50">
            {customers.map(customer => (
              <div key={customer.id} className="p-5 hover:bg-white/40 dark:hover:bg-gray-700/40 transition-colors flex items-center justify-between gap-4 group cursor-pointer" onClick={() => handleOpenEdit(customer)}>
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/10 shadow-sm shrink-0">
                    <span className="text-lg font-bold text-primary uppercase">{customer.name.substring(0, 2)}</span>
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors truncate">
                      {customer.name}
                    </h3>
                    <div className="flex items-center gap-3 mt-0.5 text-sm text-gray-500">
                      <span>{customer.phone}</span>
                      {customer.email && <span className="truncate hidden sm:inline">• {customer.email}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <span className="text-xl" title={customer.source}>{getSourceIcon(customer.source)}</span>
                  <div className="hidden md:flex items-center gap-3 text-xs font-bold">
                    <span className="px-2.5 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-lg">{customer._count.leads} leads</span>
                    <span className="px-2.5 py-1 bg-green-50 dark:bg-green-900/30 text-green-600 rounded-lg">{customer._count.bookings} bookings</span>
                  </div>
                  {customer.city && (
                    <span className="text-xs text-gray-400 hidden lg:inline">{customer.city}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white dark:bg-gray-800 w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                {isEditing ? 'Edit Customer' : 'Add Customer'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Full Name *</label>
                    <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full h-12 px-4 rounded-xl border-2 border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:border-primary focus:ring-0 outline-none transition-colors" placeholder="John Doe" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Phone *</label>
                    <input type="text" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full h-12 px-4 rounded-xl border-2 border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:border-primary focus:ring-0 outline-none transition-colors" placeholder="+91 9876543210" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Email</label>
                    <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full h-12 px-4 rounded-xl border-2 border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:border-primary focus:ring-0 outline-none transition-colors" placeholder="john@email.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">City</label>
                    <input type="text" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full h-12 px-4 rounded-xl border-2 border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:border-primary focus:ring-0 outline-none transition-colors" placeholder="Mumbai" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Source</label>
                    <select value={formData.source} onChange={e => setFormData({...formData, source: e.target.value})} className="w-full h-12 px-4 rounded-xl border-2 border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:border-primary focus:ring-0 outline-none transition-colors appearance-none">
                      {SOURCES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Notes</label>
                    <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:border-primary focus:ring-0 outline-none transition-colors resize-none" placeholder="Any additional notes..." rows={2} />
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 h-12 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="flex-1 h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/30 transition-all active:scale-95 disabled:opacity-70">
                    {isSubmitting ? 'Saving...' : 'Save Customer'}
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
