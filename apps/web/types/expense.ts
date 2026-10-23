export type ExpenseCategory = 'visa_fee' | 'porterage' | 'transport' | 'meal' | 'tip' | 'miscellaneous';

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  visa_fee: 'Visa Fee',
  porterage: 'Porterage',
  transport: 'Transport',
  meal: 'Meal',
  tip: 'Tip / Gratuity',
  miscellaneous: 'Miscellaneous',
};

export const EXPENSE_CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  visa_fee: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  porterage: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  transport: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  meal: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  tip: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
  miscellaneous: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
};

export interface Expense {
  id: string;
  tenantId: string;
  bookingId: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  receiptUrl?: string;
  expenseDate: string;
  recordedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExpenseDto {
  bookingId: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  expenseDate: string;
}
