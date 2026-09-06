import { ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Viewport, Metadata } from 'next';
import AuthGuard from '@/components/layout/AuthGuard';

export const viewport: Viewport = {
  themeColor: '#111827',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Fellow',
  },
  formatDetection: {
    telephone: false,
  },
};

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard requireAuth={false}>
      <div className="flex h-[100dvh] max-h-[100dvh] relative overflow-hidden bg-gray-900 overscroll-none selection:bg-primary/30 selection:text-primary">
        {/* Full Screen Background Image */}
        <div className="absolute inset-0 z-0">
          <Image 
            src="/firefly.jpg" 
            alt="Fellow CRM Background" 
            fill 
            className="object-cover object-center -scale-x-100"
            priority
          />
        </div>

        {/* Top Right Navigation */}
        <div className="absolute top-0 right-0 p-6 md:p-8 flex justify-end items-center z-20 pointer-events-none hidden md:flex">
          <div className="text-[14px] text-gray-900 font-medium drop-shadow-md pointer-events-auto bg-white/60 px-5 py-2.5 rounded-full backdrop-blur-md border border-white/40 shadow-sm transition-all hover:bg-white/80">
            New to Fellow? <Link href="/register" className="text-primary hover:underline font-bold ml-1">Sign up</Link>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="relative z-10 flex w-full h-full">
          
          {/* Left Half: Logo & Typography at top left */}
          <div className="hidden lg:flex w-1/2 flex-col items-start justify-start pt-10 pl-10 xl:pt-16 xl:pl-16 pointer-events-none">
            <div className="pointer-events-auto animate-in fade-in slide-in-from-left-6 duration-1000 relative">
              
              {/* Light BG Shadow glowing behind the logo */}
              <div className="absolute -top-8 -left-8 w-[320px] h-[140px] bg-white/60 blur-[60px] rounded-full pointer-events-none -z-10"></div>

              <Image src="/logo_main.png" alt="Fellow Logo" width={280} height={84} className="object-contain drop-shadow-2xl relative z-10" />
              
              {/* Massive Transparent Gradient Typography */}
              <div className="mt-8 space-y-3 max-w-xl animate-in fade-in slide-in-from-left-8 duration-1000 delay-300 fill-mode-both">
                <h1 className="text-5xl xl:text-[4.5rem] font-extrabold tracking-tighter leading-[1.05] font-sans">
                  <span className="bg-clip-text text-transparent bg-gradient-to-br from-gray-900 to-gray-900/30">
                    Travel Farther.
                  </span>
                  <br />
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/40">
                    Work Smarter.
                  </span>
                </h1>
                <p className="text-lg xl:text-xl font-semibold text-gray-700/80 max-w-md mt-4 leading-relaxed">
                  Built for the next generation of travel companies.
                </p>
              </div>
            </div>
          </div>

          {/* Right Half: Auth Container (Card) */}
          <div className="w-full lg:w-1/2 h-full flex flex-col items-center justify-end sm:justify-center px-0 pb-0 sm:px-12 lg:pr-[8%] pointer-events-auto">
            {children}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
