"use client";

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

interface Quotation {
  id: string;
  quotationNumber: string;
  customer: {
    id: string;
    name: string;
    phone: string;
  };
  destination: string;
  status: string;
  totalSupplierCost: number;
  totalCustomerPrice: number;
  grossProfit: number;
  createdAt: string;
}

export default function QuotationsPage() {
  const router = useRouter();
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchQuotations();
  }, [search, statusFilter]);

  const fetchQuotations = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      
      const { data } = await api.get(`/quotations?${params.toString()}`);
      setQuotations(data);
    } catch (error) {
      toast.error('Failed to load quotations');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'draft': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'sent': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'accepted': return 'bg-green-50 text-green-700 border-green-200';
      case 'rejected': return 'bg-red-50 text-red-700 border-red-200';
      case 'expired': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="w-full space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl p-6 rounded-3xl border border-white/50 dark:border-gray-700/50 shadow-sm relative overflow-hidden">
        <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Quotations
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">
            Manage proposals and pricing for leads
          </p>
        </div>
        <button
          onClick={() => router.push('/quotations/new')}
          className="relative z-10 bg-primary hover:bg-primary/90 text-white font-bold py-3 px-6 rounded-2xl shadow-lg shadow-primary/30 transition-all active:scale-95 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New Quotation
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
            placeholder="Search QT number, customer, or destination..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full h-14 pl-12 pr-4 rounded-2xl border border-white/60 dark:border-gray-700/60 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl text-gray-900 dark:text-white placeholder-gray-400 focus:border-primary focus:ring-0 outline-none shadow-md transition-colors"
          />
        </div>
        <select 
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="h-14 px-4 rounded-2xl border border-white/60 dark:border-gray-700/60 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl text-gray-900 dark:text-white focus:border-primary outline-none shadow-md"
        >
          <option value="">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="sent">Sent</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      {/* List */}
      <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl rounded-3xl border border-white/50 dark:border-gray-700/50 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700/50">
                <th className="p-4 font-bold text-gray-500 uppercase text-xs tracking-wider">Quote #</th>
                <th className="p-4 font-bold text-gray-500 uppercase text-xs tracking-wider">Customer</th>
                <th className="p-4 font-bold text-gray-500 uppercase text-xs tracking-wider">Destination</th>
                <th className="p-4 font-bold text-gray-500 uppercase text-xs tracking-wider">Price</th>
                <th className="p-4 font-bold text-gray-500 uppercase text-xs tracking-wider">Profit</th>
                <th className="p-4 font-bold text-gray-500 uppercase text-xs tracking-wider">Status</th>
                <th className="p-4 font-bold text-gray-500 uppercase text-xs tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
              {isLoading ? (
                <tr><td colSpan={7} className="p-8 text-center text-gray-500">Loading...</td></tr>
              ) : quotations.length === 0 ? (
                <tr><td colSpan={7} className="p-12 text-center text-gray-500 font-medium">No quotations found.</td></tr>
              ) : (
                quotations.map(qt => (
                  <tr 
                    key={qt.id} 
                    onClick={() => router.push(`/quotations/${qt.id}`)}
                    className="hover:bg-white/60 dark:hover:bg-gray-700/30 transition-colors cursor-pointer group"
                  >
                    <td className="p-4 font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                      {qt.quotationNumber}
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-gray-900 dark:text-white">{qt.customer?.name}</p>
                      <p className="text-xs text-gray-500">{qt.customer?.phone}</p>
                    </td>
                    <td className="p-4 text-gray-600 dark:text-gray-300 font-medium">{qt.destination || '-'}</td>
                    <td className="p-4 font-extrabold text-gray-900 dark:text-white">
                      ₹{qt.totalCustomerPrice.toLocaleString()}
                    </td>
                    <td className="p-4 font-extrabold text-green-600">
                      ₹{qt.grossProfit.toLocaleString()}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider border ${getStatusColor(qt.status)}`}>
                        {qt.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-500 font-medium">
                      {format(new Date(qt.createdAt), 'dd MMM, yyyy')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
