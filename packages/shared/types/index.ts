// User & Auth
export interface User {
  id: string;
  tenantId: string | null;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  isActive: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  AGENCY_OWNER = 'agency_owner',
  MANAGER = 'manager',
  SALES = 'sales',
  OPERATIONS = 'operations',
  ACCOUNTS = 'accounts',
}

// Customer
export interface Customer {
  id: string;
  tenantId: string;
  name: string;
  email: string | null;
  phone: string;
  whatsapp: string | null;
  city: string | null;
  state: string | null;
  source: LeadSource;
  notes: string | null;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Lead
export interface Lead {
  id: string;
  tenantId: string;
  customerId: string;
  destination: string | null;
  travelDate: Date | null;
  returnDate: Date | null;
  adults: number;
  children: number;
  infants: number;
  budgetPerPerson: number | null;
  preferredHotels: string | null;
  specialRequests: string | null;
  source: LeadSource;
  status: LeadStatus;
  assignedTo: string | null;
  lostReason: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export enum LeadSource {
  WHATSAPP = 'whatsapp',
  PHONE = 'phone',
  WEBSITE = 'website',
  WALK_IN = 'walk_in',
  INSTAGRAM = 'instagram',
  FACEBOOK = 'facebook',
  GOOGLE = 'google',
  REFERRAL = 'referral',
}

export enum LeadStatus {
  NEW = 'new',
  CONTACTED = 'contacted',
  INTERESTED = 'interested',
  QUOTATION_SENT = 'quotation_sent',
  NEGOTIATING = 'negotiating',
  WON = 'won',
  LOST = 'lost',
  COLD = 'cold',
}

// Booking
export interface Booking {
  id: string;
  tenantId: string;
  bookingNumber: string;
  quotationId: string | null;
  customerId: string;
  destination: string;
  travelDate: Date;
  returnDate: Date | null;
  adults: number;
  children: number;
  infants: number;
  packageId: string | null;
  totalAmount: number;
  amountPaid: number;
  balance: number;
  status: BookingStatus;
  assignedSales: string | null;
  assignedOps: string | null;
  notes: string | null;
  cancelledAt: Date | null;
  cancelReason: string | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum BookingStatus {
  CONFIRMED = 'confirmed',
  DOCUMENTS_PENDING = 'documents_pending',
  VISA_PROCESSING = 'visa_processing',
  READY = 'ready',
  TRAVELLING = 'travelling',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

// Quotation
export enum QuotationStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  VIEWED = 'viewed',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
  REVISED = 'revised',
}

// Payment
export enum PaymentType {
  ADVANCE = 'advance',
  INSTALLMENT = 'installment',
  BALANCE = 'balance',
  REFUND = 'refund',
}

export enum PaymentMethod {
  CASH = 'cash',
  BANK_TRANSFER = 'bank_transfer',
  UPI = 'upi',
  CHEQUE = 'cheque',
  CARD = 'card',
  OTHER = 'other',
}

// Document
export enum DocumentType {
  PASSPORT = 'passport',
  PHOTO = 'photo',
  PAN = 'pan',
  AADHAAR = 'aadhaar',
  VISA = 'visa',
  FLIGHT_TICKET = 'flight_ticket',
  INSURANCE = 'insurance',
  HOTEL_VOUCHER = 'hotel_voucher',
  OTHER = 'other',
}

export enum DocumentStatus {
  PENDING = 'pending',
  RECEIVED = 'received',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
  MISSING = 'missing',
}

// Visa
export enum VisaStatus {
  NOT_STARTED = 'not_started',
  COLLECTING_DOCS = 'collecting_docs',
  SUBMITTED = 'submitted',
  PROCESSING = 'processing',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

// Tenant
export enum TenantStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  EXPIRED = 'expired',
  TRIAL = 'trial',
}

export enum BillingCycle {
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  ANNUAL = 'annual',
}
