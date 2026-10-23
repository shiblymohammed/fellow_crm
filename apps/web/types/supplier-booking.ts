import { Supplier } from './supplier';

export type PackageCategory = 'hotel' | 'flight' | 'transfer' | 'activity' | 'tour' | 'meal' | 'visa' | 'insurance' | 'other';
export type SupplierBookingStatus = 'pending' | 'confirmed' | 'cancelled';

export interface SupplierBooking {
  id: string;
  tenantId: string;
  bookingId: string;
  supplierId: string;
  serviceType: PackageCategory;
  description?: string;
  amount: number;
  status: SupplierBookingStatus;
  confirmationRef?: string;
  createdAt: string;
  updatedAt: string;
  supplier?: Supplier;
}

export interface CreateSupplierBookingDto {
  supplierId: string;
  bookingId: string;
  serviceType: PackageCategory;
  description?: string;
  amount: number;
  status?: SupplierBookingStatus;
  confirmationRef?: string;
}

export interface UpdateSupplierBookingDto extends Partial<CreateSupplierBookingDto> {}
