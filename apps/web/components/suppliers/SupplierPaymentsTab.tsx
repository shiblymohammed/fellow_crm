import React, { useState, useEffect } from 'react';
import { supplierPaymentsApi } from '@/lib/api';
import { SupplierPayment, SupplierPaymentStatus } from '@/types/supplier';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

interface Props {
  supplierId: string;
  onUpdate: () => void;
}

export default function SupplierPaymentsTab({ supplierId, onUpdate }: Props) {
  const [payments, setPayments] = useState<SupplierPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form state
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
  const [reference, setReference] = useState('');
  const [paidAt, setPaidAt] = useState(new Date().toISOString().slice(0, 16));
  const [notes, setNotes] = useState('');
  const [bookingId, setBookingId] = useState('');

  useEffect(() => {
    fetchPayments();
  }, [supplierId]);

  const fetchPayments = async () => {
    setIsLoading(true);
    try {
      const data = await supplierPaymentsApi.getAllBySupplier(supplierId);
      setPayments(data);
    } catch (error) {
      toast.error('Failed to load supplier payments');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setAmount('');
    setPaymentMethod('bank_transfer');
    setReference('');
    setPaidAt(new Date().toISOString().slice(0, 16));
    setNotes('');
    setBookingId('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      await supplierPaymentsApi.create({
        supplierId,
        amount: Number(amount),
        paymentMethod,
        reference: reference || undefined,
        notes: notes || undefined,
        paidAt: new Date(paidAt).toISOString(),
        bookingId: bookingId || undefined,
        status: 'paid',
      });

      toast.success('Supplier payment recorded successfully');
      setIsModalOpen(false);
      resetForm();
      fetchPayments();
      onUpdate(); // refresh outstanding payable in parent
    } catch (error) {
      toast.error('Failed to record supplier payment');
    }
  };

  if (isLoading) {
    return <div className="py-8 text-center text-gray-500">Loading payments...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Payment Ledger</h3>
        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-xl font-bold transition-colors"
        >
          + Record Outgoing Payment
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
        {payments.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No payments recorded for this supplier yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                  <th className="p-4 font-bold text-gray-600 dark:text-gray-300">Date</th>
                  <th className="p-4 font-bold text-gray-600 dark:text-gray-300">Amount</th>
                  <th className="p-4 font-bold text-gray-600 dark:text-gray-300">Method</th>
                  <th className="p-4 font-bold text-gray-600 dark:text-gray-300">Reference</th>
                  <th className="p-4 font-bold text-gray-600 dark:text-gray-300">Linked Booking</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {payments.map(payment => (
                  <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="p-4 text-gray-900 dark:text-white">
                      {payment.paidAt ? format(new Date(payment.paidAt), 'dd MMM yyyy') : '-'}
                    </td>
                    <td className="p-4 font-bold text-red-600 dark:text-red-400">
                      ₹{Number(payment.amount).toLocaleString('en-IN')}
                    </td>
                    <td className="p-4 text-gray-600 dark:text-gray-300 uppercase text-xs font-bold">
                      {payment.paymentMethod}
                    </td>
                    <td className="p-4 text-gray-600 dark:text-gray-300">
                      {payment.reference || '-'}
                    </td>
                    <td className="p-4 text-gray-600 dark:text-gray-300">
                      {payment.bookingId ? (
                        <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded text-xs font-bold">
                          Booking ID: {payment.bookingId.slice(0, 8)}...
                        </span>
                      ) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-lg p-6 shadow-2xl border border-gray-200 dark:border-gray-800 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">Record Outgoing Payment</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Amount Sent *</label>
                <input 
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 outline-none focus:ring-2 focus:ring-primary/50 text-xl font-bold"
                  placeholder="0.00"
                  min="1"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Payment Method *</label>
                  <select 
                    value={paymentMethod}
                    onChange={e => setPaymentMethod(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="upi">UPI</option>
                    <option value="cash">Cash</option>
                    <option value="card">Credit/Debit Card</option>
                    <option value="cheque">Cheque</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Date Paid *</label>
                  <input 
                    type="datetime-local"
                    value={paidAt}
                    onChange={e => setPaidAt(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 outline-none focus:ring-2 focus:ring-primary/50"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Reference ID (UTR, Txn ID)</label>
                <input 
                  type="text"
                  value={reference}
                  onChange={e => setReference(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="e.g. UTR Number"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Link to Booking (Optional UUID)</label>
                <input 
                  type="text"
                  value={bookingId}
                  onChange={e => setBookingId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Booking ID..."
                />
                <p className="text-xs text-gray-500 mt-1">If this payment is specifically for a booking, enter its ID.</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Notes</label>
                <textarea 
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Additional details..."
                  rows={2}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-6 py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-colors"
                >
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
