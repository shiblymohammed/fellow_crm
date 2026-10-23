import React, { useState, useEffect, useRef } from 'react';
import { expensesApi } from '@/lib/api';
import { Expense, ExpenseCategory, EXPENSE_CATEGORY_LABELS, EXPENSE_CATEGORY_COLORS } from '@/types/expense';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

interface Props {
  bookingId: string;
}

const CATEGORIES: ExpenseCategory[] = ['visa_fee', 'porterage', 'transport', 'meal', 'tip', 'miscellaneous'];

export default function ExpensesTab({ bookingId }: Props) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [category, setCategory] = useState<ExpenseCategory>('visa_fee');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().slice(0, 10));
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  useEffect(() => {
    fetchExpenses();
  }, [bookingId]);

  const fetchExpenses = async () => {
    setIsLoading(true);
    try {
      const data = await expensesApi.getAllByBooking(bookingId);
      setExpenses(data);
    } catch {
      toast.error('Failed to load expenses');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setCategory('visa_fee');
    setDescription('');
    setAmount('');
    setExpenseDate(new Date().toISOString().slice(0, 10));
    setReceiptFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    setIsSubmitting(true);
    try {
      await expensesApi.create(
        { bookingId, category, description, amount: Number(amount), expenseDate },
        receiptFile || undefined,
      );
      toast.success('Expense recorded successfully');
      setIsModalOpen(false);
      resetForm();
      fetchExpenses();
    } catch {
      toast.error('Failed to record expense');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this expense?')) return;
    try {
      await expensesApi.delete(id);
      toast.success('Expense deleted');
      fetchExpenses();
    } catch {
      toast.error('Failed to delete expense');
    }
  };

  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

  if (isLoading) {
    return <div className="py-8 text-center text-gray-500">Loading expenses...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Expenses</h3>
          {expenses.length > 0 && (
            <p className="text-sm text-gray-500 mt-0.5">
              Total: <span className="font-bold text-red-600 dark:text-red-400">₹{totalExpenses.toLocaleString('en-IN')}</span>
            </p>
          )}
        </div>
        <button
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-xl font-bold transition-colors"
        >
          + Add Expense
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
        {expenses.length === 0 ? (
          <div className="p-10 text-center">
            <div className="text-4xl mb-3">🧾</div>
            <p className="text-gray-500 font-medium">No expenses recorded for this booking yet.</p>
            <p className="text-gray-400 text-sm mt-1">Track visa fees, meals, transport, and more.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                  <th className="p-4 font-bold text-gray-600 dark:text-gray-300">Date</th>
                  <th className="p-4 font-bold text-gray-600 dark:text-gray-300">Category</th>
                  <th className="p-4 font-bold text-gray-600 dark:text-gray-300">Description</th>
                  <th className="p-4 font-bold text-gray-600 dark:text-gray-300">Amount</th>
                  <th className="p-4 font-bold text-gray-600 dark:text-gray-300">Receipt</th>
                  <th className="p-4 font-bold text-gray-600 dark:text-gray-300"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {expenses.map(expense => (
                  <tr key={expense.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="p-4 text-gray-900 dark:text-white whitespace-nowrap">
                      {format(new Date(expense.expenseDate), 'dd MMM yyyy')}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${EXPENSE_CATEGORY_COLORS[expense.category]}`}>
                        {EXPENSE_CATEGORY_LABELS[expense.category]}
                      </span>
                    </td>
                    <td className="p-4 text-gray-700 dark:text-gray-300">{expense.description}</td>
                    <td className="p-4 font-bold text-red-600 dark:text-red-400 whitespace-nowrap">
                      ₹{Number(expense.amount).toLocaleString('en-IN')}
                    </td>
                    <td className="p-4">
                      {expense.receiptUrl ? (
                        <a
                          href={
                            expense.receiptUrl.startsWith('http')
                              ? expense.receiptUrl
                              : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}${expense.receiptUrl}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline text-sm font-bold flex items-center gap-1"
                        >
                          📎 View
                        </a>
                      ) : (
                        <span className="text-gray-400 text-sm">—</span>
                      )}
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleDelete(expense.id)}
                        className="text-red-500 hover:text-red-700 transition-colors text-sm"
                        title="Delete expense"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-lg p-6 shadow-2xl border border-gray-200 dark:border-gray-800 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">Record Expense</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Category *</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as ExpenseCategory)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{EXPENSE_CATEGORY_LABELS[cat]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Date *</label>
                  <input
                    type="date"
                    value={expenseDate}
                    onChange={e => setExpenseDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 outline-none focus:ring-2 focus:ring-primary/50"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Description *</label>
                <input
                  type="text"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="e.g. Visa processing fee for 4 pax"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Amount (₹) *</label>
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

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Upload Receipt (Optional)</label>
                <div
                  className="w-full px-4 py-5 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-center cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {receiptFile ? (
                    <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400">
                      <span>✅</span>
                      <span className="font-bold text-sm">{receiptFile.name}</span>
                    </div>
                  ) : (
                    <div className="text-gray-400">
                      <div className="text-2xl mb-1">📁</div>
                      <p className="text-sm">Click to upload receipt (PDF, JPG, PNG)</p>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept="image/*,.pdf"
                    onChange={e => setReceiptFile(e.target.files?.[0] || null)}
                  />
                </div>
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
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Record Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
