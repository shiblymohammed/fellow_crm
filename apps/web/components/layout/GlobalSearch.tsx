"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, X } from 'lucide-react';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
        setTimeout(() => inputRef.current?.focus(), 10);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounce search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const delayDebounceFn = setTimeout(async () => {
      try {
        const { data } = await api.get(`/dashboard/search?q=${encodeURIComponent(query)}`);
        setResults(data.data || []);
      } catch (error) {
        console.error("Search failed", error);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleSelect = (item: any) => {
    setIsOpen(false);
    setQuery('');
    if (item.type === 'booking') router.push(`/bookings/${item.id}`);
    else if (item.type === 'lead') router.push(`/leads/${item.id}`);
    else if (item.type === 'customer') router.push(`/customers/${item.id}`);
  };

  return (
    <div className="relative" ref={searchRef}>
      {/* Search Trigger (Small screens just show icon, large screens show bar) */}
      <div 
        className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-xl cursor-text hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        onClick={() => { setIsOpen(true); setTimeout(() => inputRef.current?.focus(), 10); }}
      >
        <Search className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:inline-block w-24 md:w-40 truncate select-none">
          Search...
        </span>
        <div className="hidden sm:flex items-center gap-0.5 ml-2">
          <kbd className="px-1.5 py-0.5 text-[10px] font-medium bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded shadow-sm text-gray-500">⌘</kbd>
          <kbd className="px-1.5 py-0.5 text-[10px] font-medium bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded shadow-sm text-gray-500">K</kbd>
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-0 left-0 w-[300px] sm:w-[400px] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center p-3 border-b border-gray-100 dark:border-gray-700">
            <Search className="w-5 h-5 text-gray-400 mr-2" />
            <input
              ref={inputRef}
              type="text"
              className="flex-1 bg-transparent border-none outline-none text-sm text-gray-900 dark:text-white placeholder:text-gray-400"
              placeholder="Search leads, bookings, customers..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {isLoading && <Loader2 className="w-4 h-4 text-gray-400 animate-spin mr-2" />}
            <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          <div className="max-h-[60vh] overflow-y-auto p-2">
            {!query.trim() ? (
              <div className="p-4 text-center text-sm text-gray-500">
                Type to start searching...
              </div>
            ) : results.length === 0 && !isLoading ? (
              <div className="p-4 text-center text-sm text-gray-500">
                No results found for "{query}"
              </div>
            ) : (
              <div className="space-y-1">
                {results.map((item, idx) => (
                  <button
                    key={`${item.type}-${item.id}-${idx}`}
                    onClick={() => handleSelect(item)}
                    className="w-full text-left p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors flex items-center justify-between group"
                  >
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{item.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{item.subtitle}</p>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-500 rounded-md">
                      {item.type}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
