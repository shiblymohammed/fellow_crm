'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { Lock, Phone, ArrowRight, ShieldCheck, FileText, CreditCard, MessageCircle, FileDown, Plane } from 'lucide-react';
import { format } from 'date-fns';

interface PortalClientProps {
  slug: string;
  tenant: any;
  tripTitle: string;
}

export default function PortalClient({ slug, tenant, tripTitle }: PortalClientProps) {
  const [step, setStep] = useState<'phone' | 'otp' | 'dashboard'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState<any>(null);

  const primaryColor = tenant?.primaryColor || '#0ea5e9';

  useEffect(() => {
    // Check if we already have a valid token
    const token = localStorage.getItem(`portal_token_${slug}`);
    if (token) {
      fetchDashboard(token);
    }
  }, [slug]);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // In a real app we'd call the public API endpoint
      // We can use native fetch since our `api` axios instance might attach admin JWTs
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/public/portal/otp/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicSlug: slug, phone })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to request OTP');
      
      toast.success(data.message || 'OTP sent via WhatsApp');
      setStep('otp');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/public/portal/otp/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicSlug: slug, phone, otp })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to verify OTP');
      
      const token = data.token;
      localStorage.setItem(`portal_token_${slug}`, token);
      await fetchDashboard(token);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboard = async (token: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/public/portal/dashboard/${slug}`, {
        headers: { 'x-portal-token': token }
      });
      
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem(`portal_token_${slug}`);
          setStep('phone');
        }
        throw new Error(data.message || 'Failed to load dashboard');
      }
      
      setDashboardData(data);
      setStep('dashboard');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(`portal_token_${slug}`);
    setStep('phone');
    setPhone('');
    setOtp('');
  };

  // Header component for all views
  const Header = () => (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {tenant?.logoUrl ? (
            <img src={tenant.logoUrl} alt={tenant.name} className="h-8 w-auto rounded" />
          ) : (
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: primaryColor }}
            >
              {tenant?.name?.charAt(0) || 'C'}
            </div>
          )}
          <span className="font-semibold text-gray-900 hidden sm:block">
            {tenant?.name || 'Customer Portal'}
          </span>
        </div>
        
        {step === 'dashboard' && (
          <button 
            onClick={handleLogout}
            className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
          >
            Logout
          </button>
        )}
      </div>
    </header>
  );

  if (step === 'phone') {
    return (
      <div className="min-h-screen bg-gray-50/50 flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-sm border border-gray-200 p-8">
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-6" style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}>
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Secure Access</h1>
            <p className="text-gray-500 mb-8">Enter your registered WhatsApp number to view your trip details for <strong className="text-gray-900">{tripTitle}</strong>.</p>
            
            <form onSubmit={handleRequestOtp} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Phone className="w-5 h-5" />
                  </div>
                  <input 
                    type="tel"
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="pl-10 w-full rounded-xl border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 py-3"
                    placeholder="+1234567890"
                  />
                </div>
              </div>
              
              <button
                type="submit"
                disabled={loading || !phone}
                className="w-full text-white font-bold py-3 px-4 rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                style={{ backgroundColor: primaryColor }}
              >
                {loading ? 'Sending...' : 'Send OTP via WhatsApp'}
                {!loading && <ArrowRight className="w-5 h-5" />}
              </button>
            </form>
          </div>
        </main>
      </div>
    );
  }

  if (step === 'otp') {
    return (
      <div className="min-h-screen bg-gray-50/50 flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-sm border border-gray-200 p-8">
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-6" style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}>
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Verify it's you</h1>
            <p className="text-gray-500 mb-8">We've sent a 6-digit code to <strong className="text-gray-900">{phone}</strong> via WhatsApp.</p>
            
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">6-Digit Code</label>
                <input 
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="w-full rounded-xl border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 py-3 text-center text-2xl font-bold tracking-[0.5em]"
                  placeholder="------"
                />
              </div>
              
              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full text-white font-bold py-3 px-4 rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                style={{ backgroundColor: primaryColor }}
              >
                {loading ? 'Verifying...' : 'Verify & Login'}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setStep('phone')}
                  className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                >
                  Change phone number
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    );
  }

  if (step === 'dashboard' && dashboardData) {
    const { booking, customer, visaApplications, payments, itineraryId } = dashboardData;
    
    return (
      <div className="min-h-screen bg-gray-50/50 flex flex-col">
        <Header />
        
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 space-y-8 pb-24">
          
          {/* Welcome Banner */}
          <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm relative overflow-hidden">
            <div className="absolute right-0 top-0 w-64 h-64 bg-gradient-to-br from-blue-50 to-transparent rounded-bl-full -z-10 opacity-50" style={{ backgroundImage: `linear-gradient(to bottom right, ${primaryColor}20, transparent)` }}></div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome, {customer.name.split(' ')[0]}!</h1>
            <p className="text-gray-600 mb-6">Here is everything you need for your trip to {booking.destination}.</p>
            
            <div className="flex flex-wrap gap-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 text-gray-800 border border-gray-200">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                Status: {booking.status.replace('_', ' ').toUpperCase()}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 text-gray-800 border border-gray-200">
                Booking ID: {booking.bookingNumber}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Itinerary Quick Link */}
            <a 
              href={`/itinerary/${slug}`}
              className="group block bg-white rounded-3xl p-6 border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center">
                  <Plane className="w-6 h-6" />
                </div>
                <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-gray-900 group-hover:translate-x-1 transition-all" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">View Itinerary</h2>
              <p className="text-gray-500 text-sm">See your day-by-day schedule, activities, and timings.</p>
            </a>

            {/* Financial Summary */}
            <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center">
                  <CreditCard className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Payment Summary</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                  <span className="text-gray-500">Total Cost</span>
                  <span className="font-semibold text-gray-900">₹{Number(booking.totalAmount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                  <span className="text-gray-500">Amount Paid</span>
                  <span className="font-semibold text-green-600">₹{Number(booking.amountPaid).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-medium">Balance Due</span>
                  <span className="font-bold text-red-600 text-lg">₹{Number(booking.balance).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Document Uploads */}
            <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <FileText className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Documents</h2>
              </div>
              
              <div className="space-y-3">
                <p className="text-sm text-gray-500 mb-4">You can securely upload passports and photos here.</p>
                <button className="w-full border-2 border-dashed border-gray-200 hover:border-purple-500 hover:bg-purple-50 transition-colors rounded-xl py-4 flex flex-col items-center justify-center gap-2 text-gray-500 hover:text-purple-700">
                  <FileDown className="w-5 h-5" />
                  <span className="text-sm font-medium">Upload Document</span>
                </button>
              </div>
            </div>

            {/* Visa Status */}
            <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Visa Status</h2>
              </div>
              
              {visaApplications.length > 0 ? (
                <div className="space-y-4">
                  {visaApplications.map((v: any) => (
                    <div key={v.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <div>
                        <p className="font-medium text-gray-900">{v.country}</p>
                        <p className="text-xs text-gray-500">Applicant: {v.travellerId}</p>
                      </div>
                      <span className="px-3 py-1 bg-white border border-gray-200 text-gray-700 text-xs font-bold rounded-lg uppercase tracking-wider">
                        {v.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500 text-sm">
                  No visa applications found for this trip.
                </div>
              )}
            </div>

          </div>
        </main>
        
        {/* Floating WhatsApp Support Button */}
        <a 
          href={`https://wa.me/${tenant?.phone?.replace(/\D/g, '') || ''}`}
          target="_blank"
          rel="noreferrer"
          className="fixed bottom-6 right-6 w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-110 z-50"
        >
          <MessageCircle className="w-7 h-7" />
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: primaryColor }}></div>
    </div>
  );
}
