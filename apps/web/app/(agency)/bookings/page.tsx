"use client";

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

interface Booking {
  id: string;
  bookingNumber: string;
  customer: {
    id: string;
    name: string;
    phone: string;
  };
  destination: string;
  travelDate: string;
  status: string;
  totalAmount: number;
  amountPaid: number;
  balance: number;
  createdAt: string;
  adults: number;
  children: number;
  infants: number;
}

export default function BookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchBookings();
  }, [search, statusFilter]);

  const fetchBookings = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      
      const { data } = await api.get(`/bookings?${params.toString()}`);
      setBookings(data);
    } catch (error) {
      toast.error('Failed to load bookings');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'confirmed': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'documents_pending': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'visa_processing': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'ready': return 'bg-green-50 text-green-700 border-green-200';
      case 'travelling': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'completed': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'cancelled': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  if (isLoading) {
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
            Bookings
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">
            Manage confirmed trips and operations
          </p>
        </div>
        <button
          onClick={() => {
            toast('Bookings are generated from accepted Quotations', { icon: 'ℹ️' });
            router.push('/quotations');
          }}
          className="relative z-10 bg-primary hover:bg-primary/90 text-white font-bold py-3 px-6 rounded-2xl shadow-lg shadow-primary/30 transition-all active:scale-95 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Create from Quotation
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
            placeholder="Search booking number, customer, or destination..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full h-14 pl-12 pr-4 rounded-2xl border border-white/60 dark:border-gray-700/60 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl text-gray-900 dark:text-white placeholder-gray-400 focus:border-primary focus:ring-0 outline-none shadow-md transition-colors"
          />
        </div>
        <select 
          value={statusFilter} 
          onChange={e => setStatusFilter(e.target.value)}
          className="h-14 px-6 rounded-2xl border border-white/60 dark:border-gray-700/60 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl text-gray-900 dark:text-white font-bold outline-none shadow-md transition-colors focus:border-primary min-w-[200px]"
        >
          <option value="">All Statuses</option>
          <option value="confirmed">Confirmed</option>
          <option value="documents_pending">Documents Pending</option>
          <option value="visa_processing">Visa Processing</option>
          <option value="ready">Ready</option>
          <option value="travelling">Travelling</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Bookings List */}
      <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-3xl border border-white/50 dark:border-gray-700/50 shadow-2xl overflow-hidden">
        {bookings.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No bookings found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {search || statusFilter ? 'Try adjusting your filters' : 'Create your first booking to get started'}
            </p>
            {!search && !statusFilter && (
              <button
                onClick={() => {
                  toast('Bookings are generated from accepted Quotations', { icon: 'ℹ️' });
                  router.push('/quotations');
                }}
                className="bg-primary hover:bg-primary/90 text-white font-bold py-3 px-6 rounded-2xl shadow-lg transition-all"
              >
                Create from Quotation
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-4 px-6 font-bold text-gray-700 dark:text-gray-300 text-sm uppercase tracking-wider">Booking #</th>
                  <th className="text-left py-4 px-6 font-bold text-gray-700 dark:text-gray-300 text-sm uppercase tracking-wider">Customer</th>
                  <th className="text-left py-4 px-6 font-bold text-gray-700 dark:text-gray-300 text-sm uppercase tracking-wider">Destination</th>
                  <th className="text-left py-4 px-6 font-bold text-gray-700 dark:text-gray-300 text-sm uppercase tracking-wider">Travel Date</th>
                  <th className="text-left py-4 px-6 font-bold text-gray-700 dark:text-gray-300 text-sm uppercase tracking-wider">Passengers</th>
                  <th className="text-left py-4 px-6 font-bold text-gray-700 dark:text-gray-300 text-sm uppercase tracking-wider">Status</th>
                  <th className="text-right py-4 px-6 font-bold text-gray-700 dark:text-gray-300 text-sm uppercase tracking-wider">Amount</th>
                  <th className="text-right py-4 px-6 font-bold text-gray-700 dark:text-gray-300 text-sm uppercase tracking-wider">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {bookings.map((booking) => (
                  <tr 
                    key={booking.id}
                    onClick={() => router.push(`/bookings/${booking.id}`)}
                    className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 cursor-pointer transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div className="font-bold text-primary">{booking.bookingNumber}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {format(new Date(booking.createdAt), 'dd MMM yyyy')}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-semibold text-gray-900 dark:text-white">{booking.customer.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{booking.customer.phone}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-medium text-gray-900 dark:text-white">{booking.destination}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {format(new Date(booking.travelDate), 'dd MMM yyyy')}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-gray-700 dark:text-gray-300">
                        {booking.adults}A
                        {booking.children > 0 && `, ${booking.children}C`}
                        {booking.infants > 0 && `, ${booking.infants}I`}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(booking.status)}`}>
                        {getStatusLabel(booking.status)}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="font-bold text-gray-900 dark:text-white">
                        ₹{booking.totalAmount.toLocaleString('en-IN')}
                      </div>
                      <div className="text-xs text-green-600 dark:text-green-400">
                        Paid: ₹{booking.amountPaid.toLocaleString('en-IN')}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className={`font-bold ${booking.balance > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                        ₹{booking.balance.toLocaleString('en-IN')}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      {bookings.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl border border-white/50 dark:border-gray-700/50 p-6">
            <div className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Total Bookings</div>
            <div className="text-3xl font-extrabold text-gray-900 dark:text-white">{bookings.length}</div>
          </div>
          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl border border-white/50 dark:border-gray-700/50 p-6">
            <div className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Total Revenue</div>
            <div className="text-3xl font-extrabold text-gray-900 dark:text-white">
              ₹{bookings.reduce((sum, b) => sum + b.totalAmount, 0).toLocaleString('en-IN')}
            </div>
          </div>
          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl border border-white/50 dark:border-gray-700/50 p-6">
            <div className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Collected</div>
            <div className="text-3xl font-extrabold text-green-600 dark:text-green-400">
              ₹{bookings.reduce((sum, b) => sum + b.amountPaid, 0).toLocaleString('en-IN')}
            </div>
          </div>
          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl border border-white/50 dark:border-gray-700/50 p-6">
            <div className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Outstanding</div>
            <div className="text-3xl font-extrabold text-red-600 dark:text-red-400">
              ₹{bookings.reduce((sum, b) => sum + b.balance, 0).toLocaleString('en-IN')}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

