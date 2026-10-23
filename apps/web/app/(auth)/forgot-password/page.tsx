"use client";

import Link from 'next/link';
import Image from 'next/image';
import React, { useState } from 'react';
import { api } from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [message, setMessage] = useState('');

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setIsLoading(true);
    setIsError(false);
    setIsSuccess(false);

    try {
      const response = await api.post('/auth/forgot-password', { email });
      setIsSuccess(true);
      setMessage(response.data.message || 'Password reset link sent to your email.');
    } catch (error: any) {
      setIsError(true);
      setMessage(error.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-[600px] mx-auto h-full justify-end sm:justify-center max-h-[100dvh]">
      {/* Transparent Logo Above the Card */}
      <div className="mb-4 sm:mb-6 w-full flex lg:hidden justify-center animate-in fade-in slide-in-from-top-4 duration-700 shrink-0 select-none pointer-events-none mt-auto sm:mt-0">
        <Image src="/logo_main.png" alt="Fellow Logo" width={160} height={48} className="object-contain drop-shadow-xl sm:w-[200px] sm:h-[60px]" />
      </div>

      {/* The Card */}
      <div className="w-full animate-in fade-in slide-in-from-bottom-6 duration-1000 ease-out bg-white/95 backdrop-blur-3xl p-6 pb-10 sm:p-10 lg:p-12 rounded-t-[2.5rem] rounded-b-none sm:rounded-[2.5rem] shadow-[0_-20px_60px_-15px_rgba(0,0,0,0.1)] sm:shadow-[0_50px_120px_-20px_rgba(0,0,0,0.2)] border-t border-white/60 sm:border relative overflow-hidden shrink-0">
        
        {/* Decorative gradient orbs */}
        <div className="absolute -top-40 -right-40 w-64 h-64 sm:w-96 sm:h-96 bg-orange-500/15 rounded-full blur-[60px] sm:blur-[80px] pointer-events-none"></div>
        <div className="absolute -bottom-40 -left-40 w-64 h-64 sm:w-96 sm:h-96 bg-orange-400/10 rounded-full blur-[60px] sm:blur-[80px] pointer-events-none"></div>

        {/* Header Section */}
        <div className="space-y-1 sm:space-y-2 mb-6 sm:mb-8 text-center relative z-10 select-none">
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900 font-sans flex items-center justify-center gap-2 sm:gap-3">
            Reset Password
          </h1>
          <p className="text-[14px] sm:text-[17px] text-gray-500 font-medium mt-1 sm:mt-2">
            Enter your email to receive a password reset link.
          </p>
        </div>

        {isSuccess ? (
          <div className="relative z-10 text-center space-y-6">
            <div className="p-4 bg-green-50 border-2 border-green-200 text-green-700 rounded-2xl font-medium shadow-sm">
              {message}
            </div>
            <Link href="/login" className="inline-block w-full h-12 sm:h-14 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-xl sm:rounded-2xl font-bold text-[16px] sm:text-[17px] transition-all flex items-center justify-center">
              Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleForgotPassword} className={`space-y-4 sm:space-y-6 relative z-10 ${isError ? 'animate-shake' : ''}`}>
            <div className="space-y-3 sm:space-y-4">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 sm:pl-5 pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                  </svg>
                </div>
                <input 
                  type="email" 
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className={`w-full pl-11 pr-4 sm:pl-14 sm:pr-5 h-12 sm:h-14 rounded-xl sm:rounded-2xl border-2 bg-gray-50/50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:bg-white transition-all text-[16px] shadow-sm font-medium disabled:opacity-50 ${isError ? 'border-red-400 focus:border-red-500' : 'border-gray-100 focus:border-primary'}`}
                  required
                />
              </div>
            </div>

            {isError && (
              <p className="text-red-500 text-sm font-medium text-center">{message}</p>
            )}

            <button 
              type="submit" 
              disabled={isLoading}
              className={`w-full h-12 sm:h-14 text-white rounded-xl sm:rounded-2xl font-bold text-[16px] sm:text-[17px] transition-all flex items-center justify-center gap-2 sm:gap-3 ${isError ? 'bg-red-500 shadow-[0_10px_25px_rgba(239,68,68,0.3)] hover:bg-red-600' : 'bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30'} ${!isLoading && 'active:scale-[0.97]'}`}
            >
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </button>
            
            <div className="text-center mt-4">
              <Link href="/login" className="text-[14px] font-semibold text-gray-500 hover:text-gray-900 transition-colors">
                Back to Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
