"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth.store';
import { useRouter, usePathname } from 'next/navigation';
import { ThemeToggle } from '@/components/theme-toggle';
import { Bell, ChevronLeft } from 'lucide-react';
import { api } from '@/lib/api';
import { useSocket } from '@/components/providers/SocketProvider';
import GlobalSearch from './GlobalSearch';

export default function AgencyTopbar() {
  const { user, clearAuth } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const { socket } = useSocket();
  
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    fetchNotifications();

    if (socket) {
      socket.on('notification', (notif) => {
        setNotifications(prev => [notif, ...prev]);
        setUnreadCount(prev => prev + 1);
      });
    }
    
    return () => {
      if (socket) socket.off('notification');
    };
  }, [socket]);

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/notifications?limit=5');
      setNotifications(data.data || []);
      // Optimistic count calculation based on fetched items
      setUnreadCount((data.data || []).filter((n: any) => !n.isRead).length);
    } catch (e) {
      console.error('Failed to load notifications');
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setUnreadCount(0);
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (e) { }
  };

  const handleLogout = () => {
    clearAuth();
    router.push('/login');
  };

  // Humanize pathname for breadcrumb
  const currentSection = pathname.split('/')[1] || 'dashboard';
  const formattedSection = currentSection.charAt(0).toUpperCase() + currentSection.slice(1);

  return (
    <header className="h-16 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 flex items-center justify-between px-6 lg:px-8 shadow-sm z-30 shrink-0">
      {/* Left Side: Back Button, Breadcrumb Context + Global Search */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors flex items-center justify-center"
          title="Go back"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="hidden lg:flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 font-light">
          <span className="font-normal text-gray-600 dark:text-gray-300 capitalize">
            {user?.tenantSlug?.replace('-', ' ') || 'Agency'}
          </span>
          <span className="text-gray-300 dark:text-gray-600">/</span>
          <span className="text-primary font-medium">{formattedSection}</span>
        </div>
        <div className="ml-2">
          <GlobalSearch />
        </div>
      </div>

      {/* Right side - Quick actions & Profile */}
      <div className="flex items-center gap-3 sm:gap-5">
        {/* Quick Create Buttons */}
        <div className="hidden sm:flex items-center gap-2">
          <Link
            href="/leads"
            className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-xs font-bold text-gray-700 dark:text-gray-200 transition-colors flex items-center gap-1.5"
          >
            <span>+</span> Lead
          </Link>
          <Link
            href="/quotations/new"
            className="px-3 py-1.5 rounded-xl bg-primary hover:bg-primary/90 text-xs font-bold text-white shadow-sm shadow-primary/30 transition-all active:scale-95 flex items-center gap-1.5"
          >
            <span>+</span> Quotation
          </Link>
        </div>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notifications Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 relative transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse border border-white dark:border-gray-900"></span>
            )}
          </button>
          
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
                <h3 className="font-bold text-gray-900 dark:text-white">Notifications</h3>
                {unreadCount > 0 && (
                  <button onClick={markAllAsRead} className="text-xs font-bold text-primary hover:underline">
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-gray-500 text-sm">
                    No new notifications
                  </div>
                ) : (
                  notifications.map((notif, idx) => (
                    <div key={idx} className={`p-4 border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors ${!notif.isRead ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{notif.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notif.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Separator */}
        <div className="w-px h-6 bg-gray-200 dark:bg-gray-800"></div>

        {/* User Profile */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {user?.name || 'Agency User'}
            </span>
            <span className="text-xs text-primary font-medium capitalize">
              {user?.role?.replace('_', ' ') || 'Agent'}
            </span>
          </div>

          <div className="relative group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary to-orange-400 flex items-center justify-center text-white font-black text-sm shadow-md shadow-primary/20 ring-2 ring-white dark:ring-gray-800 cursor-pointer select-none group-hover:scale-105 transition-transform">
              {user?.name?.[0]?.toUpperCase() || 'A'}
            </div>

            {/* Dropdown Menu */}
            <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 overflow-hidden origin-top-right p-1.5">
              <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-700">
                <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{user?.name}</p>
                <p className="text-[11px] text-gray-500 truncate">{user?.email}</p>
              </div>

              <Link
                href="/settings"
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl transition-colors mt-1"
              >
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Agency Settings
              </Link>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors text-left"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
                </svg>
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
