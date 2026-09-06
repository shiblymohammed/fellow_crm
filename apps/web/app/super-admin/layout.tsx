import React from 'react';
import AuthGuard from '@/components/layout/AuthGuard';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard requireAuth={true} requireRole={['super_admin']}>
      <div className="flex h-screen bg-gray-50/50 dark:bg-gray-900 font-sans text-gray-900 dark:text-gray-100 overflow-hidden selection:bg-primary/30 selection:text-primary">
        
        <Sidebar />
        
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Topbar />
          
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 scroll-smooth">
            <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-700">
              {children}
            </div>
          </main>
        </div>
        
      </div>
    </AuthGuard>
  );
}
