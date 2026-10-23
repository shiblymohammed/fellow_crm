import React, { useState, useEffect } from 'react';
import { paymentsApi } from '@/lib/api';
import { Payment, PaymentSchedule, PaymentMethod, PaymentType } from '@/types/payment';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

interface Props {
  bookingId: string;
  customerId: string;
  onUpdate: () => void;
}

export default function PaymentsTab({ bookingId, customerId, onUpdate }: Props) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [schedules, setSchedules] = useState<PaymentSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form state
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bank_transfer');
  const [paymentType, setPaymentType] = useState<PaymentType>('installment');
  const [reference, setReference] = useState('');
  const [paidAt, setPaidAt] = useState(new Date().toISOString().slice(0, 16));
  const [notes, setNotes] = useState('');
  const [selectedScheduleId, setSelectedScheduleId] = useState<string>('');

  useEffect(() => {
    fetchData();
  }, [bookingId]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [paymentsData, schedulesData] = await Promise.all([
        paymentsApi.getAllByBooking(bookingId),
        paymentsApi.getSchedulesByBooking(bookingId),
      ]);
      setPayments(paymentsData);
      setSchedules(schedulesData);
    } catch (error) {
      toast.error('Failed to load payments data');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setAmount('');
    setPaymentMethod('bank_transfer');
    setPaymentType('installment');
    setReference('');
    setPaidAt(new Date().toISOString().slice(0, 16));
    setNotes('');
    setSelectedScheduleId('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      await paymentsApi.create({
        bookingId,
        customerId,
        amount: Number(amount),
        paymentMethod,
        paymentType,
        reference: reference || undefined,
        notes: notes || undefined,
        paidAt: new Date(paidAt).toISOString(),
        paymentScheduleId: selectedScheduleId || undefined,
      });

      toast.success('Payment recorded successfully');
      setIsModalOpen(false);
      resetForm();
      fetchData();
      onUpdate(); // refresh booking balance in parent
    } catch (error) {
      toast.error('Failed to record payment');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid': return <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-bold uppercase">Paid</span>;
      case 'partially_paid': return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-bold uppercase">Partial</span>;
      case 'overdue': return <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-bold uppercase">Overdue</span>;
      default: return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-bold uppercase">Pending</span>;
    }
  };

  if (isLoading) {
    return <div className="py-8 text-center text-gray-500">Loading payments...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Payments & Schedule</h3>
        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-xl font-bold transition-colors"
        >
          + Record Payment
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Schedules (Milestones) */}
        <div>
          <h4 className="text-md font-bold text-gray-700 dark:text-gray-300 mb-4">Payment Milestones</h4>
          {schedules.length === 0 ? (
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-center text-sm text-gray-500">
              No payment schedules generated.
            </div>
          ) : (
            <div className="space-y-3">
              {schedules.map((schedule) => {
                const amountDue = Number(schedule.amountDue);
                const amountPaid = Number(schedule.amountPaid);
                const remaining = amountDue - amountPaid;
                
                return (
                  <div key={schedule.id} className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm relative overflow-hidden">
                    {/* Progress Bar Background */}
                    <div 
                      className="absolute left-0 top-0 bottom-0 bg-green-50 dark:bg-green-900/20 z-0 transition-all"
                      style={{ width: `${(amountPaid / amountDue) * 100}%` }}
                    />
                    
                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white">{schedule.label || 'Installment'}</p>
                          <p className="text-xs text-gray-500">Due: {format(new Date(schedule.dueDate), 'MMM dd, yyyy')}</p>
                        </div>
                        {getStatusBadge(schedule.status)}
                      </div>
                      
                      <div className="flex justify-between items-end mt-4">
                        <div>
                          <p className="text-xs text-gray-500">Target Amount</p>
                          <p className="font-bold text-gray-900 dark:text-white">₹{amountDue.toLocaleString('en-IN')}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Paid: ₹{amountPaid.toLocaleString('en-IN')}</p>
                          <p className="text-xs font-bold text-primary">Pending: ₹{Math.max(0, remaining).toLocaleString('en-IN')}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Payment History */}
        <div>
          <h4 className="text-md font-bold text-gray-700 dark:text-gray-300 mb-4">Payment History</h4>
          {payments.length === 0 ? (
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-center text-sm text-gray-500">
              No payments recorded yet.
            </div>
          ) : (
            <div className="space-y-3">
              {payments.map((payment) => (
                <div key={payment.id} className="p-4 bg-white/60 dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center text-green-600">
                      ₹
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">
                        ₹{Number(payment.amount).toLocaleString('en-IN')}
                      </p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(payment.paidAt), 'MMM dd, yyyy')} • {payment.paymentMethod.toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs font-bold text-gray-600 dark:text-gray-300 uppercase">
                      {payment.paymentType}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">Ref: {payment.reference || '-'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-lg p-6 shadow-2xl border border-gray-200 dark:border-gray-800 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">Record Payment</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Amount Received *</label>
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
                    onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
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
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Payment Type</label>
                  <select 
                    value={paymentType}
                    onChange={e => setPaymentType(e.target.value as PaymentType)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="advance">Advance</option>
                    <option value="installment">Installment</option>
                    <option value="balance">Final Balance</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Reference ID</label>
                  <input 
                    type="text"
                    value={reference}
                    onChange={e => setReference(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="e.g. UTR Number"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Apply to Milestone (Optional)</label>
                <select 
                  value={selectedScheduleId}
                  onChange={e => setSelectedScheduleId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="">-- Let system assign automatically --</option>
                  {schedules.filter(s => s.status !== 'paid').map(s => (
                    <option key={s.id} value={s.id}>
                      {s.label} (Due: ₹{Number(s.amountDue) - Number(s.amountPaid)})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">If selected, this payment will be explicitly mapped to this milestone.</p>
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
                  Confirm Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
