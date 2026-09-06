import { z } from 'zod';

// Auth Validators
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^\+?[1-9]\d{9,14}$/, 'Invalid phone number'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

// Lead Validators
export const createLeadSchema = z.object({
  customerId: z.string().uuid('Invalid customer ID'),
  destination: z.string().optional(),
  travelDate: z.string().datetime().optional(),
  returnDate: z.string().datetime().optional(),
  adults: z.number().int().min(1).default(1),
  children: z.number().int().min(0).default(0),
  infants: z.number().int().min(0).default(0),
  budgetPerPerson: z.number().positive().optional(),
  preferredHotels: z.string().optional(),
  specialRequests: z.string().optional(),
  source: z.enum([
    'whatsapp',
    'phone',
    'website',
    'walk_in',
    'instagram',
    'facebook',
    'google',
    'referral',
  ]),
});

// Customer Validators
export const createCustomerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email').optional(),
  phone: z.string().regex(/^\+?[1-9]\d{9,14}$/, 'Invalid phone number'),
  whatsapp: z.string().regex(/^\+?[1-9]\d{9,14}$/, 'Invalid WhatsApp number').optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  source: z.enum([
    'whatsapp',
    'phone',
    'website',
    'walk_in',
    'instagram',
    'facebook',
    'google',
    'referral',
  ]),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

// Booking Validators
export const createBookingSchema = z.object({
  customerId: z.string().uuid('Invalid customer ID'),
  quotationId: z.string().uuid().optional(),
  destination: z.string().min(2, 'Destination is required'),
  travelDate: z.string().datetime('Invalid travel date'),
  returnDate: z.string().datetime().optional(),
  adults: z.number().int().min(1, 'At least 1 adult required'),
  children: z.number().int().min(0).default(0),
  infants: z.number().int().min(0).default(0),
  packageId: z.string().uuid().optional(),
  totalAmount: z.number().positive('Total amount must be positive'),
  notes: z.string().optional(),
});

// Payment Validators
export const createPaymentSchema = z.object({
  bookingId: z.string().uuid('Invalid booking ID'),
  amount: z.number().positive('Amount must be positive'),
  paymentType: z.enum(['advance', 'installment', 'balance', 'refund']),
  paymentMethod: z.enum(['cash', 'bank_transfer', 'upi', 'cheque', 'card', 'other']),
  reference: z.string().optional(),
  paidAt: z.string().datetime('Invalid payment date'),
  notes: z.string().optional(),
});

// Package Validators
export const createPackageSchema = z.object({
  name: z.string().min(3, 'Package name must be at least 3 characters'),
  destination: z.string().min(2, 'Destination is required'),
  durationDays: z.number().int().min(1, 'Duration must be at least 1 day'),
  durationNights: z.number().int().min(0),
  description: z.string().optional(),
});

// Tenant Validators
export const createTenantSchema = z.object({
  name: z.string().min(3, 'Agency name must be at least 3 characters'),
  ownerName: z.string().min(2, 'Owner name is required'),
  ownerEmail: z.string().email('Invalid email address'),
  ownerPhone: z.string().regex(/^\+?[1-9]\d{9,14}$/, 'Invalid phone number'),
  planId: z.string().uuid('Invalid plan ID'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CreateLeadInput = z.infer<typeof createLeadSchema>;
export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
export type CreatePackageInput = z.infer<typeof createPackageSchema>;
export type CreateTenantInput = z.infer<typeof createTenantSchema>;
