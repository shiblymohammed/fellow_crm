"use client";

import Link from 'next/link';
import Image from 'next/image';
import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { api } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore(state => state.setAuth);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('Incorrect Credentials');
  
  // Keyboard listener to drop focus on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        (document.activeElement as HTMLElement)?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setIsLoading(true);
    setIsError(false);

    // Native-feeling haptic feedback on submit
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(50);
    }

    try {
      const response = await api.post('/auth/login', { email, password });
      
      const { accessToken, user } = response.data.data;
      
      setAuth(user, accessToken);
      
      // Determine correct redirect based on role
      if (user.role === 'super_admin') {
        router.push('/super-admin');
      } else {
        router.push('/dashboard');
      }
    } catch (error: any) {
      setIsError(true);
      setErrorMessage(error.response?.data?.message || 'Incorrect Credentials');
      
      // Error haptic pattern
      if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate([100, 50, 100]);
      }

      // Remove error state after animation completes
      setTimeout(() => setIsError(false), 600);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // If user presses enter on email field, move focus to password field
    if (e.key === 'Enter') {
      e.preventDefault();
      passwordRef.current?.focus();
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-[600px] mx-auto h-full justify-end sm:justify-center max-h-[100dvh]">
      {/* Transparent Logo Above the Card */}
      <div className="mb-4 sm:mb-6 w-full flex lg:hidden justify-center animate-in fade-in slide-in-from-top-4 duration-700 shrink-0 select-none pointer-events-none mt-auto sm:mt-0">
        <Image src="/logo_main.png" alt="Fellow Logo" width={160} height={48} className="object-contain drop-shadow-xl sm:w-[200px] sm:h-[60px]" />
      </div>

      {/* The Login Card - Highly Touch Optimized */}
      <div className="w-full animate-in fade-in slide-in-from-bottom-6 duration-1000 ease-out bg-white/95 backdrop-blur-3xl p-6 pb-10 sm:p-10 lg:p-12 rounded-t-[2.5rem] rounded-b-none sm:rounded-[2.5rem] shadow-[0_-20px_60px_-15px_rgba(0,0,0,0.1)] sm:shadow-[0_50px_120px_-20px_rgba(0,0,0,0.2)] border-t border-white/60 sm:border relative overflow-hidden shrink-0">
        
        {/* Decorative gradient orbs */}
        <div className="absolute -top-40 -right-40 w-64 h-64 sm:w-96 sm:h-96 bg-orange-500/15 rounded-full blur-[60px] sm:blur-[80px] pointer-events-none"></div>
        <div className="absolute -bottom-40 -left-40 w-64 h-64 sm:w-96 sm:h-96 bg-orange-400/10 rounded-full blur-[60px] sm:blur-[80px] pointer-events-none"></div>

        {/* Header Section */}
        <div className="space-y-1 sm:space-y-2 mb-6 sm:mb-8 text-center relative z-10 select-none">
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900 font-sans flex items-center justify-center gap-2 sm:gap-3">
            Welcome Back <span className="text-2xl sm:text-4xl animate-wave origin-bottom-right">👋</span>
          </h1>
          <p className="text-[14px] sm:text-[17px] text-gray-500 font-medium mt-1 sm:mt-2">
            Sign in to your Fellow account to continue.
          </p>
        </div>

        <form onSubmit={handleLogin} className={`space-y-4 sm:space-y-6 relative z-10 ${isError ? 'animate-shake' : ''}`}>
          <div className="space-y-3 sm:space-y-4">
            {/* Email Input */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 sm:pl-5 pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                </svg>
              </div>
              <input 
                type="email" 
                inputMode="email"
                autoComplete="email"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck="false"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleEmailKeyDown}
                disabled={isLoading}
                className={`w-full pl-11 pr-4 sm:pl-14 sm:pr-5 h-12 sm:h-14 rounded-xl sm:rounded-2xl border-2 bg-gray-50/50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:bg-white transition-all text-[16px] shadow-sm font-medium [-webkit-tap-highlight-color:transparent] disabled:opacity-50 ${isError ? 'border-red-400 focus:border-red-500' : 'border-gray-100 focus:border-primary'}`}
                required
              />
            </div>

            {/* Password Input */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 sm:pl-5 pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                </svg>
              </div>
              <input 
                type={showPassword ? "text" : "password"}
                ref={passwordRef}
                autoComplete="current-password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className={`w-full pl-11 pr-11 sm:pl-14 sm:pr-14 h-12 sm:h-14 rounded-xl sm:rounded-2xl border-2 bg-gray-50/50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:bg-white transition-all text-[16px] shadow-sm font-medium [-webkit-tap-highlight-color:transparent] disabled:opacity-50 ${isError ? 'border-red-400 focus:border-red-500' : 'border-gray-100 focus:border-primary'}`}
                required
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1} 
                className="absolute inset-y-0 right-0 flex items-center pr-4 sm:pr-5 text-gray-400 hover:text-gray-700 transition-colors [-webkit-tap-highlight-color:transparent]"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Options Row */}
          <div className="flex items-center justify-between pt-0 sm:pt-1 select-none">
            <label className="flex items-center gap-2 sm:gap-3 cursor-pointer group [-webkit-tap-highlight-color:transparent]">
              <div className="relative flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 rounded-[4px] sm:rounded-[6px] border-2 border-primary bg-primary transition-colors shadow-sm">
                <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-[14px] sm:text-[15px] text-gray-700 font-medium group-hover:text-gray-900 transition-colors">Keep me signed in</span>
            </label>
            <Link href="#" className="text-[14px] font-semibold text-primary hover:underline hover:text-[#d94a1d] transition-colors [-webkit-tap-highlight-color:transparent] active:scale-95">
              Forgot password?
            </Link>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={isLoading}
            className={`w-full h-12 sm:h-14 text-white rounded-xl sm:rounded-2xl font-bold text-[16px] sm:text-[17px] transition-all flex items-center justify-center gap-2 sm:gap-3 select-none [-webkit-tap-highlight-color:transparent] ${isError ? 'bg-red-500 shadow-[0_10px_25px_rgba(239,68,68,0.3)] hover:bg-red-600' : 'bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30'} ${!isLoading && 'active:scale-[0.97]'}`}
          >
            {isLoading ? (
              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : isError ? (
              errorMessage
            ) : (
              <>
                Sign In
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 sm:w-5 sm:h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="my-5 sm:my-8 flex items-center gap-3 sm:gap-4 relative z-10 select-none">
          <div className="h-[2px] flex-1 bg-gray-100 rounded-full"></div>
          <span className="text-[11px] sm:text-[12px] font-bold uppercase tracking-wider text-gray-400 bg-transparent px-2">Or Continue With</span>
          <div className="h-[2px] flex-1 bg-gray-100 rounded-full"></div>
        </div>

        {/* Social Logins */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 relative z-10">
          <button type="button" disabled={isLoading} className="flex h-11 sm:h-12 items-center justify-center gap-2 rounded-xl sm:rounded-2xl border-2 border-gray-100 bg-white hover:bg-gray-50 hover:border-gray-200 transition-all shadow-sm hover:shadow-md active:scale-[0.95] select-none [-webkit-tap-highlight-color:transparent] disabled:opacity-50">
            <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/><path d="M1 1h22v22H1z" fill="none"/></svg>
            <span className="text-[13px] sm:text-[14px] font-bold text-gray-700 hidden sm:block">Google</span>
          </button>
          <button type="button" disabled={isLoading} className="flex h-11 sm:h-12 items-center justify-center gap-2 rounded-xl sm:rounded-2xl border-2 border-gray-100 bg-white hover:bg-gray-50 hover:border-gray-200 transition-all shadow-sm hover:shadow-md active:scale-[0.95] select-none [-webkit-tap-highlight-color:transparent] disabled:opacity-50">
            <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg"><path d="M10 0H0v10h10V0z" fill="#f25022"/><path d="M21 0H11v10h10V0z" fill="#7fba00"/><path d="M10 11H0v10h10V-11z" fill="#00a4ef"/><path d="M21 11H11v10h10V-11z" fill="#ffb900"/></svg>
            <span className="text-[13px] sm:text-[14px] font-bold text-gray-700 hidden sm:block">Microsoft</span>
          </button>
          <button type="button" disabled={isLoading} className="flex h-11 sm:h-12 items-center justify-center gap-2 rounded-xl sm:rounded-2xl border-2 border-gray-100 bg-white hover:bg-gray-50 hover:border-gray-200 transition-all shadow-sm hover:shadow-md active:scale-[0.95] select-none [-webkit-tap-highlight-color:transparent] disabled:opacity-50">
            <svg className="w-[18px] h-[18px] sm:w-[20px] sm:h-[20px]" viewBox="0 0 384 512" xmlns="http://www.w3.org/2000/svg"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/></svg>
            <span className="text-[13px] sm:text-[14px] font-bold text-gray-700 hidden sm:block">Apple</span>
          </button>
        </div>

        {/* Footer text */}
        <div className="mt-5 sm:mt-8 pb-4 sm:pb-0 text-center text-[11px] sm:text-[13px] text-gray-500 font-medium relative z-10 select-none">
          By signing in, you agree to our{' '}
          <Link href="#" className="text-primary hover:underline font-bold [-webkit-tap-highlight-color:transparent] active:scale-95">Terms</Link>
          {' '}and{' '}
          <Link href="#" className="text-primary hover:underline font-bold [-webkit-tap-highlight-color:transparent] active:scale-95">Privacy</Link>.
        </div>
      </div>
    </div>
  );
}
