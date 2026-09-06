"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireRole?: string[];
}

export default function AuthGuard({ children, requireAuth = true, requireRole = [] }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuthStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    if (requireAuth && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (requireAuth && isAuthenticated && requireRole.length > 0 && user) {
      if (!requireRole.includes(user.role)) {
        router.push(user.role === 'super_admin' ? '/super-admin' : '/dashboard');
        return;
      }
    }

    if (!requireAuth && isAuthenticated && pathname === '/login') {
      router.push(user?.role === 'super_admin' ? '/super-admin' : '/dashboard');
    }
  }, [isMounted, isAuthenticated, requireAuth, requireRole, router, pathname, user]);

  // Handle server-side rendering safely
  if (!isMounted) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <svg className="animate-spin h-10 w-10 text-orange-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  // Once mounted, if it requires auth but isn't authenticated, don't render children (avoid flash)
  if (requireAuth && !isAuthenticated) return null;

  // If role doesn't match, don't render children
  if (requireAuth && requireRole.length > 0 && user && !requireRole.includes(user.role)) return null;

  return <>{children}</>;
}
