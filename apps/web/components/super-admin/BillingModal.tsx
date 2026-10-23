import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

interface BillingModalProps {
  tenantId: string;
  tenantName: string;
  onClose: () => void;
}

interface Invoice {
  id: string;
  invoice_number: string;
  amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  due_date: string;
  created_at: string;
  paid_at: string | null;
}

export default function BillingModal({ tenantId, tenantName, onClose }: BillingModalProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  
  // New invoice form state
  const [amount, setAmount] = useState<number>(0);
  const [dueDate, setDueDate] = useState<string>('');

  useEffect(() => {
    fetchInvoices();
  }, [tenantId]);

  const fetchInvoices = async () => {
    try {
      const { data } = await api.get(`/tenant-billing/tenant/${tenantId}`);
      setInvoices(data);
    } catch (error) {
      toast.error('Failed to load billing history');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/tenant-billing', {
        tenantId,
        amount,
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      });
      toast.success('Invoice created successfully');
      setAmount(0);
      setDueDate('');
      setIsCreating(false);
      fetchInvoices();
    } catch (error) {
      toast.error('Failed to create invoice');
    }
  };

  const handleMarkPaid = async (id: string) => {
    try {
      await api.patch(`/tenant-billing/${id}`, { status: 'paid' });
      toast.success('Invoice marked as paid');
      fetchInvoices();
    } catch (error) {
      toast.error('Failed to update invoice');
    }
  };

  const handleMarkOverdue = async (id: string) => {
    try {
      await api.patch(`/tenant-billing/${id}`, { status: 'overdue' });
      toast.success('Invoice marked as overdue');
      fetchInvoices();
    } catch (error) {
      toast.error('Failed to update invoice');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>
      
      {/* Slide-out Panel */}
      <div className="relative w-full max-w-md bg-white dark:bg-gray-800 h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 border-l border-white/20 dark:border-gray-700/50">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700/50 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Billing History</h2>
            <p className="text-sm text-gray-500 mt-1">{tenantName}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {/* Create Invoice Section */}
          <div className="mb-8">
            {!isCreating ? (
              <button
                onClick={() => setIsCreating(true)}
                className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-gray-600 dark:text-gray-400 font-bold hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create New Invoice
              </button>
            ) : (
              <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                <form onSubmit={handleCreateInvoice} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Amount (INR)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={amount || ''}
                      onChange={e => setAmount(Number(e.target.value))}
                      className="w-full h-10 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:border-primary focus:ring-0 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Due Date (Optional)</label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={e => setDueDate(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:border-primary focus:ring-0 outline-none"
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsCreating(false)}
                      className="flex-1 py-2 text-sm font-bold text-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2 text-sm font-bold text-white bg-primary hover:bg-primary/90 rounded-lg shadow-md transition-colors"
                    >
                      Create
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Invoice List */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Past Invoices</h3>
            {isLoading ? (
              <div className="animate-pulse space-y-4">
                {[1,2,3].map(i => (
                  <div key={i} className="h-24 bg-gray-100 dark:bg-gray-700/50 rounded-xl"></div>
                ))}
              </div>
            ) : invoices.length === 0 ? (
              <p className="text-center text-sm text-gray-400 py-8">No invoices generated yet.</p>
            ) : (
              invoices.map(invoice => (
                <div key={invoice.id} className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-4 shadow-sm relative overflow-hidden group">
                  <div className={`absolute top-0 left-0 w-1 h-full ${
                    invoice.status === 'paid' ? 'bg-green-500' :
                    invoice.status === 'overdue' ? 'bg-red-500' : 'bg-yellow-500'
                  }`}></div>
                  
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white text-sm">{invoice.invoice_number}</p>
                      <p className="text-[10px] text-gray-500">{format(new Date(invoice.created_at), 'MMM d, yyyy')}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      invoice.status === 'paid' ? 'bg-green-100 text-green-700' :
                      invoice.status === 'overdue' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {invoice.status}
                    </span>
                  </div>
                  
                  <div className="mb-3">
                    <p className="text-xl font-extrabold text-gray-900 dark:text-white">₹{Number(invoice.amount).toLocaleString()}</p>
                    {invoice.due_date && (
                      <p className="text-xs text-gray-500">Due: {format(new Date(invoice.due_date), 'MMM d, yyyy')}</p>
                    )}
                  </div>

                  {invoice.status === 'pending' && (
                    <div className="flex gap-2 border-t border-gray-100 dark:border-gray-700 pt-3 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleMarkPaid(invoice.id)}
                        className="flex-1 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 text-xs font-bold rounded-md transition-colors"
                      >
                        Mark Paid
                      </button>
                      <button
                        onClick={() => handleMarkOverdue(invoice.id)}
                        className="flex-1 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold rounded-md transition-colors"
                      >
                        Mark Overdue
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
