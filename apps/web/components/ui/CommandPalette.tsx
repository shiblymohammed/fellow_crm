"use client";

import React, { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Search, User, Briefcase, Calendar, Plus, MapPin } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const user = useAuthStore(state => state.user);
  
  // Data state
  const [leads, setLeads] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  // Fetch quick data when opened
  useEffect(() => {
    if (open && user) {
      const fetchData = async () => {
        try {
          const [leadsRes, customersRes, bookingsRes] = await Promise.all([
            api.get('/leads?limit=10'),
            api.get('/customers?limit=10'),
            api.get('/bookings?limit=10')
          ]);
          setLeads(leadsRes.data.data || []);
          setCustomers(customersRes.data.data || []);
          setBookings(bookingsRes.data.data || []);
        } catch (error) {
          console.error("Failed to load command palette data", error);
        }
      };
      fetchData();
    }
  }, [open, user]);

  const onSelect = (path: string) => {
    setOpen(false);
    router.push(path);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-gray-900/50 backdrop-blur-sm flex items-start justify-center pt-[15vh]">
      <Command 
        className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-800"
        label="Global Command Menu"
        shouldFilter={true}
        loop
      >
        <div className="flex items-center px-4 border-b border-gray-100 dark:border-gray-800">
          <Search className="w-5 h-5 text-gray-400 shrink-0" />
          <Command.Input 
            autoFocus
            className="w-full bg-transparent p-4 outline-none text-gray-900 dark:text-white placeholder-gray-400" 
            placeholder="Search leads, bookings, customers, or type a command..." 
          />
          <button onClick={() => setOpen(false)} className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">ESC</button>
        </div>

        <Command.List className="max-h-[60vh] overflow-y-auto p-2 scrollbar-hide">
          <Command.Empty className="py-6 text-center text-sm text-gray-500">No results found.</Command.Empty>

          <Command.Group heading="Quick Actions" className="px-2 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <Command.Item onSelect={() => onSelect('/leads/new')} className="flex items-center gap-2 p-3 text-sm text-gray-700 dark:text-gray-300 rounded-xl hover:bg-primary/10 hover:text-primary cursor-pointer aria-selected:bg-primary/10 aria-selected:text-primary">
              <Plus className="w-4 h-4" /> Create New Lead
            </Command.Item>
            <Command.Item onSelect={() => onSelect('/dashboard')} className="flex items-center gap-2 p-3 text-sm text-gray-700 dark:text-gray-300 rounded-xl hover:bg-primary/10 hover:text-primary cursor-pointer aria-selected:bg-primary/10 aria-selected:text-primary">
              <MapPin className="w-4 h-4" /> Go to Dashboard
            </Command.Item>
          </Command.Group>

          {leads.length > 0 && (
            <Command.Group heading="Leads & Enquiries" className="px-2 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {leads.map((lead) => (
                <Command.Item 
                  key={lead.id} 
                  onSelect={() => onSelect(`/leads/${lead.id}`)}
                  className="flex items-center justify-between p-3 text-sm text-gray-700 dark:text-gray-300 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 aria-selected:bg-gray-100 dark:aria-selected:bg-gray-800"
                >
                  <div className="flex items-center gap-3">
                    <Briefcase className="w-4 h-4 text-gray-400" />
                    <span>{lead.customer?.name} - {lead.destination || 'TBD'}</span>
                  </div>
                  <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">{lead.status}</span>
                </Command.Item>
              ))}
            </Command.Group>
          )}

          {bookings.length > 0 && (
            <Command.Group heading="Bookings & Trips" className="px-2 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {bookings.map((booking) => (
                <Command.Item 
                  key={booking.id} 
                  onSelect={() => onSelect(`/bookings/${booking.id}`)}
                  className="flex items-center justify-between p-3 text-sm text-gray-700 dark:text-gray-300 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 aria-selected:bg-gray-100 dark:aria-selected:bg-gray-800"
                >
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-indigo-400" />
                    <span>{booking.customer?.name} - {booking.destination}</span>
                  </div>
                  <span className="text-xs text-indigo-500 font-medium">{booking.bookingNumber}</span>
                </Command.Item>
              ))}
            </Command.Group>
          )}

          {customers.length > 0 && (
            <Command.Group heading="Customers" className="px-2 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {customers.map((customer) => (
                <Command.Item 
                  key={customer.id} 
                  onSelect={() => onSelect(`/customers/${customer.id}`)}
                  className="flex items-center justify-between p-3 text-sm text-gray-700 dark:text-gray-300 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 aria-selected:bg-gray-100 dark:aria-selected:bg-gray-800"
                >
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-emerald-400" />
                    <span>{customer.name}</span>
                  </div>
                  <span className="text-xs text-gray-400">{customer.phone}</span>
                </Command.Item>
              ))}
            </Command.Group>
          )}

        </Command.List>
      </Command>
      
      <style jsx global>{`
        [cmdk-group-heading] {
          padding: 8px 12px;
          color: #9ca3af;
          font-size: 11px;
          text-transform: uppercase;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}
