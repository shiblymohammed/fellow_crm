"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth.store';
import { 
  Users, PlaneTakeoff, Wallet, FileCheck, 
  Plus, CalendarDays, ArrowRight, CreditCard,
  Briefcase, Activity, CheckCircle2, AlertCircle, TrendingUp, PhoneCall, ListTodo
} from 'lucide-react';
import { format } from 'date-fns';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardStats {
  sales: {
    newEnquiries: number;
    activeLeads: number;
    totalQuotations: number;
    conversionRate: number;
    todaysFollowUps: number;
    agentActivity: Array<{ agentName: string; callCount: number; otherCount: number }>;
  };
  bookings: {
    upcomingTrips: number;
    confirmed: number;
    pending: number;
  };
  finance: {
    todaysCollection: number;
    outstandingBalance: number;
    supplierPayable: number;
  };
  operations: {
    visaPending: number;
    docsPending: number;
    flightsPending: number;
    hotelPending: number;
  };
  recent: {
    leads: Array<any>;
    bookings: Array<any>;
  };
  charts: {
    revenue: Array<{ name: string; revenue: number }>;
  };
  insights: Array<{
    type: 'positive' | 'negative' | 'warning' | 'info';
    message: string;
  }>;
}

export default function AgencyDashboardPage() {
  const router = useRouter();
  const user = useAuthStore(state => state.user);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const { data } = await api.get('/dashboard/agency');
      setStats(data);
    } catch (error) {
      console.error('Failed to load agency dashboard stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] p-8 text-white shadow-xl border border-slate-800">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute right-32 -bottom-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-primary-300 border border-white/15">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              {user?.tenantSlug ? `${user.tenantSlug.toUpperCase()} HQ` : 'AGENCY CONSOLE'}
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              Welcome back, {user?.name || 'Partner'} 👋
            </h1>
            <p className="text-slate-400 max-w-xl text-sm sm:text-base">
              Here is what is happening across your agency today.
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/leads/new" className="bg-white text-slate-900 hover:bg-slate-100 font-bold py-2.5 px-5 rounded-xl shadow-lg transition-all flex items-center gap-2 text-sm">
              <Plus className="w-4 h-4" /> New Lead
            </Link>
            <Link href="/payments" className="bg-primary/20 hover:bg-primary/30 border border-primary/30 text-white font-bold py-2.5 px-5 rounded-xl transition-all flex items-center gap-2 text-sm">
              <Wallet className="w-4 h-4" /> Record Payment
            </Link>
          </div>
        </div>
      </div>

      {/* AI Smart Insights */}
      {stats?.insights && stats.insights.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border border-blue-100 dark:border-blue-800/50">
          <h3 className="text-sm font-bold text-blue-900 dark:text-blue-300 flex items-center gap-2 mb-4 uppercase tracking-wider">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
            </span>
            Smart Insights
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.insights.map((insight, idx) => (
              <div key={idx} className={`p-4 rounded-xl border flex items-start gap-3 ${
                insight.type === 'positive' ? 'bg-green-50/50 border-green-200 text-green-800 dark:bg-green-900/10 dark:border-green-900 dark:text-green-300' :
                insight.type === 'negative' ? 'bg-red-50/50 border-red-200 text-red-800 dark:bg-red-900/10 dark:border-red-900 dark:text-red-300' :
                insight.type === 'warning' ? 'bg-orange-50/50 border-orange-200 text-orange-800 dark:bg-orange-900/10 dark:border-orange-900 dark:text-orange-300' :
                'bg-blue-50/50 border-blue-200 text-blue-800 dark:bg-blue-900/10 dark:border-blue-900 dark:text-blue-300'
              }`}>
                {insight.type === 'positive' && <TrendingUp className="w-5 h-5 shrink-0" />}
                {insight.type === 'negative' && <AlertCircle className="w-5 h-5 shrink-0" />}
                {insight.type === 'warning' && <AlertCircle className="w-5 h-5 shrink-0" />}
                <p className="text-sm font-medium">{insight.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Sales Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700/50 hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/10 rounded-full blur-xl group-hover:bg-blue-500/20 transition-all pointer-events-none"></div>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">Sales & Leads</h3>
              <p className="text-sm text-gray-500">{stats?.sales.activeLeads || 0} active</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">New Enquiries (Today)</span>
              <span className="font-bold text-gray-900 dark:text-white">{stats?.sales.newEnquiries || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Today's Follow-ups</span>
              <span className="font-bold text-orange-600">{stats?.sales.todaysFollowUps || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Conversion Rate</span>
              <span className="font-bold text-green-600">{stats?.sales.conversionRate || 0}%</span>
            </div>
          </div>
        </div>

        {/* Bookings Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700/50 hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl group-hover:bg-indigo-500/20 transition-all pointer-events-none"></div>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <PlaneTakeoff className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">Trips</h3>
              <p className="text-sm text-gray-500">{stats?.bookings.upcomingTrips || 0} upcoming</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Confirmed (Total)</span>
              <span className="font-bold text-gray-900 dark:text-white">{stats?.bookings.confirmed || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Pending Confirmation</span>
              <span className="font-bold text-yellow-600">{stats?.bookings.pending || 0}</span>
            </div>
          </div>
        </div>

        {/* Finance Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700/50 hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl group-hover:bg-emerald-500/20 transition-all pointer-events-none"></div>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">Finance</h3>
              <p className="text-sm text-gray-500">Real-time balances</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Today's Collection</span>
              <span className="font-bold text-emerald-600">{formatCurrency(stats?.finance.todaysCollection || 0)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Outstanding (Clients)</span>
              <span className="font-bold text-red-500">{formatCurrency(stats?.finance.outstandingBalance || 0)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Supplier Payable</span>
              <span className="font-bold text-orange-500">{formatCurrency(stats?.finance.supplierPayable || 0)}</span>
            </div>
          </div>
        </div>

        {/* Operations Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700/50 hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-500/10 rounded-full blur-xl group-hover:bg-purple-500/20 transition-all pointer-events-none"></div>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">Operations</h3>
              <p className="text-sm text-gray-500">Pending Actions</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Visas Pending</span>
              <span className="font-bold text-purple-600">{stats?.operations.visaPending || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Docs Missing</span>
              <span className="font-bold text-gray-900 dark:text-white">{stats?.operations.docsPending || 0}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Charts & Feed Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-200 dark:border-gray-700/50 shadow-sm lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" /> Revenue Trends (Last 6 Months)
            </h3>
          </div>
          <div className="h-[300px] w-full">
            {stats?.charts?.revenue && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.charts.revenue} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} tickFormatter={(value) => `₹${value / 1000}k`} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                    formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Agent Activity Feed */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-200 dark:border-gray-700/50 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <ListTodo className="w-5 h-5 text-blue-500" /> Today's Activity
            </h3>
          </div>
          <div className="space-y-4">
            {stats?.sales.agentActivity && stats.sales.agentActivity.length > 0 ? (
              stats.sales.agentActivity.map((agent, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/30 rounded-2xl border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center">
                      {agent.agentName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white text-sm">{agent.agentName}</h4>
                      <p className="text-xs text-gray-500">{agent.otherCount} other actions</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-bold text-lg">
                      <PhoneCall className="w-4 h-4" /> {agent.callCount}
                    </div>
                    <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Calls</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10">
                <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-3">
                  <Activity className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-gray-500 text-sm font-medium">No activity logged today.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Two Column Layout for Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Recent Leads */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-200 dark:border-gray-700/50 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-primary" /> Recent Enquiries
            </h3>
            <Link href="/leads" className="text-sm font-semibold text-primary hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="space-y-3">
            {stats?.recent.leads.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">No recent leads found.</div>
            ) : (
              stats?.recent.leads.map(lead => (
                <div key={lead.id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border border-transparent hover:border-gray-100 dark:hover:border-gray-700 cursor-pointer" onClick={() => router.push(`/leads/${lead.id}`)}>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">{lead.customer?.name}</h4>
                    <p className="text-xs text-gray-500">{lead.destination || 'TBD'} • {format(new Date(lead.createdAt), 'MMM d, yyyy')}</p>
                  </div>
                  <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-full uppercase tracking-wider">
                    {lead.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Upcoming Trips */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-200 dark:border-gray-700/50 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-indigo-500" /> Upcoming Trips
            </h3>
            <Link href="/bookings" className="text-sm font-semibold text-primary hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-3">
            {stats?.recent.bookings.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">No upcoming trips found.</div>
            ) : (
              stats?.recent.bookings.map(booking => (
                <div key={booking.id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border border-transparent hover:border-gray-100 dark:hover:border-gray-700 cursor-pointer" onClick={() => router.push(`/bookings/${booking.id}`)}>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">{booking.customer?.name}</h4>
                    <p className="text-xs text-indigo-600 font-semibold">{booking.destination || 'TBD'}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-gray-900 dark:text-white">{formatCurrency(Number(booking.totalAmount))}</div>
                    <span className="text-xs text-emerald-500 font-bold">{booking.status}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
