"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { suppliersApi } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { Supplier } from '@/types/supplier';
import SupplierPaymentsTab from '@/components/suppliers/SupplierPaymentsTab';

export default function SupplierDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSupplier();
  }, [params.id]);

  const fetchSupplier = async () => {
    try {
      const data = await suppliersApi.getOne(params.id as string);
      setSupplier(data);
    } catch (error) {
      toast.error('Failed to load supplier details');
      router.push('/suppliers');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !supplier) {
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
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-20">
      
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl p-6 rounded-3xl border border-white/50 dark:border-gray-700/50 shadow-sm relative overflow-hidden">
        <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10">
          <button 
            onClick={() => router.push('/suppliers')} 
            className="text-primary text-sm font-bold flex items-center gap-1 mb-2 hover:underline"
          >
            ← Back to Suppliers
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
              {supplier.companyName}
            </h1>
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
              supplier.isActive 
                ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' 
                : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800'
            }`}>
              {supplier.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Added on {format(new Date(supplier.createdAt), 'dd MMM yyyy')}
          </p>
        </div>
        
        <div className="flex gap-3 relative z-10">
          <button
            onClick={() => router.push(`/suppliers/${supplier.id}/edit`)}
            className="px-6 py-3 rounded-2xl font-bold bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Edit Profile
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl p-6 rounded-3xl border border-white/50 dark:border-gray-700/50 shadow-md">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase">Destination</p>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{supplier.destination || 'Not Specified'}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl p-6 rounded-3xl border border-white/50 dark:border-gray-700/50 shadow-md">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center text-orange-600 dark:text-orange-400">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase">Rating</p>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {supplier.rating ? `${supplier.rating} / 5` : 'Not Rated'}
              </h3>
            </div>
          </div>
        </div>

        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl p-6 rounded-3xl border border-white/50 dark:border-gray-700/50 shadow-md">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center text-red-600 dark:text-red-400">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase">Outstanding Payable</p>
              <h3 className={`text-2xl font-extrabold ${(supplier.outstandingPayable || 0) > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                ₹{(supplier.outstandingPayable || 0).toLocaleString('en-IN')}
              </h3>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact Information */}
        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl p-8 rounded-3xl border border-white/50 dark:border-gray-700/50 shadow-xl">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2 border-b border-gray-200 dark:border-gray-700 pb-4">
            <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Contact Details
          </h3>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="w-1/3 text-sm font-bold text-gray-500 dark:text-gray-400">Contact Person</div>
              <div className="w-2/3 font-medium text-gray-900 dark:text-white">{supplier.contactPerson || '-'}</div>
            </div>
            <div className="flex gap-4">
              <div className="w-1/3 text-sm font-bold text-gray-500 dark:text-gray-400">Email Address</div>
              <div className="w-2/3 font-medium text-gray-900 dark:text-white break-all">
                {supplier.email ? (
                  <a href={`mailto:${supplier.email}`} className="text-primary hover:underline">{supplier.email}</a>
                ) : '-'}
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-1/3 text-sm font-bold text-gray-500 dark:text-gray-400">Phone Number</div>
              <div className="w-2/3 font-medium text-gray-900 dark:text-white">
                {supplier.phone ? (
                  <a href={`tel:${supplier.phone}`} className="text-primary hover:underline">{supplier.phone}</a>
                ) : '-'}
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-1/3 text-sm font-bold text-gray-500 dark:text-gray-400">WhatsApp</div>
              <div className="w-2/3 font-medium text-gray-900 dark:text-white">
                {supplier.whatsapp ? (
                  <a href={`https://wa.me/${supplier.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
                    {supplier.whatsapp}
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                ) : '-'}
              </div>
            </div>
          </div>
        </div>

        {/* Services and Terms */}
        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl p-8 rounded-3xl border border-white/50 dark:border-gray-700/50 shadow-xl flex flex-col">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2 border-b border-gray-200 dark:border-gray-700 pb-4">
            <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Services & Terms
          </h3>
          <div className="space-y-6 flex-1">
            <div>
              <div className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-2">Services Provided</div>
              <div className="flex flex-wrap gap-2">
                {supplier.services && supplier.services.length > 0 ? (
                  supplier.services.map(service => (
                    <span key={service} className="px-3 py-1 rounded-lg text-xs font-bold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 capitalize border border-gray-200 dark:border-gray-600">
                      {service}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500 dark:text-gray-400 italic">No services listed</span>
                )}
              </div>
            </div>
            
            <div>
              <div className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-1">Payment Terms</div>
              <div className="font-medium text-gray-900 dark:text-white p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-800">
                {supplier.paymentTerms || 'Standard Terms'}
              </div>
            </div>
            
            {supplier.notes && (
              <div>
                <div className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-1">Internal Notes</div>
                <div className="font-medium text-gray-700 dark:text-gray-300 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-100 dark:border-yellow-900/50 whitespace-pre-wrap text-sm">
                  {supplier.notes}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Supplier Payments Section */}
      <div className="mt-8">
        <SupplierPaymentsTab 
          supplierId={supplier.id} 
          onUpdate={fetchSupplier} 
        />
      </div>
    </div>
  );
}
