"use client";

import React from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { useRouter } from 'next/navigation';

export default function Topbar() {
  const { user, clearAuth } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    clearAuth();
    router.push('/login');
  };

  return (
    <div className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 lg:px-8 shadow-sm">
      {/* Left side - Breadcrumbs or Context */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <span className="font-semibold text-gray-800">Super Admin</span>
        <span>/</span>
        <span className="text-gray-400">Dashboard</span>
      </div>

      {/* Right side - Actions & Profile */}
      <div className="flex items-center gap-4 sm:gap-6">
        
        {/* Notifications */}
        <button className="relative text-gray-400 hover:text-gray-600 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
          </svg>
          <span className="absolute 1 top-0 right-0.5 w-2 h-2 bg-primary rounded-full border-2 border-white"></span>
        </button>

        {/* Separator */}
        <div className="w-px h-6 bg-gray-200"></div>

        {/* Profile Dropdown (Simplified for now) */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-sm font-semibold text-gray-900">{user?.name || 'Admin'}</span>
            <span className="text-xs text-gray-500 capitalize">{user?.role?.replace('_', ' ')}</span>
          </div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary to-orange-400 flex items-center justify-center text-white font-bold shadow-sm ring-2 ring-white cursor-pointer select-none relative group">
            {user?.name?.[0]?.toUpperCase() || 'A'}
            
            {/* Simple hover dropdown for logout */}
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 overflow-hidden origin-top-right">
              <div className="p-2">
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
                  </svg>
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
