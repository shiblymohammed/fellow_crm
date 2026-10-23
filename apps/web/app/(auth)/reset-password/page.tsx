"use client";

import Link from 'next/link';
import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setIsError(true);
      setMessage('Invalid or missing reset token.');
    }
  }, [token]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading || !token) return;

    if (password !== confirmPassword) {
      setIsError(true);
      setMessage('Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      setIsError(true);
      setMessage('Password must be at least 8 characters.');
      return;
    }

    setIsLoading(true);
    setIsError(false);
    setIsSuccess(false);

    try {
      const response = await api.post('/auth/reset-password', { token, password });
      setIsSuccess(true);
      setMessage(response.data.message || 'Password successfully reset.');
    } catch (error: any) {
      setIsError(true);
      setMessage(error.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-[600px] mx-auto h-full justify-end sm:justify-center max-h-[100dvh]">
      <div className="mb-4 sm:mb-6 w-full flex lg:hidden justify-center animate-in fade-in slide-in-from-top-4 duration-700 shrink-0 select-none pointer-events-none mt-auto sm:mt-0">
        <Image src="/logo_main.png" alt="Fellow Logo" width={160} height={48} className="object-contain drop-shadow-xl sm:w-[200px] sm:h-[60px]" />
      </div>

      <div className="w-full animate-in fade-in slide-in-from-bottom-6 duration-1000 ease-out bg-white/95 backdrop-blur-3xl p-6 pb-10 sm:p-10 lg:p-12 rounded-t-[2.5rem] rounded-b-none sm:rounded-[2.5rem] shadow-[0_-20px_60px_-15px_rgba(0,0,0,0.1)] sm:shadow-[0_50px_120px_-20px_rgba(0,0,0,0.2)] border-t border-white/60 sm:border relative overflow-hidden shrink-0">
        <div className="absolute -top-40 -right-40 w-64 h-64 sm:w-96 sm:h-96 bg-orange-500/15 rounded-full blur-[60px] sm:blur-[80px] pointer-events-none"></div>
        <div className="absolute -bottom-40 -left-40 w-64 h-64 sm:w-96 sm:h-96 bg-orange-400/10 rounded-full blur-[60px] sm:blur-[80px] pointer-events-none"></div>

        <div className="space-y-1 sm:space-y-2 mb-6 sm:mb-8 text-center relative z-10 select-none">
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900 font-sans flex items-center justify-center gap-2 sm:gap-3">
            New Password
          </h1>
          <p className="text-[14px] sm:text-[17px] text-gray-500 font-medium mt-1 sm:mt-2">
            Create a new password for your account.
          </p>
        </div>

        {isSuccess ? (
          <div className="relative z-10 text-center space-y-6">
            <div className="p-4 bg-green-50 border-2 border-green-200 text-green-700 rounded-2xl font-medium shadow-sm">
              {message}
            </div>
            <Link href="/login" className="inline-block w-full h-12 sm:h-14 bg-primary hover:bg-primary/90 text-white rounded-xl sm:rounded-2xl font-bold text-[16px] sm:text-[17px] transition-all flex items-center justify-center shadow-lg shadow-primary/30">
              Go to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleResetPassword} className={`space-y-4 sm:space-y-6 relative z-10 ${isError ? 'animate-shake' : ''}`}>
            <div className="space-y-3 sm:space-y-4">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 sm:pl-5 pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                  </svg>
                </div>
                <input 
                  type={showPassword ? "text" : "password"}
                  placeholder="New Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading || !token}
                  className={`w-full pl-11 pr-11 sm:pl-14 sm:pr-14 h-12 sm:h-14 rounded-xl sm:rounded-2xl border-2 bg-gray-50/50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:bg-white transition-all text-[16px] shadow-sm font-medium disabled:opacity-50 ${isError ? 'border-red-400 focus:border-red-500' : 'border-gray-100 focus:border-primary'}`}
                  required
                />
              </div>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 sm:pl-5 pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                  </svg>
                </div>
                <input 
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirm New Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading || !token}
                  className={`w-full pl-11 pr-11 sm:pl-14 sm:pr-14 h-12 sm:h-14 rounded-xl sm:rounded-2xl border-2 bg-gray-50/50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:bg-white transition-all text-[16px] shadow-sm font-medium disabled:opacity-50 ${isError ? 'border-red-400 focus:border-red-500' : 'border-gray-100 focus:border-primary'}`}
                  required
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1} 
                  className="absolute inset-y-0 right-0 flex items-center pr-4 sm:pr-5 text-gray-400 hover:text-gray-700 transition-colors [-webkit-tap-highlight-color:transparent]"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                  )}
                </button>
              </div>
            </div>

            {isError && (
              <p className="text-red-500 text-sm font-medium text-center">{message}</p>
            )}

            <button 
              type="submit" 
              disabled={isLoading || !token}
              className={`w-full h-12 sm:h-14 text-white rounded-xl sm:rounded-2xl font-bold text-[16px] sm:text-[17px] transition-all flex items-center justify-center gap-2 sm:gap-3 ${isError ? 'bg-red-500 shadow-[0_10px_25px_rgba(239,68,68,0.3)] hover:bg-red-600' : 'bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30'} ${!isLoading && token && 'active:scale-[0.97]'}`}
            >
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
