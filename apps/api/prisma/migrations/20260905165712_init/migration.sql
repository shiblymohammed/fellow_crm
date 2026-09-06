-- CreateEnum
CREATE TYPE "TenantStatus" AS ENUM ('active', 'suspended', 'expired', 'trial');

-- CreateEnum
CREATE TYPE "BillingCycle" AS ENUM ('monthly', 'quarterly', 'annual');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('super_admin', 'agency_owner', 'manager', 'sales', 'operations', 'accounts');

-- CreateEnum
CREATE TYPE "PlatformLeadStatus" AS ENUM ('new', 'contacted', 'demo_scheduled', 'closed_won', 'closed_lost');

-- CreateEnum
CREATE TYPE "BillingStatus" AS ENUM ('pending', 'paid', 'overdue', 'cancelled');

-- CreateEnum
CREATE TYPE "LeadSource" AS ENUM ('whatsapp', 'phone', 'website', 'walk_in', 'instagram', 'facebook', 'google', 'referral');

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('new', 'contacted', 'interested', 'quotation_sent', 'negotiating', 'won', 'lost', 'cold');

-- CreateEnum
CREATE TYPE "FollowupType" AS ENUM ('call', 'whatsapp', 'email', 'visit', 'other');

-- CreateEnum
CREATE TYPE "FollowupStatus" AS ENUM ('pending', 'done', 'missed');

-- CreateEnum
CREATE TYPE "LeadNoteType" AS ENUM ('call', 'whatsapp', 'email', 'note', 'meeting');

-- CreateEnum
CREATE TYPE "PackageCategory" AS ENUM ('hotel', 'flight', 'transfer', 'activity', 'tour', 'meal', 'visa', 'insurance', 'other');

-- CreateEnum
CREATE TYPE "MarkupType" AS ENUM ('fixed', 'percentage');

-- CreateEnum
CREATE TYPE "QuotationStatus" AS ENUM ('draft', 'sent', 'viewed', 'accepted', 'rejected', 'expired', 'revised');

-- CreateEnum
CREATE TYPE "SentVia" AS ENUM ('whatsapp', 'email', 'both');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('confirmed', 'documents_pending', 'visa_processing', 'ready', 'travelling', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('male', 'female', 'other');

-- CreateEnum
CREATE TYPE "TravellerType" AS ENUM ('adult', 'child', 'infant');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('passport', 'photo', 'pan', 'aadhaar', 'visa', 'flight_ticket', 'insurance', 'hotel_voucher', 'other');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('pending', 'received', 'verified', 'rejected', 'missing');

-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('advance', 'installment', 'balance', 'refund');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('cash', 'bank_transfer', 'upi', 'cheque', 'card', 'other');

-- CreateEnum
CREATE TYPE "PaymentScheduleStatus" AS ENUM ('pending', 'paid', 'overdue');

-- CreateEnum
CREATE TYPE "SupplierPaymentStatus" AS ENUM ('pending', 'paid');

-- CreateEnum
CREATE TYPE "ExpenseCategory" AS ENUM ('visa_fee', 'porterage', 'transport', 'meal', 'tip', 'miscellaneous');

-- CreateEnum
CREATE TYPE "BspProvider" AS ENUM ('meta_direct', 'wati', 'interakt', 'twilio');

-- CreateEnum
CREATE TYPE "WaConversationState" AS ENUM ('chatbot', 'ai', 'human', 'opted_out');

-- CreateEnum
CREATE TYPE "MessageDirection" AS ENUM ('inbound', 'outbound');

-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('text', 'image', 'document', 'template');

-- CreateEnum
CREATE TYPE "MessageStatus" AS ENUM ('sent', 'delivered', 'read', 'failed');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('new_lead', 'followup_due', 'payment_received', 'payment_overdue', 'document_missing', 'visa_update', 'booking_update', 'system');

-- CreateEnum
CREATE TYPE "VisaStatus" AS ENUM ('not_started', 'collecting_docs', 'submitted', 'processing', 'approved', 'rejected');

-- CreateEnum
CREATE TYPE "VisaChecklistStatus" AS ENUM ('pending', 'received', 'not_applicable');

-- CreateEnum
CREATE TYPE "SupplierBookingStatus" AS ENUM ('pending', 'confirmed', 'cancelled');

-- CreateEnum
CREATE TYPE "ItineraryGeneratedBy" AS ENUM ('manual', 'template', 'ai');

-- CreateEnum
CREATE TYPE "DripTrigger" AS ENUM ('new_lead', 'quotation_sent', 'payment_pending', 'docs_pending', 'post_trip');

-- CreateEnum
CREATE TYPE "DripStepType" AS ENUM ('whatsapp', 'email');

-- CreateEnum
CREATE TYPE "DripJobStatus" AS ENUM ('scheduled', 'sent', 'cancelled', 'failed');

-- CreateEnum
CREATE TYPE "AiConversationSource" AS ENUM ('whatsapp', 'crm_chat');

-- CreateTable
CREATE TABLE "tenants" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "owner_name" VARCHAR(255),
    "owner_email" VARCHAR(255) NOT NULL,
    "owner_phone" VARCHAR(20),
    "plan_id" UUID,
    "status" "TenantStatus" NOT NULL DEFAULT 'trial',
    "trial_ends_at" TIMESTAMPTZ(6),
    "subscription_ends_at" TIMESTAMPTZ(6),
    "booking_sequence" INTEGER NOT NULL DEFAULT 0,
    "quotation_sequence" INTEGER NOT NULL DEFAULT 0,
    "ai_enabled" BOOLEAN NOT NULL DEFAULT false,
    "ai_conversations_used" INTEGER NOT NULL DEFAULT 0,
    "ai_conversations_limit" INTEGER NOT NULL DEFAULT 0,
    "ai_model" VARCHAR(50) NOT NULL DEFAULT 'gpt-4o-mini',
    "ai_usage_reset_at" DATE,
    "logo_url" VARCHAR(500),
    "primary_color" VARCHAR(10),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plans" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "price" DECIMAL(10,2),
    "billing_cycle" "BillingCycle" NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant_features" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "feature_key" VARCHAR(100) NOT NULL,
    "is_enabled" BOOLEAN NOT NULL DEFAULT false,
    "config" JSONB,
    "updated_by" UUID,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "tenant_features_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(20),
    "password_hash" VARCHAR(255) NOT NULL,
    "role" "UserRole" NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform_leads" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(255),
    "email" VARCHAR(255),
    "phone" VARCHAR(20),
    "agency_name" VARCHAR(255),
    "message" TEXT,
    "source" VARCHAR(100),
    "status" "PlatformLeadStatus" NOT NULL DEFAULT 'new',
    "notes" TEXT,
    "assigned_to" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "platform_leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant_billing" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "invoice_number" VARCHAR(100),
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" VARCHAR(10) NOT NULL DEFAULT 'INR',
    "status" "BillingStatus" NOT NULL DEFAULT 'pending',
    "due_date" DATE,
    "paid_at" TIMESTAMPTZ(6),
    "payment_method" VARCHAR(100),
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "tenant_billing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customers" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255),
    "phone" VARCHAR(20) NOT NULL,
    "whatsapp" VARCHAR(20),
    "city" VARCHAR(100),
    "state" VARCHAR(100),
    "source" "LeadSource" NOT NULL,
    "notes" TEXT,
    "tags" TEXT[],
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leads" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "customer_id" UUID NOT NULL,
    "destination" VARCHAR(255),
    "travel_date" DATE,
    "return_date" DATE,
    "adults" INTEGER NOT NULL DEFAULT 1,
    "children" INTEGER NOT NULL DEFAULT 0,
    "infants" INTEGER NOT NULL DEFAULT 0,
    "budget_per_person" DECIMAL(10,2),
    "preferred_hotels" TEXT,
    "special_requests" TEXT,
    "source" "LeadSource" NOT NULL,
    "status" "LeadStatus" NOT NULL DEFAULT 'new',
    "assigned_to" UUID,
    "lost_reason" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "followups" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "lead_id" UUID,
    "booking_id" UUID,
    "assigned_to" UUID NOT NULL,
    "due_at" TIMESTAMPTZ(6) NOT NULL,
    "type" "FollowupType" NOT NULL,
    "note" TEXT,
    "status" "FollowupStatus" NOT NULL DEFAULT 'pending',
    "completed_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "followups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lead_notes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "lead_id" UUID NOT NULL,
    "created_by" UUID NOT NULL,
    "type" "LeadNoteType" NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lead_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "packages" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "destination" VARCHAR(255) NOT NULL,
    "duration_days" INTEGER NOT NULL,
    "duration_nights" INTEGER NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "packages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "package_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "package_id" UUID NOT NULL,
    "category" "PackageCategory" NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "supplier_id" UUID,
    "supplier_cost" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "markup_type" "MarkupType" NOT NULL DEFAULT 'fixed',
    "markup_value" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "customer_price" DECIMAL(10,2) NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "package_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quotations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "quotation_number" VARCHAR(50) NOT NULL,
    "lead_id" UUID,
    "customer_id" UUID NOT NULL,
    "package_id" UUID,
    "destination" VARCHAR(255),
    "travel_date" DATE,
    "return_date" DATE,
    "adults" INTEGER NOT NULL DEFAULT 1,
    "children" INTEGER NOT NULL DEFAULT 0,
    "infants" INTEGER NOT NULL DEFAULT 0,
    "total_supplier_cost" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total_customer_price" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "gross_profit" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "status" "QuotationStatus" NOT NULL DEFAULT 'draft',
    "valid_until" DATE,
    "notes" TEXT,
    "pdf_url" VARCHAR(500),
    "sent_via" "SentVia",
    "sent_at" TIMESTAMPTZ(6),
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "quotations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quotation_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "quotation_id" UUID NOT NULL,
    "category" "PackageCategory" NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "supplier_id" UUID,
    "supplier_cost" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "customer_price" DECIMAL(10,2) NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quotation_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "booking_number" VARCHAR(50) NOT NULL,
    "quotation_id" UUID,
    "customer_id" UUID NOT NULL,
    "destination" VARCHAR(255) NOT NULL,
    "travel_date" DATE NOT NULL,
    "return_date" DATE,
    "adults" INTEGER NOT NULL DEFAULT 1,
    "children" INTEGER NOT NULL DEFAULT 0,
    "infants" INTEGER NOT NULL DEFAULT 0,
    "package_id" UUID,
    "total_amount" DECIMAL(12,2) NOT NULL,
    "amount_paid" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "balance" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "status" "BookingStatus" NOT NULL DEFAULT 'confirmed',
    "assigned_sales" UUID,
    "assigned_ops" UUID,
    "notes" TEXT,
    "cancelled_at" TIMESTAMPTZ(6),
    "cancel_reason" TEXT,
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "travellers" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "booking_id" UUID NOT NULL,
    "customer_id" UUID,
    "name" VARCHAR(255) NOT NULL,
    "date_of_birth" DATE,
    "gender" "Gender",
    "type" "TravellerType" NOT NULL,
    "passport_number" VARCHAR(100),
    "passport_expiry" DATE,
    "place_of_birth" VARCHAR(100),
    "nationality" VARCHAR(100),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "travellers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "traveller_documents" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "traveller_id" UUID NOT NULL,
    "booking_id" UUID NOT NULL,
    "doc_type" "DocumentType" NOT NULL,
    "file_url" VARCHAR(500),
    "file_name" VARCHAR(255),
    "status" "DocumentStatus" NOT NULL DEFAULT 'pending',
    "rejection_note" TEXT,
    "uploaded_by" UUID,
    "uploaded_at" TIMESTAMPTZ(6),
    "verified_by" UUID,
    "verified_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "traveller_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "suppliers" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "company_name" VARCHAR(255) NOT NULL,
    "contact_person" VARCHAR(255),
    "phone" VARCHAR(20),
    "whatsapp" VARCHAR(20),
    "email" VARCHAR(255),
    "destination" VARCHAR(255),
    "services" TEXT[],
    "payment_terms" TEXT,
    "contract_url" VARCHAR(500),
    "rating" SMALLINT,
    "notes" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "suppliers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "booking_id" UUID NOT NULL,
    "customer_id" UUID NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "payment_type" "PaymentType" NOT NULL,
    "payment_method" "PaymentMethod" NOT NULL,
    "reference" VARCHAR(255),
    "receipt_url" VARCHAR(500),
    "paid_at" TIMESTAMPTZ(6) NOT NULL,
    "due_date" DATE,
    "notes" TEXT,
    "recorded_by" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_schedules" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "booking_id" UUID NOT NULL,
    "amount_due" DECIMAL(12,2) NOT NULL,
    "due_date" DATE NOT NULL,
    "label" VARCHAR(100),
    "status" "PaymentScheduleStatus" NOT NULL DEFAULT 'pending',
    "payment_id" UUID,
    "reminder_sent" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "payment_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supplier_payments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "supplier_id" UUID NOT NULL,
    "booking_id" UUID,
    "amount" DECIMAL(12,2) NOT NULL,
    "payment_method" "PaymentMethod" NOT NULL,
    "reference" VARCHAR(255),
    "paid_at" TIMESTAMPTZ(6),
    "status" "SupplierPaymentStatus" NOT NULL DEFAULT 'pending',
    "due_date" DATE,
    "notes" TEXT,
    "recorded_by" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "supplier_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expenses" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "booking_id" UUID NOT NULL,
    "category" "ExpenseCategory" NOT NULL,
    "description" VARCHAR(255) NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "receipt_url" VARCHAR(500),
    "expense_date" DATE NOT NULL,
    "recorded_by" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "expenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wa_configs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "wa_phone_number_id" VARCHAR(100) NOT NULL,
    "wa_access_token" TEXT NOT NULL,
    "wa_business_account_id" VARCHAR(100),
    "wa_webhook_verified" BOOLEAN NOT NULL DEFAULT false,
    "bsp_provider" "BspProvider" NOT NULL DEFAULT 'meta_direct',
    "bsp_api_key" TEXT,
    "connected_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "wa_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wa_conversations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "wa_phone" VARCHAR(20) NOT NULL,
    "lead_id" UUID,
    "chat_step" INTEGER NOT NULL DEFAULT 0,
    "chat_data" JSONB,
    "state" "WaConversationState" NOT NULL DEFAULT 'chatbot',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_message_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "wa_conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wa_messages" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "conversation_id" UUID NOT NULL,
    "direction" "MessageDirection" NOT NULL,
    "content" TEXT,
    "message_type" "MessageType" NOT NULL,
    "wa_message_id" VARCHAR(255),
    "status" "MessageStatus",
    "sent_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wa_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "body" TEXT,
    "entity_type" VARCHAR(50),
    "entity_id" UUID,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "read_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visa_applications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "booking_id" UUID NOT NULL,
    "traveller_id" UUID NOT NULL,
    "destination" VARCHAR(255) NOT NULL,
    "visa_type" VARCHAR(100),
    "status" "VisaStatus" NOT NULL DEFAULT 'not_started',
    "submitted_at" DATE,
    "expected_date" DATE,
    "approved_at" DATE,
    "visa_number" VARCHAR(100),
    "rejection_reason" TEXT,
    "visa_agent_id" UUID,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "visa_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visa_checklist_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "visa_id" UUID NOT NULL,
    "traveller_id" UUID NOT NULL,
    "item_name" VARCHAR(255) NOT NULL,
    "is_required" BOOLEAN NOT NULL DEFAULT true,
    "status" "VisaChecklistStatus" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "visa_checklist_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "destination_visa_templates" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID,
    "is_global" BOOLEAN NOT NULL DEFAULT false,
    "destination" VARCHAR(255) NOT NULL,
    "checklist_items" JSONB NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "destination_visa_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supplier_bookings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "booking_id" UUID NOT NULL,
    "supplier_id" UUID NOT NULL,
    "service_type" "PackageCategory" NOT NULL,
    "description" TEXT,
    "amount" DECIMAL(10,2) NOT NULL,
    "status" "SupplierBookingStatus" NOT NULL DEFAULT 'pending',
    "confirmation_ref" VARCHAR(255),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "supplier_bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "package_itinerary_templates" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "package_id" UUID NOT NULL,
    "title" VARCHAR(255),
    "created_by" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "package_itinerary_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "package_itinerary_template_days" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "template_id" UUID NOT NULL,
    "day_number" INTEGER NOT NULL,
    "title" VARCHAR(255),
    "description" TEXT,
    "activities" JSONB NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "package_itinerary_template_days_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "itineraries" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "booking_id" UUID NOT NULL,
    "title" VARCHAR(255),
    "public_slug" VARCHAR(100),
    "pdf_url" VARCHAR(500),
    "generated_by" "ItineraryGeneratedBy" NOT NULL DEFAULT 'manual',
    "template_id" UUID,
    "created_by" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "itineraries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "itinerary_days" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "itinerary_id" UUID NOT NULL,
    "day_number" INTEGER NOT NULL,
    "date" DATE,
    "title" VARCHAR(255),
    "description" TEXT,
    "activities" JSONB NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "itinerary_days_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "drip_sequences" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "trigger_stage" "DripTrigger" NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "drip_sequences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "drip_sequence_steps" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "sequence_id" UUID NOT NULL,
    "step_number" INTEGER NOT NULL,
    "delay_days" INTEGER NOT NULL,
    "message_template" TEXT NOT NULL,
    "step_type" "DripStepType" NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "drip_sequence_steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "drip_jobs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "sequence_id" UUID NOT NULL,
    "step_id" UUID NOT NULL,
    "lead_id" UUID NOT NULL,
    "customer_id" UUID NOT NULL,
    "scheduled_at" TIMESTAMPTZ(6) NOT NULL,
    "status" "DripJobStatus" NOT NULL DEFAULT 'scheduled',
    "sent_at" TIMESTAMPTZ(6),
    "bullmq_job_id" VARCHAR(255),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "drip_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "portal_sessions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "booking_id" UUID NOT NULL,
    "customer_id" UUID NOT NULL,
    "otp" VARCHAR(10),
    "otp_expires_at" TIMESTAMPTZ(6),
    "token" VARCHAR(255),
    "token_expires_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "portal_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_conversations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "lead_id" UUID,
    "wa_conversation_id" UUID,
    "source" "AiConversationSource" NOT NULL,
    "messages" JSONB NOT NULL,
    "tokens_used" INTEGER NOT NULL DEFAULT 0,
    "model" VARCHAR(50),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "ai_conversations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tenants_slug_key" ON "tenants"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "tenants_owner_email_key" ON "tenants"("owner_email");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_features_tenant_id_feature_key_key" ON "tenant_features"("tenant_id", "feature_key");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "customers_tenant_id_idx" ON "customers"("tenant_id");

-- CreateIndex
CREATE INDEX "leads_tenant_id_idx" ON "leads"("tenant_id");

-- CreateIndex
CREATE INDEX "leads_tenant_id_status_idx" ON "leads"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "leads_tenant_id_assigned_to_idx" ON "leads"("tenant_id", "assigned_to");

-- CreateIndex
CREATE INDEX "followups_tenant_id_due_at_status_idx" ON "followups"("tenant_id", "due_at", "status");

-- CreateIndex
CREATE INDEX "packages_tenant_id_idx" ON "packages"("tenant_id");

-- CreateIndex
CREATE INDEX "quotations_tenant_id_idx" ON "quotations"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "quotations_tenant_id_quotation_number_key" ON "quotations"("tenant_id", "quotation_number");

-- CreateIndex
CREATE INDEX "bookings_tenant_id_idx" ON "bookings"("tenant_id");

-- CreateIndex
CREATE INDEX "bookings_tenant_id_status_idx" ON "bookings"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "bookings_tenant_id_travel_date_idx" ON "bookings"("tenant_id", "travel_date");

-- CreateIndex
CREATE UNIQUE INDEX "bookings_tenant_id_booking_number_key" ON "bookings"("tenant_id", "booking_number");

-- CreateIndex
CREATE INDEX "traveller_documents_traveller_id_doc_type_idx" ON "traveller_documents"("traveller_id", "doc_type");

-- CreateIndex
CREATE INDEX "suppliers_tenant_id_idx" ON "suppliers"("tenant_id");

-- CreateIndex
CREATE INDEX "payments_booking_id_idx" ON "payments"("booking_id");

-- CreateIndex
CREATE INDEX "payments_tenant_id_idx" ON "payments"("tenant_id");

-- CreateIndex
CREATE INDEX "payment_schedules_tenant_id_due_date_status_idx" ON "payment_schedules"("tenant_id", "due_date", "status");

-- CreateIndex
CREATE UNIQUE INDEX "wa_configs_tenant_id_key" ON "wa_configs"("tenant_id");

-- CreateIndex
CREATE INDEX "wa_conversations_tenant_id_wa_phone_is_active_idx" ON "wa_conversations"("tenant_id", "wa_phone", "is_active");

-- CreateIndex
CREATE INDEX "notifications_tenant_id_idx" ON "notifications"("tenant_id");

-- CreateIndex
CREATE INDEX "notifications_user_id_is_read_created_at_idx" ON "notifications"("user_id", "is_read", "created_at");

-- CreateIndex
CREATE INDEX "visa_applications_booking_id_idx" ON "visa_applications"("booking_id");

-- CreateIndex
CREATE INDEX "visa_applications_tenant_id_idx" ON "visa_applications"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "package_itinerary_templates_package_id_key" ON "package_itinerary_templates"("package_id");

-- CreateIndex
CREATE UNIQUE INDEX "package_itinerary_templates_tenant_id_package_id_key" ON "package_itinerary_templates"("tenant_id", "package_id");

-- CreateIndex
CREATE UNIQUE INDEX "itineraries_booking_id_key" ON "itineraries"("booking_id");

-- CreateIndex
CREATE UNIQUE INDEX "itineraries_tenant_id_public_slug_key" ON "itineraries"("tenant_id", "public_slug");

-- CreateIndex
CREATE INDEX "drip_jobs_tenant_id_scheduled_at_status_idx" ON "drip_jobs"("tenant_id", "scheduled_at", "status");

-- CreateIndex
CREATE UNIQUE INDEX "portal_sessions_token_key" ON "portal_sessions"("token");

-- AddForeignKey
ALTER TABLE "tenants" ADD CONSTRAINT "tenants_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_features" ADD CONSTRAINT "tenant_features_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_billing" ADD CONSTRAINT "tenant_billing_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "followups" ADD CONSTRAINT "followups_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "followups" ADD CONSTRAINT "followups_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "followups" ADD CONSTRAINT "followups_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead_notes" ADD CONSTRAINT "lead_notes_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "packages" ADD CONSTRAINT "packages_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "package_items" ADD CONSTRAINT "package_items_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "packages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "package_items" ADD CONSTRAINT "package_items_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "packages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotation_items" ADD CONSTRAINT "quotation_items_quotation_id_fkey" FOREIGN KEY ("quotation_id") REFERENCES "quotations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotation_items" ADD CONSTRAINT "quotation_items_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_quotation_id_fkey" FOREIGN KEY ("quotation_id") REFERENCES "quotations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "packages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "travellers" ADD CONSTRAINT "travellers_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "traveller_documents" ADD CONSTRAINT "traveller_documents_traveller_id_fkey" FOREIGN KEY ("traveller_id") REFERENCES "travellers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suppliers" ADD CONSTRAINT "suppliers_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_recorded_by_fkey" FOREIGN KEY ("recorded_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_schedules" ADD CONSTRAINT "payment_schedules_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_payments" ADD CONSTRAINT "supplier_payments_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wa_configs" ADD CONSTRAINT "wa_configs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wa_conversations" ADD CONSTRAINT "wa_conversations_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wa_messages" ADD CONSTRAINT "wa_messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "wa_conversations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visa_applications" ADD CONSTRAINT "visa_applications_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visa_applications" ADD CONSTRAINT "visa_applications_traveller_id_fkey" FOREIGN KEY ("traveller_id") REFERENCES "travellers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visa_applications" ADD CONSTRAINT "visa_applications_visa_agent_id_fkey" FOREIGN KEY ("visa_agent_id") REFERENCES "suppliers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visa_checklist_items" ADD CONSTRAINT "visa_checklist_items_visa_id_fkey" FOREIGN KEY ("visa_id") REFERENCES "visa_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visa_checklist_items" ADD CONSTRAINT "visa_checklist_items_traveller_id_fkey" FOREIGN KEY ("traveller_id") REFERENCES "travellers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_bookings" ADD CONSTRAINT "supplier_bookings_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_bookings" ADD CONSTRAINT "supplier_bookings_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "package_itinerary_templates" ADD CONSTRAINT "package_itinerary_templates_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "packages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "package_itinerary_template_days" ADD CONSTRAINT "package_itinerary_template_days_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "package_itinerary_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itineraries" ADD CONSTRAINT "itineraries_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itineraries" ADD CONSTRAINT "itineraries_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "package_itinerary_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itinerary_days" ADD CONSTRAINT "itinerary_days_itinerary_id_fkey" FOREIGN KEY ("itinerary_id") REFERENCES "itineraries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drip_sequence_steps" ADD CONSTRAINT "drip_sequence_steps_sequence_id_fkey" FOREIGN KEY ("sequence_id") REFERENCES "drip_sequences"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drip_jobs" ADD CONSTRAINT "drip_jobs_sequence_id_fkey" FOREIGN KEY ("sequence_id") REFERENCES "drip_sequences"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drip_jobs" ADD CONSTRAINT "drip_jobs_step_id_fkey" FOREIGN KEY ("step_id") REFERENCES "drip_sequence_steps"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drip_jobs" ADD CONSTRAINT "drip_jobs_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drip_jobs" ADD CONSTRAINT "drip_jobs_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portal_sessions" ADD CONSTRAINT "portal_sessions_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portal_sessions" ADD CONSTRAINT "portal_sessions_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_conversations" ADD CONSTRAINT "ai_conversations_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_conversations" ADD CONSTRAINT "ai_conversations_wa_conversation_id_fkey" FOREIGN KEY ("wa_conversation_id") REFERENCES "wa_conversations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
