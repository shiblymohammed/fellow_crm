"use client";

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { useParams, useRouter } from 'next/navigation';

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const customerId = params.id as string;

  const [customer, setCustomer] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (customerId) {
      fetchCustomerData();
    }
  }, [customerId]);

  const fetchCustomerData = async () => {
    try {
      const { data } = await api.get(`/customers/${customerId}`);
      setCustomer(data);
    } catch (error) {
      toast.error('Failed to load customer details');
      router.push('/customers');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div></div>;
  }

  if (!customer) return null;

  return (
    <div className="w-full space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header Profile Card */}
      <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-2xl p-8 rounded-3xl border border-white/60 dark:border-gray-700/60 shadow-xl relative overflow-hidden flex flex-col md:flex-row gap-8 items-start md:items-center">
        <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="shrink-0 relative z-10">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-4xl font-extrabold text-primary shadow-sm border border-primary/10">
            {customer.name?.substring(0, 2).toUpperCase()}
          </div>
        </div>

        <div className="flex-1 relative z-10">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">{customer.name}</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-gray-600 dark:text-gray-300">
            <span className="flex items-center gap-1.5"><span className="text-lg">📞</span> {customer.phone}</span>
            {customer.email && <span className="flex items-center gap-1.5"><span className="text-lg">✉️</span> {customer.email}</span>}
            {customer.whatsapp && <span className="flex items-center gap-1.5"><span className="text-lg">💬</span> {customer.whatsapp}</span>}
            {customer.city && <span className="flex items-center gap-1.5"><span className="text-lg">📍</span> {customer.city}{customer.state ? `, ${customer.state}` : ''}</span>}
          </div>
          <div className="mt-4 flex gap-2">
             {customer.tags?.map((tag: string, i: number) => (
                <span key={i} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg text-xs font-bold text-gray-600 dark:text-gray-300">#{tag}</span>
             ))}
          </div>
        </div>

        <div className="shrink-0 w-full md:w-auto relative z-10 border-t md:border-t-0 md:border-l border-gray-100 dark:border-gray-700/50 pt-6 md:pt-0 md:pl-8 flex gap-4 md:flex-col">
           <div className="text-center md:text-left">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Leads</p>
              <p className="text-2xl font-extrabold text-gray-900 dark:text-white">{customer._count.leads}</p>
           </div>
           <div className="text-center md:text-left">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Bookings</p>
              <p className="text-2xl font-extrabold text-gray-900 dark:text-white">{customer._count.bookings}</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Linked Leads */}
        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-2xl p-6 rounded-3xl border border-white/60 dark:border-gray-700/60 shadow-xl">
          <div className="flex justify-between items-center mb-6">
             <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recent Inquiries (Leads)</h3>
          </div>
          <div className="space-y-3">
             {customer.leads?.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">No leads found for this customer.</p>
             ) : (
                customer.leads?.map((lead: any) => (
                   <div key={lead.id} onClick={() => router.push(`/leads/${lead.id}`)} className="p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:border-primary/50 cursor-pointer transition-colors group">
                      <div className="flex justify-between items-start mb-2">
                         <h4 className="font-bold text-sm text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                            {lead.destination || 'Unspecified Destination'}
                         </h4>
                         <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-500">
                            {lead.status.replace('_', ' ')}
                         </span>
                      </div>
                      <p className="text-xs text-gray-500 mb-2">
                         {lead.travelDate ? `Travel Date: ${format(new Date(lead.travelDate), 'MMM d, yyyy')}` : 'Dates flexible'}
                      </p>
                      <p className="text-[10px] text-gray-400">Created {format(new Date(lead.createdAt), 'MMM d, yyyy')}</p>
                   </div>
                ))
             )}
          </div>
        </div>

        {/* Linked Bookings / Travel History */}
        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-2xl p-6 rounded-3xl border border-white/60 dark:border-gray-700/60 shadow-xl">
          <div className="flex justify-between items-center mb-6">
             <h3 className="text-lg font-bold text-gray-900 dark:text-white">Travel History (Bookings)</h3>
          </div>
          <div className="space-y-3">
             {customer.bookings?.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">No bookings found for this customer.</p>
             ) : (
                customer.bookings?.map((booking: any) => (
                   <div key={booking.id} className="p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm transition-colors">
                      <div className="flex justify-between items-start mb-2">
                         <h4 className="font-bold text-sm text-gray-900 dark:text-white">
                            {booking.destination}
                         </h4>
                         <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-green-50 text-green-700 border border-green-200">
                            {booking.status.replace('_', ' ')}
                         </span>
                      </div>
                      <p className="text-xs text-gray-500 mb-2">
                         {booking.travelDate ? `Travel: ${format(new Date(booking.travelDate), 'MMM d, yyyy')}` : ''}
                      </p>
                      <p className="text-[10px] text-gray-400">Booking Ref: {booking.bookingNumber}</p>
                   </div>
                ))
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
