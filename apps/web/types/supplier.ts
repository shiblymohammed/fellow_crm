export interface Supplier {
  id: string;
  companyName: string;
  contactPerson?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  destination?: string;
  services: string[];
  paymentTerms?: string;
  contractUrl?: string;
  rating?: number;
  notes?: string;
  isActive: boolean;
  outstandingPayable?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSupplierDto {
  companyName: string;
  contactPerson?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  destination?: string;
  services?: string[];
  paymentTerms?: string;
  contractUrl?: string;
  rating?: number;
  notes?: string;
  isActive?: boolean;
}

export interface UpdateSupplierDto extends Partial<CreateSupplierDto> {}

export type SupplierPaymentStatus = 'pending' | 'paid' | 'overdue' | 'cancelled';

export interface SupplierPayment {
  id: string;
  tenantId: string;
  supplierId: string;
  bookingId?: string;
  amount: number;
  paymentMethod: 'cash' | 'bank_transfer' | 'upi' | 'cheque' | 'card' | 'other';
  reference?: string;
  paidAt?: string;
  status: SupplierPaymentStatus;
  dueDate?: string;
  notes?: string;
  recordedBy: string;
  createdAt: string;
  updatedAt: string;
  booking?: {
    bookingNumber: string;
    destination: string;
  };
  supplier?: {
    companyName: string;
  };
}

export interface CreateSupplierPaymentDto {
  supplierId: string;
  bookingId?: string;
  amount: number;
  paymentMethod: string;
  reference?: string;
  paidAt?: string;
  status?: SupplierPaymentStatus;
  notes?: string;
}
