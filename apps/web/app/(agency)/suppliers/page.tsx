"use client";

import React, { useEffect, useState } from 'react';
import { suppliersApi } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { Supplier } from '@/types/supplier';

export default function SuppliersPage() {
  const router = useRouter();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [destinationFilter, setDestinationFilter] = useState('');
  const [serviceFilter, setServiceFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    fetchSuppliers();
  }, [destinationFilter, serviceFilter, activeFilter]);

  const fetchSuppliers = async () => {
    setIsLoading(true);
    try {
      const params: any = {};
      if (destinationFilter) params.destination = destinationFilter;
      if (serviceFilter) params.serviceType = serviceFilter;
      if (activeFilter === 'active') params.isActive = true;
      if (activeFilter === 'inactive') params.isActive = false;

      const data = await suppliersApi.getAll(params);
      setSuppliers(data);
    } catch (error) {
      toast.error('Failed to load suppliers');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && suppliers.length === 0) {
    return (
      <div className="w-full max-w-7xl mx-auto space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-3xl"></div>
          <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-3xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl p-6 rounded-3xl border border-white/50 dark:border-gray-700/50 shadow-sm relative overflow-hidden">
        <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Suppliers
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">
            Manage your vendor network and track outstanding payables
          </p>
        </div>
        <button
          onClick={() => router.push('/suppliers/new')}
          className="relative z-10 bg-primary hover:bg-primary/90 text-white font-bold py-3 px-6 rounded-2xl shadow-lg shadow-primary/30 transition-all active:scale-95 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New Supplier
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input
            type="text"
            placeholder="Search by destination..."
            value={destinationFilter}
            onChange={e => setDestinationFilter(e.target.value)}
            className="w-full h-14 pl-12 pr-4 rounded-2xl border border-white/60 dark:border-gray-700/60 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl text-gray-900 dark:text-white placeholder-gray-400 focus:border-primary focus:ring-0 outline-none shadow-md transition-colors"
          />
        </div>
        <select 
          value={serviceFilter} 
          onChange={e => setServiceFilter(e.target.value)}
          className="h-14 px-6 rounded-2xl border border-white/60 dark:border-gray-700/60 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl text-gray-900 dark:text-white font-bold outline-none shadow-md transition-colors focus:border-primary min-w-[150px]"
        >
          <option value="">All Services</option>
          <option value="flights">Flights</option>
          <option value="hotels">Hotels</option>
          <option value="transfers">Transfers</option>
          <option value="sightseeing">Sightseeing</option>
          <option value="activities">Activities</option>
          <option value="meals">Meals</option>
          <option value="visa">Visa</option>
          <option value="insurance">Insurance</option>
        </select>
        <select 
          value={activeFilter} 
          onChange={e => setActiveFilter(e.target.value)}
          className="h-14 px-6 rounded-2xl border border-white/60 dark:border-gray-700/60 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl text-gray-900 dark:text-white font-bold outline-none shadow-md transition-colors focus:border-primary min-w-[150px]"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active Only</option>
          <option value="inactive">Inactive Only</option>
        </select>
      </div>

      {/* Suppliers List */}
      <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-3xl border border-white/50 dark:border-gray-700/50 shadow-2xl overflow-hidden relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 z-10 flex items-center justify-center backdrop-blur-sm">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}
        
        {suppliers.length === 0 && !isLoading ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No suppliers found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {destinationFilter || serviceFilter || activeFilter !== 'all' ? 'Try adjusting your filters' : 'Add your first supplier to track payables'}
            </p>
            {!destinationFilter && !serviceFilter && activeFilter === 'all' && (
              <button
                onClick={() => router.push('/suppliers/new')}
                className="bg-primary hover:bg-primary/90 text-white font-bold py-3 px-6 rounded-2xl shadow-lg transition-all"
              >
                Add Supplier
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-4 px-6 font-bold text-gray-700 dark:text-gray-300 text-sm uppercase tracking-wider">Company</th>
                  <th className="text-left py-4 px-6 font-bold text-gray-700 dark:text-gray-300 text-sm uppercase tracking-wider">Contact</th>
                  <th className="text-left py-4 px-6 font-bold text-gray-700 dark:text-gray-300 text-sm uppercase tracking-wider">Destination</th>
                  <th className="text-left py-4 px-6 font-bold text-gray-700 dark:text-gray-300 text-sm uppercase tracking-wider">Services</th>
                  <th className="text-right py-4 px-6 font-bold text-gray-700 dark:text-gray-300 text-sm uppercase tracking-wider">Payable</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {suppliers.map((supplier) => (
                  <tr 
                    key={supplier.id}
                    onClick={() => router.push(`/suppliers/${supplier.id}`)}
                    className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 cursor-pointer transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${supplier.isActive ? 'bg-green-500' : 'bg-red-500'}`} title={supplier.isActive ? 'Active' : 'Inactive'}></div>
                        <div className="font-bold text-gray-900 dark:text-white">{supplier.companyName}</div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-medium text-gray-700 dark:text-gray-300">{supplier.contactPerson || '-'}</div>
                      {(supplier.phone || supplier.email) && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2 mt-1">
                          {supplier.phone && <span>{supplier.phone}</span>}
                          {supplier.phone && supplier.email && <span>•</span>}
                          {supplier.email && <span>{supplier.email}</span>}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-medium text-gray-900 dark:text-white">{supplier.destination || '-'}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-wrap gap-1">
                        {supplier.services && supplier.services.length > 0 ? (
                          supplier.services.slice(0, 3).map(service => (
                            <span key={service} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 capitalize">
                              {service}
                            </span>
                          ))
                        ) : '-'}
                        {supplier.services && supplier.services.length > 3 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                            +{supplier.services.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className={`font-bold ${(supplier.outstandingPayable || 0) > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                        ₹{(supplier.outstandingPayable || 0).toLocaleString('en-IN')}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
