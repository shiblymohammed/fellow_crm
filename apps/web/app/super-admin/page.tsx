"use client";

import { useAuthStore } from '@/stores/auth.store';

export default function SuperAdminDashboard() {
  const { user, clearAuth } = useAuthStore();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Platform Overview</h1>
          <p className="text-gray-500 mt-1">Monitor all active agencies and platform health.</p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold mb-2">Welcome back, {user?.name} 👋</h2>
        <p className="text-gray-500 mb-6">You are logged in as a Super Admin.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl bg-orange-50 border border-orange-100">
            <p className="text-orange-600 font-medium text-sm">Total Agencies</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">12</p>
          </div>
          <div className="p-6 rounded-xl bg-blue-50 border border-blue-100">
            <p className="text-blue-600 font-medium text-sm">Active Subscriptions</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">10</p>
          </div>
          <div className="p-6 rounded-xl bg-green-50 border border-green-100">
            <p className="text-green-600 font-medium text-sm">MRR</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">₹1.2L</p>
          </div>
        </div>
      </div>
    </div>
  );
}
