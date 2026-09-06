import React, { createContext, useContext, useState, useCallback } from 'react';
import { cn } from '../lib/utils';

type ToastVariant = 'success' | 'error' | 'warning' | 'info';

interface ToastItem {
  id: string;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  toast: (message: string, variant?: ToastVariant) => void;
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} });

const variantClasses: Record<ToastVariant, string> = {
  success: 'bg-green-600 text-white',
  error:   'bg-red-600 text-white',
  warning: 'bg-yellow-500 text-white',
  info:    'bg-blue-600 text-white',
};

const icons: Record<ToastVariant, string> = {
  success: '✓',
  error:   '✕',
  warning: '⚠',
  info:    'ℹ',
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const toast = useCallback((message: string, variant: ToastVariant = 'info') => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { id, message, variant }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast container */}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2"
      >
        {toasts.map(t => (
          <div
            key={t.id}
            role="status"
            className={cn(
              'flex min-w-[280px] items-center gap-3 rounded-lg px-4 py-3 shadow-lg text-sm font-medium',
              'animate-in slide-in-from-right-5 fade-in',
              variantClasses[t.variant]
            )}
          >
            <span aria-hidden="true" className="text-base leading-none">{icons[t.variant]}</span>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
