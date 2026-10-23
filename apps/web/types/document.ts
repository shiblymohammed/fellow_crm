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

export interface TravellerDocument {
  id: string;
  tenantId: string;
  travellerId: string;
  bookingId: string;
  docType: DocumentType;
  fileUrl: string | null;
  fileName: string | null;
  status: DocumentStatus;
  rejectionNote: string | null;
  uploadedBy: string | null;
  uploadedAt: string | null;
  verifiedBy: string | null;
  verifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
  traveller?: {
    id: string;
    name: string;
  };
}

export interface CreateTravellerDocumentDto {
  travellerId: string;
  bookingId: string;
  docType: DocumentType;
  fileUrl?: string;
  fileName?: string;
  uploadedBy?: string;
}

export interface UpdateTravellerDocumentDto {
  travellerId?: string;
  bookingId?: string;
  docType?: DocumentType;
  fileUrl?: string;
  fileName?: string;
  status?: DocumentStatus;
  rejectionNote?: string;
  verifiedBy?: string;
}

export interface UploadDocumentDto {
  travellerId: string;
  bookingId: string;
  docType: DocumentType;
}

export interface DocumentStats {
  total: number;
  pending: number;
  received: number;
  verified: number;
  rejected: number;
  missing: number;
}

// Document type labels for UI
export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  [DocumentType.PASSPORT]: 'Passport',
  [DocumentType.PHOTO]: 'Photo',
  [DocumentType.PAN]: 'PAN Card',
  [DocumentType.AADHAAR]: 'Aadhaar Card',
  [DocumentType.VISA]: 'Visa',
  [DocumentType.FLIGHT_TICKET]: 'Flight Ticket',
  [DocumentType.INSURANCE]: 'Travel Insurance',
  [DocumentType.HOTEL_VOUCHER]: 'Hotel Voucher',
  [DocumentType.OTHER]: 'Other Document',
};

// Document status labels for UI
export const DOCUMENT_STATUS_LABELS: Record<DocumentStatus, string> = {
  [DocumentStatus.PENDING]: 'Pending',
  [DocumentStatus.RECEIVED]: 'Received',
  [DocumentStatus.VERIFIED]: 'Verified',
  [DocumentStatus.REJECTED]: 'Rejected',
  [DocumentStatus.MISSING]: 'Missing',
};

// Document status colors for badges
export const DOCUMENT_STATUS_COLORS: Record<DocumentStatus, string> = {
  [DocumentStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
  [DocumentStatus.RECEIVED]: 'bg-blue-100 text-blue-800',
  [DocumentStatus.VERIFIED]: 'bg-green-100 text-green-800',
  [DocumentStatus.REJECTED]: 'bg-red-100 text-red-800',
  [DocumentStatus.MISSING]: 'bg-gray-100 text-gray-800',
};

// Visual indicators (emoji/icons)
export const DOCUMENT_STATUS_INDICATORS: Record<DocumentStatus, string> = {
  [DocumentStatus.PENDING]: '🟡',
  [DocumentStatus.RECEIVED]: '🔵',
  [DocumentStatus.VERIFIED]: '🟢',
  [DocumentStatus.REJECTED]: '🔴',
  [DocumentStatus.MISSING]: '⚪',
};
