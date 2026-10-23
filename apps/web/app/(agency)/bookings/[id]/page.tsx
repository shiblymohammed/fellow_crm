"use client";

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import TravellersTab from '@/components/bookings/TravellersTab';
import DocumentsTab from '@/components/bookings/DocumentsTab';
import VisaTab from '@/components/bookings/VisaTab';
import SupplierBookingsTab from '@/components/bookings/SupplierBookingsTab';
import PaymentsTab from '@/components/bookings/PaymentsTab';
import ExpensesTab from '@/components/bookings/ExpensesTab';
import ItineraryBuilder from '@/components/bookings/ItineraryBuilder';

type TabType = 'overview' | 'travellers' | 'documents' | 'visa' | 'payments' | 'expenses' | 'itinerary' | 'suppliers';

export default function BookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [booking, setBooking] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  useEffect(() => {
    fetchBooking();
  }, [params.id]);

  const fetchBooking = async () => {
    try {
      const { data } = await api.get(`/bookings/${params.id}`);
      setBooking(data);
    } catch (error) {
      toast.error('Failed to load booking');
      router.push('/bookings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (status: string) => {
    try {
      await api.patch(`/bookings/${params.id}`, { status });
      toast.success(`Booking status updated to ${status}`);
      fetchBooking();
    } catch (error) {
      toast.error('Failed to update status');
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

  if (isLoading || !booking) {
    return <div className="p-8 animate-pulse text-center">Loading booking...</div>;
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-20">
      
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl p-6 rounded-3xl border border-white/50 dark:border-gray-700/50 shadow-sm">
        <div>
          <button 
            onClick={() => router.push('/bookings')} 
            className="text-primary text-sm font-bold flex items-center gap-1 mb-2 hover:underline"
          >
            ← Back to Bookings
          </button>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
            {booking.bookingNumber}
          </h1>
          <p className="text-gray-500 mt-1">Created on {format(new Date(booking.createdAt), 'dd MMM yyyy')}</p>
        </div>
        
        <div className="flex gap-2 flex-wrap">
          <select 
            value={booking.status} 
            onChange={e => handleStatusChange(e.target.value)}
            className="h-12 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 font-bold outline-none"
          >
            <option value="confirmed">Confirmed</option>
            <option value="documents_pending">Documents Pending</option>
            <option value="visa_processing">Visa Processing</option>
            <option value="ready">Ready</option>
            <option value="travelling">Travelling</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-3xl border border-white/50 dark:border-gray-700/50 shadow-md overflow-hidden">
        <div className="flex overflow-x-auto border-b border-gray-200 dark:border-gray-700">
          {[
            { id: 'overview', label: 'Overview', icon: '📋' },
            { id: 'travellers', label: 'Travellers', icon: '👥', count: booking.travellers?.length },
            { id: 'documents', label: 'Documents', icon: '📄' },
            { id: 'visa', label: 'Visa', icon: '🛂', count: booking.visaApplications?.length },
            { id: 'payments', label: 'Payments', icon: '💰', count: booking.payments?.length },
            { id: 'expenses', label: 'Expenses', icon: '🧾' },
            { id: 'itinerary', label: 'Itinerary', icon: '🗺️' },
            { id: 'suppliers', label: 'Suppliers', icon: '🏢', count: booking.supplierBookings?.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 px-6 py-4 font-bold whitespace-nowrap transition-colors relative ${
                activeTab === tab.id
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span className="ml-1 px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-bold">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6 sm:p-8">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Customer Info */}
                <div className="bg-white/60 dark:bg-gray-900/60 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Customer Information</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{booking.customer.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{booking.customer.phone}</p>
                    </div>
                    {booking.customer.email && (
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{booking.customer.email}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Trip Details */}
                <div className="bg-white/60 dark:bg-gray-900/60 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Trip Details</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Destination</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{booking.destination}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Travel Dates</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {format(new Date(booking.travelDate), 'dd MMM yyyy')}
                        {booking.returnDate && ` - ${format(new Date(booking.returnDate), 'dd MMM yyyy')}`}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Passengers</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {booking.adults} Adults
                        {booking.children > 0 && `, ${booking.children} Children`}
                        {booking.infants > 0 && `, ${booking.infants} Infants`}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="bg-white/60 dark:bg-gray-900/60 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 md:col-span-2">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Financial Summary</h3>
                  <div className="grid grid-cols-3 gap-6">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Amount</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        ₹{booking.totalAmount.toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Amount Paid</p>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        ₹{booking.amountPaid.toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Balance Due</p>
                      <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                        ₹{booking.balance.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {booking.notes && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-2xl p-6 border border-yellow-200 dark:border-yellow-800">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Notes</h3>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{booking.notes}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'travellers' && (
            <TravellersTab 
              bookingId={booking.id} 
              travellers={booking.travellers || []} 
              onUpdate={fetchBooking}
            />
          )}

          {activeTab === 'documents' && (
            <DocumentsTab
              bookingId={booking.id}
              travellers={booking.travellers || []}
              onUpdate={fetchBooking}
            />
          )}

          {activeTab === 'visa' && (
            <VisaTab
              bookingId={booking.id}
              travellers={booking.travellers || []}
              destination={booking.destination}
              onUpdate={fetchBooking}
            />
          )}

          {activeTab === 'payments' && (
            <PaymentsTab
              bookingId={booking.id}
              customerId={booking.customer.id}
              onUpdate={fetchBooking}
            />
          )}

          {activeTab === 'expenses' && (
            <ExpensesTab bookingId={booking.id} />
          )}

          {activeTab === 'itinerary' && (
            <ItineraryBuilder bookingId={booking.id} />
          )}

          {activeTab === 'suppliers' && (
            <SupplierBookingsTab
              bookingId={booking.id}
              onUpdate={fetchBooking}
            />
          )}
        </div>
      </div>
    </div>
  );
}
