"use client";

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';

export default function QuotationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [quotation, setQuotation] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchQuotation();
  }, [params.id]);

  const fetchQuotation = async () => {
    try {
      const { data } = await api.get(`/quotations/${params.id}`);
      setQuotation(data);
    } catch (error) {
      toast.error('Failed to load quotation');
      router.push('/quotations');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (status: string) => {
    try {
      await api.patch(`/quotations/${params.id}`, { status });
      toast.success(`Quotation marked as ${status}`);
      fetchQuotation();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleGeneratePdf = async () => {
    try {
      toast.loading('Generating PDF...', { id: 'pdf' });
      const { data } = await api.post(`/quotations/${params.id}/generate-pdf`);
      toast.success('PDF generated successfully!', { id: 'pdf' });
      fetchQuotation(); // Refresh to get the new pdfUrl
    } catch (error) {
      toast.error('Failed to generate PDF', { id: 'pdf' });
    }
  };

  const handleDownloadPdf = async () => {
    try {
      if (!quotation.pdfUrl) {
        // If no PDF exists yet, generate it first
        await handleGeneratePdf();
        return;
      }
      
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const fullUrl = quotation.pdfUrl.startsWith('http') 
        ? quotation.pdfUrl 
        : `${baseUrl}${quotation.pdfUrl}`;
      window.open(fullUrl, '_blank');
      toast.success('Opening PDF...');
    } catch (error) {
      toast.error('Failed to download PDF');
    }
  };

  const handleViewPdf = () => {
    const baseUrl = process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3000';
    window.open(`${baseUrl}/portal/quotations/${params.id}/pdf`, '_blank');
  };

  const handleConvertToBooking = async () => {
    try {
      if (quotation.status !== 'accepted') {
        toast.error('Only accepted quotations can be converted to bookings');
        return;
      }

      toast.loading('Converting to booking...', { id: 'convert' });
      const { data } = await api.post(`/bookings/from-quotation/${params.id}`);
      toast.success('Booking created successfully!', { id: 'convert' });
      router.push(`/bookings/${data.id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to convert to booking', { id: 'convert' });
    }
  };

  if (isLoading || !quotation) return <div className="p-8 animate-pulse text-center">Loading quotation...</div>;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-20">
      
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl p-6 rounded-3xl border border-white/50 dark:border-gray-700/50 shadow-sm">
        <div>
          <button onClick={() => router.push('/quotations')} className="text-primary text-sm font-bold flex items-center gap-1 mb-2 hover:underline">
            ← Back to Quotations
          </button>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
            {quotation.quotationNumber}
          </h1>
          <p className="text-gray-500 mt-1">Created on {format(new Date(quotation.createdAt), 'dd MMM yyyy')}</p>
        </div>
        
        <div className="flex gap-2 flex-wrap">
          <select 
            value={quotation.status} 
            onChange={e => handleStatusChange(e.target.value)}
            className="h-12 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 font-bold outline-none"
          >
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
            <option value="expired">Expired</option>
          </select>
          {quotation.status === 'accepted' && (
            <button 
              onClick={handleConvertToBooking} 
              className="h-12 px-6 bg-primary text-white font-bold rounded-xl shadow-md hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Convert to Booking
            </button>
          )}
          <button 
            onClick={handleViewPdf} 
            className="h-12 px-6 bg-blue-600 text-white font-bold rounded-xl shadow-md hover:bg-blue-700 transition-colors"
            title="Preview quotation in browser"
          >
            Preview
          </button>
          {quotation.pdfUrl ? (
            <>
              <button 
                onClick={handleDownloadPdf} 
                className="h-12 px-6 bg-green-600 text-white font-bold rounded-xl shadow-md hover:bg-green-700 transition-colors"
              >
                Download PDF
              </button>
              <button 
                onClick={handleGeneratePdf} 
                className="h-12 px-6 bg-gray-600 text-white font-bold rounded-xl shadow-md hover:bg-gray-700 transition-colors"
                title="Regenerate PDF"
              >
                Regenerate
              </button>
            </>
          ) : (
            <button 
              onClick={handleGeneratePdf} 
              className="h-12 px-6 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-xl shadow-md hover:scale-95 transition-transform"
            >
              Generate PDF
            </button>
          )}
        </div>
      </div>

      {/* Main Preview Document */}
      <div className="bg-white dark:bg-gray-900 rounded-[2rem] p-8 sm:p-12 shadow-2xl border border-gray-100 dark:border-gray-800 relative overflow-hidden">
        
        {/* Header / Brand */}
        <div className="flex justify-between items-start border-b-2 border-gray-100 dark:border-gray-800 pb-8 mb-8">
          <div>
            <h2 className="text-4xl font-extrabold text-primary tracking-tighter">PROPOSAL</h2>
            <p className="text-gray-500 font-medium mt-2">{quotation.quotationNumber}</p>
          </div>
          <div className="text-right">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Prepared For:</h3>
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300">{quotation.customer.name}</p>
            <p className="text-gray-500">{quotation.customer.phone}</p>
            {quotation.customer.email && <p className="text-gray-500">{quotation.customer.email}</p>}
          </div>
        </div>

        {/* Trip Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl mb-8">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Destination</p>
            <p className="font-bold text-gray-900 dark:text-white">{quotation.destination || 'Not Specified'}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Travel Dates</p>
            <p className="font-bold text-gray-900 dark:text-white">
              {quotation.travelDate ? format(new Date(quotation.travelDate), 'dd MMM') : '?'} - 
              {quotation.returnDate ? format(new Date(quotation.returnDate), 'dd MMM yyyy') : '?'}
            </p>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Passengers</p>
            <p className="font-bold text-gray-900 dark:text-white">
              {quotation.adults} Adults
              {quotation.children > 0 && `, ${quotation.children} Child`}
              {quotation.infants > 0 && `, ${quotation.infants} Infant`}
            </p>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Valid Until</p>
            <p className="font-bold text-red-500">
              {quotation.validUntil ? format(new Date(quotation.validUntil), 'dd MMM yyyy') : 'Subject to availability'}
            </p>
          </div>
        </div>

        {/* Itinerary */}
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Proposed Itinerary</h3>
        <div className="space-y-4 mb-12">
          {quotation.quotationItems.map((item: any) => (
            <div key={item.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 border-b border-gray-100 dark:border-gray-800 last:border-0">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="px-2.5 py-1 bg-primary/10 text-primary text-xs font-bold uppercase rounded-md tracking-wider">
                    {item.category}
                  </span>
                  <p className="font-bold text-gray-900 dark:text-white text-lg">{item.name}</p>
                </div>
                {item.description && <p className="text-gray-500 text-sm mt-1">{item.description}</p>}
              </div>
              <div className="mt-4 sm:mt-0 text-right">
                <p className="text-xl font-extrabold text-gray-900 dark:text-white">
                  ₹{item.customerPrice.toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Total Price */}
        <div className="flex justify-end">
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6 min-w-[300px]">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-500 font-medium">Total Price</span>
              <span className="text-gray-900 dark:text-white font-bold text-xl">₹{quotation.totalCustomerPrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center pb-4 border-b border-gray-200 dark:border-gray-700">
              <span className="text-gray-500 font-medium">Taxes (if applicable)</span>
              <span className="text-gray-500 font-medium">Included</span>
            </div>
            <div className="flex justify-between items-center mt-4">
              <span className="text-gray-900 dark:text-white font-extrabold text-xl">Grand Total</span>
              <span className="text-primary font-extrabold text-3xl">₹{quotation.totalCustomerPrice.toLocaleString()}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
