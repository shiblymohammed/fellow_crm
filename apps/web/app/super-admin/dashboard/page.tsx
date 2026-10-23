"use client";

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardStats {
  totalAgencies: number;
  activeAgencies: number;
  totalRevenue: number;
  totalLeads: number;
  mrr: number;
  recentLeads: any[];
}

// Mock data for the chart since we don't have historical data yet
const chartData = [
  { name: 'Jan', revenue: 4000, agencies: 24 },
  { name: 'Feb', revenue: 3000, agencies: 28 },
  { name: 'Mar', revenue: 5000, agencies: 35 },
  { name: 'Apr', revenue: 7800, agencies: 42 },
  { name: 'May', revenue: 8900, agencies: 50 },
  { name: 'Jun', revenue: 12000, agencies: 65 },
  { name: 'Jul', revenue: 15400, agencies: 78 },
];

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/dashboard/super-admin');
      setStats(data);
    } catch (error) {
      console.error('Failed to load dashboard stats', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-96 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl p-6 rounded-3xl border border-white/50 dark:border-gray-700/50 shadow-sm relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Platform Overview
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">
            Welcome back! Here's what's happening across Fellow CRM today.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard 
          title="Monthly Recurring Revenue" 
          value={`₹${stats?.mrr.toLocaleString()}`} 
          subtitle="Projected from active plans"
          icon={
            <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          }
          trend="+12.5%"
          trendUp={true}
        />
        <StatCard 
          title="Total Revenue Collected" 
          value={`₹${(stats?.totalRevenue || 0).toLocaleString()}`} 
          subtitle="All-time paid invoices"
          icon={
            <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
          }
        />
        <StatCard 
          title="Active Agencies" 
          value={`${stats?.activeAgencies} / ${stats?.totalAgencies}`} 
          subtitle="Currently onboarded"
          icon={
            <svg className="w-6 h-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
          }
          trend="+4 this week"
          trendUp={true}
        />
        <StatCard 
          title="Platform Leads" 
          value={stats?.totalLeads || 0} 
          subtitle="Waiting for follow-up"
          icon={
            <svg className="w-6 h-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart Section */}
        <div className="lg:col-span-2 bg-white/70 dark:bg-gray-800/70 backdrop-blur-2xl p-6 rounded-3xl border border-white/60 dark:border-gray-700/60 shadow-xl">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Revenue Growth (Demo)</h2>
            <p className="text-sm text-gray-500">Historical performance over the last 7 months.</p>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} tickFormatter={(value) => `₹${value/1000}k`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                  itemStyle={{ fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Leads */}
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-2xl p-6 rounded-3xl border border-white/60 dark:border-gray-700/60 shadow-xl flex flex-col">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Recent Leads</h2>
            <p className="text-sm text-gray-500">Latest agency inquiries.</p>
          </div>
          
          <div className="flex-1 space-y-4 overflow-y-auto pr-2">
            {!stats?.recentLeads || stats.recentLeads.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No recent leads.</p>
            ) : (
              stats.recentLeads.map((lead: any) => (
                <div key={lead.id} className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-700">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-sm text-gray-900 dark:text-white">{lead.name}</h3>
                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider bg-primary/10 px-2 py-0.5 rounded-full">
                      {lead.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 font-medium mb-2">{lead.agencyName || lead.email}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, subtitle, icon, trend, trendUp }: any) {
  return (
    <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-2xl p-6 rounded-3xl border border-white/60 dark:border-gray-700/60 shadow-xl relative overflow-hidden group hover:shadow-2xl transition-all duration-300">
      <div className="absolute -right-8 -top-8 w-32 h-32 bg-gray-100/50 dark:bg-gray-700/50 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700 pointer-events-none"></div>
      
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="w-12 h-12 bg-white dark:bg-gray-900 rounded-2xl shadow-sm flex items-center justify-center border border-gray-100 dark:border-gray-700">
          {icon}
        </div>
        {trend && (
          <span className={`text-xs font-bold px-2 py-1 rounded-lg ${trendUp ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {trend}
          </span>
        )}
      </div>
      
      <div className="relative z-10">
        <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">{title}</h3>
        <p className="text-3xl font-extrabold text-gray-900 dark:text-white">{value}</p>
        {subtitle && <p className="text-xs font-medium text-gray-400 mt-2">{subtitle}</p>}
      </div>
    </div>
  );
}
