import axios from 'axios';

// Axios instance with auth + refresh token interceptors
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api',
  withCredentials: true, // send httpOnly refresh cookie
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach access token to every request
api.interceptors.request.use(config => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// On 401 — try refresh, then retry original request once
let isRefreshing = false;
// eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
let failedQueue: Array<{ resolve: (_token: string) => void; reject: (_err: unknown) => void }> = [];

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach(p => (error ? p.reject(error) : p.resolve(token as string)));
  failedQueue = [];
}

api.interceptors.response.use(
  res => res,
  async err => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        });
      }
      original._retry = true;
      isRefreshing = true;
      try {
        // Use basic axios to avoid interceptor loop if refresh also fails with 401
        const { data } = await axios.get(`${api.defaults.baseURL}/auth/refresh`, {
          withCredentials: true,
        });
        const newToken = data.data.accessToken;
        localStorage.setItem('access_token', newToken);
        processQueue(null, newToken);
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        localStorage.removeItem('access_token');
        // Clear Zustand auth state to prevent AuthGuard from redirecting back to dashboard
        try {
          const { useAuthStore } = require('@/stores/auth.store');
          useAuthStore.getState().clearAuth();
        } catch (e) {
          // Handle require error safely
        }
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(err);
  }
);

// ==========================================
// TRAVELLER DOCUMENTS API
// ==========================================

import type {
  TravellerDocument,
  CreateTravellerDocumentDto,
  UpdateTravellerDocumentDto,
  UploadDocumentDto,
  DocumentStats,
} from '@/types/document';

export const documentsApi = {
  // Get all documents (optionally filtered by booking or traveller)
  getAll: async (params?: { bookingId?: string; travellerId?: string }) => {
    const { data } = await api.get<{ data: TravellerDocument[] }>('/traveller-documents', { params });
    return data.data;
  },

  // Get single document by ID
  getOne: async (id: string) => {
    const { data } = await api.get<{ data: TravellerDocument }>(`/traveller-documents/${id}`);
    return data.data;
  },

  // Get document stats for a booking
  getStats: async (bookingId: string) => {
    const { data } = await api.get<{ data: DocumentStats }>(`/traveller-documents/stats/${bookingId}`);
    return data.data;
  },

  // Create document record
  create: async (dto: CreateTravellerDocumentDto) => {
    const { data } = await api.post<{ data: TravellerDocument }>('/traveller-documents', dto);
    return data.data;
  },

  // Update document
  update: async (id: string, dto: UpdateTravellerDocumentDto) => {
    const { data } = await api.patch<{ data: TravellerDocument }>(`/traveller-documents/${id}`, dto);
    return data.data;
  },

  // Upload document file
  upload: async (file: File, dto: UploadDocumentDto) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('travellerId', dto.travellerId);
    formData.append('bookingId', dto.bookingId);
    formData.append('docType', dto.docType);

    const { data } = await api.post<{ data: TravellerDocument }>('/traveller-documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data.data;
  },

  // Verify document
  verify: async (id: string) => {
    const { data } = await api.patch<{ data: TravellerDocument }>(`/traveller-documents/${id}/verify`);
    return data.data;
  },

  // Reject document with note
  reject: async (id: string, rejectionNote: string) => {
    const { data } = await api.patch<{ data: TravellerDocument }>(`/traveller-documents/${id}/reject`, {
      rejectionNote,
    });
    return data.data;
  },

  // Mark document as missing
  markMissing: async (id: string) => {
    const { data } = await api.patch<{ data: TravellerDocument }>(`/traveller-documents/${id}/mark-missing`);
    return data.data;
  },

  // Delete document
  delete: async (id: string) => {
    await api.delete(`/traveller-documents/${id}`);
  },

  // Create document placeholders for all travellers in booking
  createPlaceholders: async (bookingId: string) => {
    const { data } = await api.post<{ data: TravellerDocument[] }>(
      `/traveller-documents/create-placeholders/${bookingId}`
    );
    return data.data;
  },
};

// ==========================================
// VISA APPLICATIONS API
// ==========================================

import type {
  VisaApplication,
  CreateVisaApplicationDto,
  UpdateVisaApplicationDto,
  CreateChecklistItemDto,
  UpdateChecklistItemDto,
  DestinationVisaTemplate,
  CreateDestinationVisaTemplateDto,
  UpdateDestinationVisaTemplateDto,
  VisaStatus,
} from '@/types/visa';

export const visaApplicationsApi = {
  // Get all visa applications (optionally filtered)
  getAll: async (params?: {
    bookingId?: string;
    travellerId?: string;
    status?: VisaStatus;
    destination?: string;
  }) => {
    const { data } = await api.get<{ data: VisaApplication[] }>('/visa-applications', { params });
    return data.data;
  },

  // Get single visa application by ID
  getOne: async (id: string) => {
    const { data } = await api.get<{ data: VisaApplication }>(`/visa-applications/${id}`);
    return data.data;
  },

  // Create visa application
  create: async (dto: CreateVisaApplicationDto) => {
    const { data } = await api.post<{ data: VisaApplication }>('/visa-applications', dto);
    return data.data;
  },

  // Update visa application
  update: async (id: string, dto: UpdateVisaApplicationDto) => {
    const { data } = await api.patch<{ data: VisaApplication }>(`/visa-applications/${id}`, dto);
    return data.data;
  },

  // Update visa status
  updateStatus: async (id: string, status: VisaStatus) => {
    const { data } = await api.patch<{ data: VisaApplication }>(`/visa-applications/${id}/status`, { status });
    return data.data;
  },

  // Delete visa application
  delete: async (id: string) => {
    await api.delete(`/visa-applications/${id}`);
  },

  // Create from template
  createFromTemplate: async (params: {
    bookingId: string;
    travellerId: string;
    destination: string;
  }) => {
    const { data } = await api.post<{ data: VisaApplication }>('/visa-applications/from-template', params);
    return data.data;
  },

  // Get template for destination
  getTemplate: async (destination: string) => {
    const { data } = await api.get<{ data: DestinationVisaTemplate | null }>(
      `/visa-applications/templates/${destination}`
    );
    return data.data;
  },

  // Checklist item operations
  checklist: {
    create: async (dto: CreateChecklistItemDto) => {
      const { data } = await api.post('/visa-applications/checklist-items', dto);
      return data.data;
    },

    update: async (itemId: string, dto: UpdateChecklistItemDto) => {
      const { data } = await api.patch(`/visa-applications/checklist-items/${itemId}`, dto);
      return data.data;
    },

    delete: async (itemId: string) => {
      await api.delete(`/visa-applications/checklist-items/${itemId}`);
    },
  },
};

// ==========================================
// DESTINATION VISA TEMPLATES API
// ==========================================

export const visaTemplatesApi = {
  // Get all templates (including global)
  getAll: async (includeGlobal = true) => {
    const { data } = await api.get<{ data: DestinationVisaTemplate[] }>('/destination-visa-templates', {
      params: { includeGlobal },
    });
    return data.data;
  },

  // Get template by destination
  getByDestination: async (destination: string) => {
    const { data } = await api.get<{ data: DestinationVisaTemplate | null }>(
      `/destination-visa-templates/destination/${destination}`
    );
    return data.data;
  },

  // Get single template by ID
  getOne: async (id: string) => {
    const { data } = await api.get<{ data: DestinationVisaTemplate }>(`/destination-visa-templates/${id}`);
    return data.data;
  },

  // Create template
  create: async (dto: CreateDestinationVisaTemplateDto) => {
    const { data } = await api.post<{ data: DestinationVisaTemplate }>('/destination-visa-templates', dto);
    return data.data;
  },

  // Update template
  update: async (id: string, dto: UpdateDestinationVisaTemplateDto) => {
    const { data } = await api.patch<{ data: DestinationVisaTemplate }>(`/destination-visa-templates/${id}`, dto);
    return data.data;
  },

  // Delete template
  delete: async (id: string) => {
    await api.delete(`/destination-visa-templates/${id}`);
  },

  // Clone global template to tenant
  cloneGlobalTemplate: async (globalTemplateId: string) => {
    const { data } = await api.post<{ data: DestinationVisaTemplate }>(
      `/destination-visa-templates/${globalTemplateId}/clone`
    );
    return data.data;
  },
};

// ==========================================
// BOOKINGS - VISA GENERATION
// ==========================================

export const bookingsApi = {
  // Auto-generate visa applications for a booking
  generateVisas: async (bookingId: string) => {
    await api.post(`/bookings/${bookingId}/generate-visas`);
  },
};
// ==========================================
// SUPPLIERS API
// ==========================================

import type { Supplier, CreateSupplierDto, UpdateSupplierDto } from '@/types/supplier';

export const suppliersApi = {
  getAll: async (params?: { destination?: string; serviceType?: string; isActive?: boolean }) => {
    const { data } = await api.get<Supplier[]>('/suppliers', { params });
    return data;
  },

  getOne: async (id: string) => {
    const { data } = await api.get<Supplier>(`/suppliers/${id}`);
    return data;
  },

  create: async (dto: CreateSupplierDto) => {
    const { data } = await api.post<Supplier>('/suppliers', dto);
    return data;
  },

  update: async (id: string, dto: UpdateSupplierDto) => {
    const { data } = await api.patch<Supplier>(`/suppliers/${id}`, dto);
    return data;
  },

  delete: async (id: string) => {
    await api.delete(`/suppliers/${id}`);
  },
};

// ==========================================
// SUPPLIER BOOKINGS API
// ==========================================

import type { SupplierBooking, CreateSupplierBookingDto, UpdateSupplierBookingDto } from '@/types/supplier-booking';

export const supplierBookingsApi = {
  getAllByBooking: async (bookingId: string) => {
    const { data } = await api.get<SupplierBooking[]>('/supplier-bookings', { params: { bookingId } });
    return data;
  },

  create: async (dto: CreateSupplierBookingDto) => {
    const { data } = await api.post<SupplierBooking>('/supplier-bookings', dto);
    return data;
  },

  update: async (id: string, dto: UpdateSupplierBookingDto) => {
    const { data } = await api.patch<SupplierBooking>(`/supplier-bookings/${id}`, dto);
    return data;
  },

  delete: async (id: string) => {
    await api.delete(`/supplier-bookings/${id}`);
  },
};

// ==========================================
// PAYMENTS API
// ==========================================

import type { Payment, PaymentSchedule, CreatePaymentDto } from '@/types/payment';

export const paymentsApi = {
  getAllByBooking: async (bookingId: string) => {
    const { data } = await api.get<Payment[]>('/payments', { params: { bookingId } });
    return data;
  },

  getSchedulesByBooking: async (bookingId: string) => {
    const { data } = await api.get<PaymentSchedule[]>('/payments/schedules', { params: { bookingId } });
    return data;
  },

  create: async (dto: CreatePaymentDto) => {
    const { data } = await api.post<Payment>('/payments', dto);
    return data;
  }
};

// ==========================================
// SUPPLIER PAYMENTS API
// ==========================================

import type { SupplierPayment, CreateSupplierPaymentDto } from '@/types/supplier';

export const supplierPaymentsApi = {
  getAllBySupplier: async (supplierId: string) => {
    const { data } = await api.get<SupplierPayment[]>('/supplier-payments', { params: { supplierId } });
    return data;
  },

  getAllByBooking: async (bookingId: string) => {
    const { data } = await api.get<SupplierPayment[]>('/supplier-payments', { params: { bookingId } });
    return data;
  },

  create: async (dto: CreateSupplierPaymentDto) => {
    const { data } = await api.post<SupplierPayment>('/supplier-payments', dto);
    return data;
  }
};

// ==========================================
// EXPENSES API
// ==========================================

import type { Expense, CreateExpenseDto } from '@/types/expense';

export const expensesApi = {
  getAllByBooking: async (bookingId: string) => {
    const { data } = await api.get<Expense[]>('/expenses', { params: { bookingId } });
    return data;
  },

  create: async (dto: CreateExpenseDto, receiptFile?: File) => {
    const formData = new FormData();
    formData.append('bookingId', dto.bookingId);
    formData.append('category', dto.category);
    formData.append('description', dto.description);
    formData.append('amount', String(dto.amount));
    formData.append('expenseDate', dto.expenseDate);
    if (receiptFile) {
      formData.append('receipt', receiptFile);
    }
    const { data } = await api.post<Expense>('/expenses', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  delete: async (id: string) => {
    const { data } = await api.delete<Expense>(`/expenses/${id}`);
    return data;
  },
};

// ==========================================
// PROFIT / P&L API
// ==========================================

export interface BookingPnL {
  bookingId: string;
  bookingNumber: string;
  destination: string;
  travelDate: string;
  customerName: string;
  revenue: number;
  supplierCost: number;
  expenses: number;
  grossProfit: number;
  marginPercent: number;
  status: string;
}

export interface PnLSummary {
  totalRevenue: number;
  totalSupplierCost: number;
  totalExpenses: number;
  totalGrossProfit: number;
  avgMarginPercent: number;
  bookingCount: number;
  byDestination: { destination: string; revenue: number; profit: number; bookingCount: number }[];
  byMonth: { month: string; revenue: number; profit: number; bookingCount: number }[];
}

export const profitApi = {
  getSummary: async (params?: { fromDate?: string; toDate?: string; destination?: string }) => {
    const { data } = await api.get<PnLSummary>('/profit/summary', { params });
    return data;
  },

  getBookingsPnL: async (params?: { fromDate?: string; toDate?: string }) => {
    const { data } = await api.get<BookingPnL[]>('/profit/bookings', { params });
    return data;
  },

  getBookingPnL: async (bookingId: string) => {
    const { data } = await api.get<BookingPnL>(`/profit/bookings/${bookingId}`);
    return data;
  },
};
