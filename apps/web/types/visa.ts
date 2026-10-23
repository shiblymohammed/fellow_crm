export enum VisaStatus {
  NOT_STARTED = 'not_started',
  COLLECTING_DOCS = 'collecting_docs',
  SUBMITTED = 'submitted',
  PROCESSING = 'processing',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum VisaChecklistStatus {
  PENDING = 'pending',
  RECEIVED = 'received',
  NOT_APPLICABLE = 'not_applicable',
}

export interface VisaChecklistItem {
  id: string;
  tenantId: string;
  visaId: string;
  travellerId: string;
  itemName: string;
  isRequired: boolean;
  status: VisaChecklistStatus;
  createdAt: string;
  updatedAt: string;
}

export interface VisaApplication {
  id: string;
  tenantId: string;
  bookingId: string;
  travellerId: string;
  destination: string;
  visaType: string | null;
  status: VisaStatus;
  submittedAt: string | null;
  expectedDate: string | null;
  approvedAt: string | null;
  visaNumber: string | null;
  rejectionReason: string | null;
  visaAgentId: string | null;
  notes: string | null;
  expiryDate?: string | null;
  createdAt: string;
  updatedAt: string;
  traveller?: {
    id: string;
    name: string;
    passportNumber?: string | null;
  };
  booking?: {
    id: string;
    bookingNumber: string;
  };
  visaAgent?: {
    id: string;
    name: string;
  };
  checklistItems?: VisaChecklistItem[];
}

export interface CreateVisaApplicationDto {
  bookingId: string;
  travellerId: string;
  destination: string;
  visaType?: string;
  status?: VisaStatus;
  submittedAt?: string;
  expectedDate?: string;
  expiryDate?: string;
  visaAgentId?: string;
  notes?: string;
}

export interface UpdateVisaApplicationDto {
  destination?: string;
  visaType?: string;
  status?: VisaStatus;
  submittedAt?: string;
  expectedDate?: string;
  expiryDate?: string;
  approvedAt?: string;
  visaNumber?: string;
  rejectionReason?: string;
  visaAgentId?: string;
  notes?: string;
}

export interface CreateChecklistItemDto {
  visaId: string;
  travellerId: string;
  itemName: string;
  isRequired?: boolean;
  status?: VisaChecklistStatus;
}

export interface UpdateChecklistItemDto {
  itemName?: string;
  isRequired?: boolean;
  status?: VisaChecklistStatus;
}

export interface DestinationVisaTemplate {
  id: string;
  tenantId: string | null;
  isGlobal: boolean;
  destination: string;
  checklistItems: {
    itemName: string;
    isRequired?: boolean;
  }[];
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDestinationVisaTemplateDto {
  destination: string;
  isGlobal?: boolean;
  checklistItems: {
    itemName: string;
    isRequired?: boolean;
  }[];
  notes?: string;
}

export interface UpdateDestinationVisaTemplateDto {
  destination?: string;
  isGlobal?: boolean;
  checklistItems?: {
    itemName: string;
    isRequired?: boolean;
  }[];
  notes?: string;
}

// Visa status labels for UI
export const VISA_STATUS_LABELS: Record<VisaStatus, string> = {
  [VisaStatus.NOT_STARTED]: 'Not Started',
  [VisaStatus.COLLECTING_DOCS]: 'Collecting Documents',
  [VisaStatus.SUBMITTED]: 'Submitted',
  [VisaStatus.PROCESSING]: 'Processing',
  [VisaStatus.APPROVED]: 'Approved',
  [VisaStatus.REJECTED]: 'Rejected',
};

// Visa status colors for badges
export const VISA_STATUS_COLORS: Record<VisaStatus, string> = {
  [VisaStatus.NOT_STARTED]: 'bg-gray-100 text-gray-800',
  [VisaStatus.COLLECTING_DOCS]: 'bg-yellow-100 text-yellow-800',
  [VisaStatus.SUBMITTED]: 'bg-blue-100 text-blue-800',
  [VisaStatus.PROCESSING]: 'bg-purple-100 text-purple-800',
  [VisaStatus.APPROVED]: 'bg-green-100 text-green-800',
  [VisaStatus.REJECTED]: 'bg-red-100 text-red-800',
};

// Visual indicators (emoji/icons)
export const VISA_STATUS_INDICATORS: Record<VisaStatus, string> = {
  [VisaStatus.NOT_STARTED]: '⚪',
  [VisaStatus.COLLECTING_DOCS]: '🟡',
  [VisaStatus.SUBMITTED]: '🔵',
  [VisaStatus.PROCESSING]: '🟣',
  [VisaStatus.APPROVED]: '🟢',
  [VisaStatus.REJECTED]: '🔴',
};

// Visa checklist status labels
export const VISA_CHECKLIST_STATUS_LABELS: Record<VisaChecklistStatus, string> = {
  [VisaChecklistStatus.PENDING]: 'Pending',
  [VisaChecklistStatus.RECEIVED]: 'Received',
  [VisaChecklistStatus.NOT_APPLICABLE]: 'Not Applicable',
};

// Visa checklist status colors
export const VISA_CHECKLIST_STATUS_COLORS: Record<VisaChecklistStatus, string> = {
  [VisaChecklistStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
  [VisaChecklistStatus.RECEIVED]: 'bg-green-100 text-green-800',
  [VisaChecklistStatus.NOT_APPLICABLE]: 'bg-gray-100 text-gray-800',
};

// Visa checklist status indicators
export const VISA_CHECKLIST_STATUS_INDICATORS: Record<VisaChecklistStatus, string> = {
  [VisaChecklistStatus.PENDING]: '⏳',
  [VisaChecklistStatus.RECEIVED]: '✅',
  [VisaChecklistStatus.NOT_APPLICABLE]: '➖',
};
