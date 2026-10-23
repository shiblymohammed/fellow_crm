import React from 'react';
import AuthGuard from '@/components/layout/AuthGuard';
import AgencySidebar from '@/components/layout/AgencySidebar';
import AgencyTopbar from '@/components/layout/AgencyTopbar';
import { CommandPalette } from '@/components/ui/CommandPalette';
import { SocketProvider } from '@/components/providers/SocketProvider';
import { AiCopilot } from '@/components/ui/AiCopilot';

export default function AgencyLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard requireAuth={true} requireRole={['agency_owner', 'manager', 'sales', 'operations', 'accounts']}>
      <SocketProvider>
        <div className="flex h-screen bg-gray-50/50 dark:bg-gray-900 font-sans text-gray-900 dark:text-gray-100 overflow-hidden selection:bg-primary/30 selection:text-primary">
          <AgencySidebar />
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            <AgencyTopbar />
            <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-6 scroll-smooth">
              <div className="mx-auto w-full max-w-[1600px] animate-in fade-in slide-in-from-bottom-4 duration-700">
                {children}
              </div>
            </main>
          </div>
        </div>
        <CommandPalette />
        <AiCopilot />
      </SocketProvider>
    </AuthGuard>
  );
}
