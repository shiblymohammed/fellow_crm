// Feature Keys (for feature gating)
export const FEATURE_KEYS = {
  LEADS_CRM: 'leads_crm',
  PACKAGES: 'packages',
  QUOTATIONS: 'quotations',
  BOOKINGS: 'bookings',
  PAYMENTS: 'payments',
  DOCUMENTS: 'documents',
  VISA_MANAGEMENT: 'visa_management',
  SUPPLIER_MANAGEMENT: 'supplier_management',
  ITINERARY_BUILDER: 'itinerary_builder',
  WHATSAPP_CHATBOT: 'whatsapp_chatbot',
  WHATSAPP_AUTOMATION: 'whatsapp_automation',
  AI_ASSISTANT: 'ai_assistant',
  REPORTS_ANALYTICS: 'reports_analytics',
  PDF_GENERATION: 'pdf_generation',
  CUSTOMER_PORTAL: 'customer_portal',
} as const;

// Status Labels
export const LEAD_STATUS_LABELS = {
  new: 'New',
  contacted: 'Contacted',
  interested: 'Interested',
  quotation_sent: 'Quotation Sent',
  negotiating: 'Negotiating',
  won: 'Won',
  lost: 'Lost',
  cold: 'Cold',
} as const;

export const BOOKING_STATUS_LABELS = {
  confirmed: 'Confirmed',
  documents_pending: 'Documents Pending',
  visa_processing: 'Visa Processing',
  ready: 'Ready',
  travelling: 'Travelling',
  completed: 'Completed',
  cancelled: 'Cancelled',
} as const;

export const VISA_STATUS_LABELS = {
  not_started: 'Not Started',
  collecting_docs: 'Collecting Documents',
  submitted: 'Submitted',
  processing: 'Processing',
  approved: 'Approved',
  rejected: 'Rejected',
} as const;

// API Response Codes
export const API_ERROR_CODES = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  TENANT_NOT_FOUND: 'TENANT_NOT_FOUND',
  FEATURE_DISABLED: 'FEATURE_DISABLED',
  AI_LIMIT_EXCEEDED: 'AI_LIMIT_EXCEEDED',
  DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',
} as const;

// Defaults
export const DEFAULT_PAGINATION = {
  page: 1,
  limit: 20,
} as const;

export const DEFAULT_AI_CONVERSATIONS_LIMIT = {
  BASIC: 0,
  PRO: 0,
  ENTERPRISE: 2000,
} as const;
