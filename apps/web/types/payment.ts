export type PaymentType = 'advance' | 'installment' | 'balance' | 'refund';
export type PaymentMethod = 'cash' | 'bank_transfer' | 'upi' | 'cheque' | 'card' | 'other';
export type PaymentScheduleStatus = 'pending' | 'partially_paid' | 'paid' | 'overdue';

export interface PaymentSchedule {
  id: string;
  tenantId: string;
  bookingId: string;
  amountDue: number;
  amountPaid: number;
  dueDate: string;
  label?: string;
  status: PaymentScheduleStatus;
  reminderSent: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  tenantId: string;
  bookingId: string;
  customerId: string;
  paymentScheduleId?: string;
  amount: number;
  paymentType: PaymentType;
  paymentMethod: PaymentMethod;
  reference?: string;
  receiptUrl?: string;
  paidAt: string;
  notes?: string;
  recordedBy: string;
  createdAt: string;
  updatedAt: string;
  recordedByUser?: {
    name: string;
  };
}

export interface CreatePaymentDto {
  bookingId: string;
  customerId: string;
  paymentScheduleId?: string;
  amount: number;
  paymentType: PaymentType;
  paymentMethod: PaymentMethod;
  reference?: string;
  paidAt: string;
  notes?: string;
}
