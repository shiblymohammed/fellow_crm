"use client";

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface Package {
  id: string;
  name: string;
  destination: string;
  duration_days: number;
  duration_nights: number;
  is_active: boolean;
  _count: {
    packageItems: number;
    quotations: number;
    bookings: number;
  };
}

export default function PackagesPage() {
  const router = useRouter();
  const [packages, setPackages] = useState<Package[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Create Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    destination: '',
    durationDays: 1,
    durationNights: 0,
    description: '',
  });

  useEffect(() => {
    fetchPackages();
  }, [search]);

  const fetchPackages = async () => {
    try {
      const params = search ? `?search=${encodeURIComponent(search)}` : '';
      const { data } = await api.get(`/packages${params}`);
      setPackages(data);
    } catch (error) {
      toast.error('Failed to load packages');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { data } = await api.post('/packages', {
        ...formData,
        items: [], // Start with empty items
      });
      toast.success('Package created!');
      router.push(`/packages/${data.id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create package');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl p-6 rounded-3xl border border-white/50 dark:border-gray-700/50 shadow-sm relative overflow-hidden">
        <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Tour Packages
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">
            {packages.length} reusable itinerary templates
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="relative z-10 bg-primary hover:bg-primary/90 text-white font-bold py-3 px-6 rounded-2xl shadow-lg shadow-primary/30 transition-all active:scale-95 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Build Package
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
        </svg>
        <input
          type="text"
          placeholder="Search by package name or destination..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full h-14 pl-12 pr-4 rounded-2xl border border-white/60 dark:border-gray-700/60 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl text-gray-900 dark:text-white placeholder-gray-400 focus:border-primary focus:ring-0 outline-none shadow-md transition-colors"
        />
      </div>

      {/* Packages Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-48 bg-white/50 dark:bg-gray-800/50 rounded-3xl animate-pulse"></div>)}
        </div>
      ) : packages.length === 0 ? (
        <div className="text-center py-20 bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl rounded-3xl border border-white/50 dark:border-gray-700/50">
          <span className="text-6xl mb-4 block">🏝️</span>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">No packages yet</h3>
          <p className="text-gray-500 mt-2">Build your first reusable tour package template.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map(pkg => (
            <div 
              key={pkg.id} 
              onClick={() => router.push(`/packages/${pkg.id}`)}
              className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-2xl p-6 rounded-3xl border border-white/60 dark:border-gray-700/60 shadow-xl hover:shadow-2xl hover:border-primary/50 transition-all cursor-pointer group flex flex-col"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary font-bold shadow-sm border border-primary/10 group-hover:scale-110 transition-transform">
                  📦
                </div>
                {!pkg.is_active && (
                  <span className="px-2.5 py-1 bg-red-50 text-red-600 rounded-lg text-xs font-bold uppercase tracking-wider">Inactive</span>
                )}
              </div>
              
              <h3 className="text-lg font-extrabold text-gray-900 dark:text-white mb-1 group-hover:text-primary transition-colors">
                {pkg.name}
              </h3>
              <p className="text-sm font-medium text-gray-500 flex items-center gap-1.5 mb-6">
                <span>📍 {pkg.destination}</span>
                <span>•</span>
                <span>{pkg.duration_nights}N / {pkg.duration_days}D</span>
              </p>

              <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700/50 grid grid-cols-3 gap-2 text-center divide-x divide-gray-100 dark:divide-gray-700">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase">Items</p>
                  <p className="text-base font-extrabold text-gray-900 dark:text-white">{pkg._count.packageItems}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase">Quotes</p>
                  <p className="text-base font-extrabold text-gray-900 dark:text-white">{pkg._count.quotations}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase">Booked</p>
                  <p className="text-base font-extrabold text-gray-900 dark:text-white">{pkg._count.bookings}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white dark:bg-gray-800 w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">New Package Template</h2>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Package Name *</label>
                  <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Exotic Bali 5N/6D" className="w-full h-12 px-4 rounded-xl border-2 border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:border-primary focus:ring-0 outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Destination *</label>
                  <input type="text" required value={formData.destination} onChange={e => setFormData({...formData, destination: e.target.value})} placeholder="e.g. Bali, Indonesia" className="w-full h-12 px-4 rounded-xl border-2 border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:border-primary focus:ring-0 outline-none transition-colors" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Days *</label>
                    <input type="number" min="1" required value={formData.durationDays} onChange={e => setFormData({...formData, durationDays: parseInt(e.target.value)})} className="w-full h-12 px-4 rounded-xl border-2 border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:border-primary focus:ring-0 outline-none transition-colors" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Nights *</label>
                    <input type="number" min="0" required value={formData.durationNights} onChange={e => setFormData({...formData, durationNights: parseInt(e.target.value)})} className="w-full h-12 px-4 rounded-xl border-2 border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:border-primary focus:ring-0 outline-none transition-colors" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Brief Description</label>
                  <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="A quick summary of this package..." className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:border-primary focus:ring-0 outline-none transition-colors resize-none" rows={3} />
                </div>
                
                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 h-12 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="flex-1 h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/30 transition-all active:scale-95 disabled:opacity-70">
                    {isSubmitting ? 'Creating...' : 'Start Building'}
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
