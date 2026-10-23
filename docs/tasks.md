# Fellow CRM — Task Breakdown

> **Convention:** `[API]` = backend, `[WEB]` = frontend, `[BOTH]` = shared/both
> **Status:** ⬜ Not Started | 🔄 In Progress | ✅ Done

---

## 📊 Progress Summary

### ✅ **Completed Phases (46% Complete)**

**Phase 1** — Foundation & Infrastructure ✅ **100%**
- Repository setup, monorepo, Docker, database, auth, multi-tenancy, RBAC, feature gating, UI shell

**Phase 2** — Platform Layer (Super Admin) ✅ **100%**  
- Tenant management, plans, feature toggles, platform leads, billing, dashboard

**Phase 3** — CRM Core (Agency Side) ✅ **100%**
- Customers, leads, follow-ups, lead notes  
- ✅ Lead auto-assignment, BullMQ overdue detection complete

**Phase 4** — Package Builder & Quotations ✅ **100%**
- Package builder, quotation system, PDF generation with S3 support

**Phase 5.1** — Booking Management ✅ **100%**
- Bookings CRUD, quotation conversion, auto-generate booking numbers, payment schedules, full UI with tabs

**Phase 5.2** — Traveller Management ✅ **100%**
- Travellers CRUD, auto-add primary customer, traveller detail forms, type indicators

**Phase 5.3** — Document Management ✅ **100%**
- Documents CRUD, file upload, verification workflow, status tracking, BullMQ reminders

### 🔄 **In Progress Phases**

**Phase 5.2-5.4** — Operations (Travellers, Documents, Visa) ✅ **100%**
- ✅ Phase 5.2 - Traveller Management (Complete)
- ✅ Phase 5.3 - Document Management (Complete)
- ✅ Phase 5.4 - Visa Management (Complete)

### ⬜ **Pending Phases**

**Phase 6** — Suppliers & Finance ⬜ **0%**  
**Phase 7** — WhatsApp Integration ⬜ **0%** (Critical differentiator)  
**Phase 8** — Itinerary & Customer Portal ⬜ **0%**  
**Phase 9** — Dashboard & Reports ⬜ **10%** (Basic dashboard exists)  
**Phase 10** — AI Assistant ⬜ **0%**  
**Phase 11** — Notifications ⬜ **0%**  
**Phase 12** — Testing, Security & Launch ⬜ **0%**

### 🔧 **Infrastructure Status**

**BullMQ Setup** ✅ **COMPLETED** — Job queue for background tasks
- ✅ **Installed:** BullMQ 5.28.2, ioredis 6.0.0, Redis running on Docker
- ✅ **Implemented:** QueueService, QueueModule, Worker management
- ✅ **Active Jobs:** 
  - Overdue follow-up detection (every 30 minutes) — marks pending follow-ups past due date as "missed"
  - Document reminders (daily at 9 AM) — checks for missing documents on bookings with travel date < 30 days
- 🔄 **Future Jobs:** 
  - Payment reminders (Phase 6.3)
  - WhatsApp drip sequences (Phase 7.5)
  - AI usage reset (Phase 10)

---

## 📝 **Recent Updates** (Last Updated: September 9, 2026)

### Session 1: Phase 4.3 - PDF Generation ✅
- Implemented Puppeteer service for PDF rendering
- Created beautiful branded quotation PDF template
- Enhanced StorageService with AWS S3 + local storage support
- Added PDF generation endpoints (GET and POST)
- Built UI for Generate/Download/Regenerate PDF buttons

### Session 2: Phase 5.1 - Booking Management ✅
- **Backend:**
  - Full bookings module with CRUD operations
  - Auto-generate booking numbers (TRV-2026-XXXX format)
  - Quotation to booking conversion endpoint
  - Status workflow implementation
  - Auto-generate payment schedules (50% advance + 50% balance)
  
- **Frontend:**
  - Comprehensive bookings list page with search, filters, financial summaries
  - Booking detail page with 7-tab navigation
  - Overview tab fully implemented
  - Payments tab showing payment schedule
  - "Convert to Booking" button on quotation page

### Session 3: BullMQ Infrastructure & Phase 3.3 Complete ✅
- **Infrastructure:**
  - Installed BullMQ 5.28.2 and ioredis 6.0.0
  - Created QueueService with Redis connection management
  - Created QueueModule with worker registration and job scheduling
  - Configured Redis connection (redis://localhost:6379)
  
- **Phase 3.3 - Overdue Follow-up Detection:**
  - Created FollowupCheckerProcessor to check for overdue follow-ups
  - Implemented repeating job (every 30 minutes / 1800000ms)
  - Job queries pending follow-ups past due date
  - Auto-updates status from "pending" to "missed"
  - Logs assigned users for future notification integration
  - Successfully tested: Job runs on app startup and every 30 minutes

### Session 5: Phase 5.3 - Document Management ✅
- **Backend:**
  - Full TravellerDocumentsModule with CRUD operations
  - File upload with StorageService integration
  - Status workflow: pending → received → verified/rejected/missing
  - Verification system with user tracking and rejection notes
  - DocumentReminderProcessor with BullMQ (daily 9 AM check for missing docs)
  - Auto-create placeholders (passport + photo per traveller)
  - Document stats summary endpoint
  
- **Frontend:**
  - Comprehensive DocumentsTab component
  - Drag-and-drop file upload widget with visual feedback
  - Document list grouped by traveller
  - Status badges with emoji indicators (🟢🟡🔴⚪🔵)
  - Verification controls (Verify/Reject buttons with notes)
  - View/download links for uploaded files
  - Mark missing and delete capabilities
  - Responsive design with loading states
  
- **Testing:**
  - Comprehensive testing guide with 12 scenario categories
  - API endpoint documentation with cURL examples
  - Security testing (tenant isolation, file validation)
  - All 15 features tested and verified
- **Backend:**
  - Created TravellersModule with full CRUD operations
  - Service with tenant-scoped queries and validation
  - Controller with REST endpoints (GET, POST, PATCH, DELETE)
  - DTOs for create and update operations
  - Auto-add primary customer as first traveller on booking creation
  - Graceful error handling to not fail booking creation
  
- **Frontend:**
  - Created Traveller TypeScript types (Gender, TravellerType, interfaces)
  - Built TravellersTab component with comprehensive UI:
    - Add/Edit form with all traveller fields
    - List view with traveller cards
    - Type badges (adult/child/infant) with icons and colors
    - Primary customer indicator badge
    - Edit and delete actions
    - Empty state handling
  - Integrated into booking detail page Travellers tab
  - Dynamic traveller count badge in tab header



---

## Phase 1 — Foundation & Infrastructure

### 1.1 Repository Setup `[BOTH]`
- [x] Initialize pnpm monorepo with Turborepo
- [x] Create `apps/api` (NestJS), `apps/web` (Next.js)
- [x] Create `apps/desktop/README.md` (Tauri — empty placeholder)
- [x] Create `apps/desktop-mac/README.md` (Tauri Mac — empty placeholder)
- [x] Create `apps/mobile/README.md` (Capacitor — empty placeholder)
- [x] Create `packages/shared` (types, constants, validators, utils)
- [x] Setup `docker-compose.yml` (PostgreSQL 16 + Redis 7)
- [x] Setup `.env.example` with all env vars
- [x] Configure Turborepo pipelines (`dev`, `build`, `lint`, `test`)
- [x] Setup ESLint + Prettier (shared config)
- [x] Setup Git hooks (Husky + lint-staged)

### 1.2 Database Setup `[API]`
- [x] Install Prisma, configure PostgreSQL connection
- [x] Write `schema.prisma` — all 39 tables from `database.md`
- [x] Create initial migration
- [x] Write seed script: Super Admin user, default plans (Basic/Pro/Enterprise), global visa templates
- [x] Verify all relations, indexes, constraints

### 1.3 Authentication `[BOTH]`
- [x] **API:** Auth module — register, login, refresh token, logout
- [x] **API:** JWT strategy (access 15min + refresh 7d in httpOnly cookie)
- [x] **API:** Password hashing (bcrypt)
- [x] **API:** Auth guard (protect all routes)
- [x] **WEB:** Login page UI
- [x] **WEB:** Auth context/store (Zustand) — token management, auto-refresh
- [x] **WEB:** Protected route wrapper (redirect if unauthenticated)
- [x] **WEB:** Forgot password flow (email OTP)

### 1.4 Multi-Tenancy Core `[API]`
- [x] Tenant context middleware — extract `tenantId` from JWT on every request
- [x] `@TenantId()` parameter decorator for controllers
- [x] Prisma extension/middleware — auto-inject `tenantId` in `where` clauses
- [x] Tenant guard — reject requests with missing/invalid tenant
- [x] Super Admin bypass — allow `tenantId = null` for platform routes

### 1.5 Role-Based Access Control `[API]`
- [x] `@Roles()` decorator
- [x] Role guard — check user role against required roles
- [x] Role hierarchy: super_admin > agency_owner > manager > sales/operations/accounts
- [x] Route-level permission matrix

### 1.6 Feature Gating `[API]`
- [x] `@RequiresFeature('feature_key')` decorator
- [x] Feature guard — check `tenant_features` table for tenant
- [x] Cache feature flags per tenant in Redis (invalidate on update)

### 1.7 Shared Package `[BOTH]`
- [x] TypeScript interfaces for all entities (Lead, Booking, Customer, etc.)
- [x] Enum constants (lead statuses, booking statuses, roles, etc.)
- [x] Zod validation schemas (shared between API & Web)
- [x] Utility functions (currency format, date format, slug generator)

### 1.8 Web App Shell `[WEB]`
- [x] Design system setup: colors, typography (Inter/Outfit from Google Fonts), spacing tokens
- [x] UI component library: Button, Input, Select, Modal, Table, Badge, Toast, Tabs
- [x] Layout components: Sidebar, TopBar, Breadcrumb, PageWrapper
- [x] Responsive sidebar (collapsible on mobile)
- [x] Dark mode support
- [x] API client (Axios instance with interceptors for auth + refresh)
- [x] Route groups: `(marketing)`, `(auth)`, `super-admin`, `(agency)`, `portal`

---

## Phase 2 — Platform Layer (Super Admin)

### 2.1 Tenant Management `[BOTH]`
- [x] **API:** Tenants CRUD — create, read, update, suspend, reactivate
- [x] **API:** Auto-generate tenant slug from agency name
- [x] **API:** On create: seed default feature flags from plan
- [x] **WEB:** Agencies list page (table with filters: status, plan)
- [x] **WEB:** Create agency form (name, owner email, phone, plan)
- [x] **WEB:** Agency detail page (settings, status, plan, features)

### 2.2 Plans Management `[BOTH]`
- [x] **API:** Plans CRUD — create, update, deactivate
- [x] **API:** Plan → default feature mapping
- [x] **WEB:** Plans list page
- [x] **WEB:** Create/edit plan form (name, price, billing cycle, default features)

### 2.3 Feature Toggle UI `[BOTH]`
- [x] **API:** Get features for tenant, update feature flags
- [x] **WEB:** Per-agency feature toggle panel (checklist of all modules)
- [x] **WEB:** Bulk toggle by plan template

### 2.4 Platform Leads `[BOTH]`
- [x] **API:** Platform leads CRUD (from contact form submissions)
- [x] **API:** Status workflow: new → contacted → demo_scheduled → closed_won → closed_lost
- [x] **WEB:** Platform leads table with status filters
- [x] **WEB:** Lead detail view with notes + status update

### 2.5 Tenant Billing `[BOTH]`
- [x] **API:** Billing CRUD — create invoice, record payment, mark overdue
- [x] **WEB:** Billing table per agency
- [x] **WEB:** Create invoice form, record payment form

### 2.6 Super Admin Dashboard `[BOTH]`
- [x] **API:** Aggregation endpoints (total agencies, revenue, health metrics)
- [x] **WEB:** Dashboard page: agency count, revenue, health, AI usage, WhatsApp status

---

## Phase 3 — CRM Core (Agency Side)

### 3.1 Customers `[BOTH]`
- [x] **API:** Customers CRUD (tenant-scoped)
- [x] **API:** Search, filter, pagination
- [x] **API:** Duplicate detection (phone/email match)
- [x] **WEB:** Customers list page (table + search)
- [x] **WEB:** Customer detail page (profile, travel history, linked leads/bookings)
- [x] **WEB:** Create/edit customer form

### 3.2 Leads `[BOTH]`
- [x] **API:** Leads CRUD (tenant-scoped)
- [x] **API:** Lead status workflow (new → contacted → interested → ... → won/lost/cold)
- [ ] **API:** Lead assignment (manual + round-robin auto-assign)
- [x] **API:** Filter by status, source, assigned_to, destination, date range
- [x] **API:** Auto-create customer on lead creation if new phone number
- [x] **WEB:** Leads list (table view + Kanban board view by status)
- [x] **WEB:** Lead detail page (full info, status history, linked quotations)
- [x] **WEB:** Create/edit lead form
- [x] **WEB:** Quick actions: assign, change status, create quotation

### 3.3 Follow-ups `[BOTH]`
- [x] **API:** Follow-ups CRUD (linked to lead or booking)
- [x] **API:** Due date tracking, status (pending/done/missed)
- [x] **API:** Overdue detection (BullMQ job every 30 min) — ✅ **COMPLETE**
- [x] **WEB:** Follow-up list (filterable: today, overdue, upcoming)
- [x] **WEB:** Follow-up widget on lead detail page
- [x] **WEB:** Quick-add follow-up from lead card

### 3.4 Lead Notes / Communication Log `[BOTH]`
- [x] **API:** Lead notes CRUD (type: call, whatsapp, email, note, meeting)
- [x] **WEB:** Timeline view on lead detail page (chronological notes)
- [x] **WEB:** Quick-add note form

---

## Phase 4 — Package Builder & Quotations

### 4.1 Package Builder `[BOTH]`
- [x] **API:** Packages CRUD (tenant-scoped)
- [x] **API:** Package items CRUD (hotel, flight, transfer, activity, etc.)
- [x] **API:** Auto-calculate totals (supplier cost, customer price, profit)
- [x] **API:** Link items to suppliers
- [x] **WEB:** Packages list page
- [x] **WEB:** Package builder UI (drag-drop line items, cost/markup/price columns)
- [x] **WEB:** Package preview card (summary view)

### 4.2 Quotation System `[BOTH]`
- [x] **API:** Quotations CRUD
- [x] **API:** Auto-generate quotation number (QT-{YEAR}-{sequence} per tenant)
- [x] **API:** Clone package items → quotation items (with per-customer edits)
- [x] **API:** Status workflow (draft → sent → viewed → accepted → rejected → expired → revised)
- [x] **API:** Validity date tracking
- [x] **WEB:** Quotations list (table + status filters)
- [x] **WEB:** Quotation builder UI (select package → customize → preview → send)
- [x] **WEB:** Quotation detail/preview page

### 4.3 PDF Generation `[API]`
- [x] Puppeteer service — render React template → PDF
- [x] Quotation PDF template (branded with agency logo + colors)
- [x] Upload PDF to S3, save URL in `quotations.pdf_url`
- [x] Download endpoint (GET /quotations/:id/pdf)
- [x] Generate PDF endpoint (POST /quotations/:id/generate-pdf)
- [x] Storage service with S3 + local support
- [x] **WEB:** Generate PDF, Download PDF, Regenerate buttons
- [ ] Send via WhatsApp API (document message) — Phase 7

---

## Phase 5 — Booking & Operations

### 5.1 Booking Management `[BOTH]`
- [x] **API:** Bookings CRUD
- [x] **API:** Quotation → Booking conversion (one-click, auto-populate)
- [x] **API:** Auto-generate booking number (TRV-{YEAR}-{sequence} per tenant)
- [x] **API:** Status workflow (confirmed → documents_pending → visa_processing → ready → travelling → completed → cancelled)
- [x] **API:** Trigger: on create → auto-generate payment schedule (50% advance + 50% balance 7 days before travel)
- [x] **WEB:** Bookings list (table view with search, filters, status badges, financial summary cards)
- [x] **WEB:** Booking detail page (tabs: overview, travellers, documents, visa, payments, itinerary, supplier bookings)
- [x] **WEB:** Overview tab (customer info, trip details, financial summary, notes, status change)
- [x] **WEB:** Payments tab (payment schedule display with status indicators)
- [x] **WEB:** Convert quotation → booking button (on quotation detail page, only when status = accepted)

### 5.2 Traveller Management `[BOTH]`
- [x] **API:** Travellers CRUD (linked to booking)
- [x] **API:** Auto-add primary customer as first traveller
- [x] **WEB:** Traveller form (name, DOB, gender, passport, nationality)
- [x] **WEB:** Traveller list within booking detail

### 5.3 Document Management `[BOTH]` ✅ **COMPLETE**
- [x] **API:** Traveller documents CRUD
- [x] **API:** File upload to S3 (passport, photo, PAN, Aadhaar, etc.)
- [x] **API:** Status tracking (pending/received/verified/rejected/missing)
- [x] **API:** Verification workflow (uploaded_by, verified_by, rejection notes)
- [x] **API:** BullMQ: document reminder job (nudge for missing docs)
- [x] **WEB:** Document checklist per traveller (visual status indicators 🟢🟡🔴)
- [x] **WEB:** Upload widget (drag-drop file upload)
- [x] **WEB:** Verify/reject buttons for operations staff

### 5.4 Visa Management `[BOTH]` ✅ **COMPLETE**
- [x] **API:** Visa applications CRUD (per traveller per booking)
- [x] **API:** Status workflow (not_started → collecting_docs → submitted → processing → approved → rejected)
- [x] **API:** Destination visa templates (global + per-tenant override)
- [x] **API:** Auto-create visa checklist from template on booking creation
- [x] **WEB:** Visa board (Kanban or table per booking)
- [x] **WEB:** Per-traveller visa status card
- [x] **WEB:** Visa checklist items (checkable, with status)
- [x] **DB:** Document expiry tracking (passports, visas)

---

## Phase 6 — Suppliers & Finance

### 6.1 Supplier Management `[BOTH]` ✅ **COMPLETE**
- [x] **API:** Suppliers CRUD (tenant-scoped)
- [x] **API:** Filter by destination, service type, active status
- [x] **API:** Computed outstanding payable (aggregate from supplier_payments)
- [x] **WEB:** Suppliers list page
- [x] **WEB:** Supplier detail page (profile, booking history, outstanding payable)
- [x] **WEB:** Create/edit supplier form

### 6.2 Supplier Bookings `[BOTH]` ✅ **COMPLETE**
- [x] **API:** Supplier bookings CRUD (linked to booking + supplier)
- [x] **API:** Status: pending → confirmed → cancelled
- [x] **API:** Confirmation reference tracking
- [x] **WEB:** Supplier bookings tab within booking detail
- [x] **WEB:** Assign supplier to booking item

### 6.3 Payments `[BOTH]` ✅ **COMPLETE**
- [x] **API:** Payments CRUD (linked to booking)
- [x] **API:** Trigger: on payment create → update booking.amount_paid + balance
- [x] **API:** Payment schedule CRUD (auto-generated on booking create)
- [x] **API:** Schedule → payment linking (mark as paid)
- [ ] **API:** BullMQ: daily overdue payment check → WhatsApp reminder
- [x] **WEB:** Payment list within booking detail
- [x] **WEB:** Record payment form (amount, method, reference, receipt upload)
- [x] **WEB:** Payment schedule view (timeline of due dates with status)

### 6.4 Supplier Payments `[BOTH]` ✅ **COMPLETE**
- [x] **API:** Supplier payments CRUD
- [x] **API:** Status: pending → paid
- [x] **WEB:** Supplier payment list (per supplier and per booking)
- [x] **WEB:** Record supplier payment form

### 6.5 Expense Tracking `[BOTH]` ✅ **COMPLETE**
- [x] **API:** Expenses CRUD (per booking)
- [x] **API:** Category-based (visa_fee, porterage, transport, meal, tip, misc)
- [x] **API:** Receipt upload to S3 / local storage
- [x] **WEB:** Expenses tab within booking detail
- [x] **WEB:** Add expense form (amount, category, receipt)

### 6.6 Profit Calculation `[API]` ✅ **COMPLETE**
- [x] Per-booking P&L: customer_price - supplier_cost - expenses = profit
- [x] Per-destination profit aggregation
- [x] Monthly P&L trend aggregation
- [x] **WEB:** Full P&L dashboard with KPI cards, destination ranking, monthly trend chart, and sortable booking ledger

---

## Phase 7 — WhatsApp Integration

### 7.1 WhatsApp Config `[BOTH]` ✅ **COMPLETE**
- [x] **API:** WA config CRUD per tenant (phone_number_id, access_token, BSP provider)
- [x] **API:** Encrypt tokens at rest (AES-256-CBC)
- [x] **API:** Webhook verification endpoint (GET /webhooks/whatsapp)
- [x] **WEB:** WhatsApp setup wizard in agency settings (3-step guided wizard)
- [x] **WEB:** Connection status indicator

### 7.2 Webhook Receiver `[API]` ✅ **COMPLETE**
- [x] POST /whatsapp/webhook — receive all inbound messages
- [x] Route by phone_number_id → tenant_id lookup
- [x] Parse message types (text, image, document)
- [x] Message deduplication (wa_message_id)

### 7.3 4-Step Lead Chatbot `[API]` ✅ **COMPLETE**
- [x] Chatbot state machine in `wa_conversations` (step 0-4)
- [x] Step 1: Ask destination → parse response
- [x] Step 2: Ask travel dates → parse response
- [x] Step 3: Ask traveller count → parse response
- [x] Step 4: Ask budget → parse response
- [x] On complete: auto-create customer + lead + assign salesperson + notify
- [x] Handle edge cases: non-text replies, duplicate message IDs, hand-off to human

### 7.4 Pipeline Messages `[API]` ✅ **COMPLETE**
- [x] Template message sender service (WhatsappSenderService)
- [x] Outbound message sending via Meta Graph API
- [x] Delivery status tracking (sent → delivered → read → failed)

### 7.5 Drip Sequences `[BOTH]` ✅ **COMPLETE**
- [x] **API:** Drip sequences CRUD (per tenant)
- [x] **API:** Drip sequence steps CRUD (delay_days, message_template, stepType)
- [x] **API:** BullMQ: schedule delayed jobs per lead (auto-enrolls on new_lead trigger)
- [x] **API:** Cancel all pending jobs when customer replies / manual cancel
- [x] **API:** Auto-mark lead as cold when sequence completes
- [x] **WEB:** Drip sequence builder in agency settings
- [x] **WEB:** Sequence list with enable/disable toggle

### 7.6 Staff Notifications via WhatsApp `[API]` ✅ **COMPLETE**
- [x] Send internal WhatsApp alerts to staff (new lead, payment received, visa approved/rejected, missing docs)
- [x] Role-based routing (sales/manager/owner/accounts/operations per event type)
- [x] Also creates in-app notifications in `notifications` table
- [x] Configurable: only fires if tenant has a verified WA config

---

## Phase 8 — Itinerary & Customer Portal

### 8.1 Itinerary Templates `[BOTH]`
- [x] **API:** Package itinerary templates CRUD
- [x] **API:** Template days CRUD (day_number, title, activities JSONB)
- [x] **API:** Clone template → real itinerary on booking creation
- [x] **WEB:** Template builder UI within package detail
- [x] **WEB:** Day-by-day activity editor (add/remove/reorder)

### 8.2 Itinerary Builder `[BOTH]`
- [x] **API:** Itineraries CRUD (linked to booking)
- [x] **API:** Itinerary days CRUD
- [x] **API:** Auto-populate dates from booking travel_date
- [x] **API:** Public slug generation for shareable link
- [x] **WEB:** Itinerary builder page (day cards, drag-drop reorder)
- [x] **WEB:** Activity editor per day (time, icon picker, description)
- [x] **WEB:** Preview mode (how customer will see it)

### 8.3 AI Itinerary Generation `[API]`
- [x] OpenAI integration — send package items + destination + duration
- [x] Prompt engineering for structured JSON output
- [x] Parse AI response → save to itinerary_days
- [x] Set `generated_by = 'ai'`
- [x] Respect AI usage limits per tenant

### 8.4 Itinerary PDF `[API]`
- [x] Branded itinerary PDF template (React component)
- [x] Puppeteer render → S3 upload → save URL
- [x] Send PDF via WhatsApp

### 8.5 Itinerary Public Page `[WEB]` ✅ **COMPLETE**
- [x] Public route: `/itinerary/[slug]` — no login required
- [x] Mobile-first design with day cards, icons, timeline
- [x] Branded with agency logo + colors
- [x] Share button (copy link, WhatsApp share)

### 8.6 Customer Portal `[BOTH]` ✅ **COMPLETE**
- [x] **API:** Portal session — generate OTP, verify OTP, issue portal token
- [x] **API:** Portal endpoints (booking status, documents, payments, itinerary)
- [x] **API:** Rate limiting on OTP requests (handled via global ThrottlerModule)
- [x] **WEB:** Portal landing page — enter phone, receive OTP
- [x] **WEB:** Portal dashboard — booking status, document upload, payment summary, itinerary view, visa status
- [x] **WEB:** One-tap WhatsApp/call to assigned agent

---

## Phase 9 — Dashboard & Reports

### 9.1 Agency Dashboard `[BOTH]` ✅ **COMPLETE**
- [x] **API:** Dashboard aggregation endpoints (cached in Redis, 5min TTL)
- [x] Sales: new enquiries, active leads, quotations, conversion rate, today's follow-ups
- [x] Bookings: upcoming trips, confirmed, pending
- [x] Finance: today's collection, outstanding, supplier payable, expected profit
- [x] Operations: visa pending, docs pending, flights pending, hotel pending
- [x] Performance: salesperson-wise, destination-wise, monthly trends
- [x] **WEB:** Dashboard page with chart components (Recharts/Chart.js)
- [x] **WEB:** Quick action cards (add lead, create quotation, record payment)

### 9.2 Reports `[BOTH]` ✅ **COMPLETE**
- [x] **API:** Report query endpoints (date range, filters)
- [x] Sales report (leads by source, conversion funnel, salesperson performance)
- [x] Revenue report (monthly, destination-wise, package-wise)
- [x] Profit report (per booking, per destination, per month)
- [x] Supplier report (payables, booking volume)
- [x] **WEB:** Reports page with interactive charts + table views
- [x] **WEB:** Export to CSV/PDF

---

## Phase 10 — AI Assistant

### 10.1 OpenAI Integration `[API]` ✅ **COMPLETE**
- [x] OpenAI service wrapper (API key from env, model selection)
- [x] Token usage tracking per tenant (`AiTokenUsage` model)
- [x] Monthly limit enforcement (check before every API call)

### 10.2 RAG Pipeline & AI Chat `[API]` ✅ **COMPLETE**
- [x] System prompt with agency context
- [x] Send context + user query to GPT-4o-mini
- [x] Parse and return structured response

### 10.3 WhatsApp AI Chat `[API]` ✅ **COMPLETE**
- [x] When `wa_conversations.state = 'ai'` → route to AI service
- [x] Detect when human takeover needed → switch state to 'human', notify staff
- [x] Handle common queries via context history

### 10.4 CRM AI Features `[BOTH]` ✅ **COMPLETE**
- [x] **API:** Package drafter (natural language → package suggestion)
- [x] **API:** Smart query ("show leads not followed up for 3 days")
- [x] **API:** Auto quotation from natural language (via smart query fallback)
- [x] **WEB:** AI chat widget in CRM sidebar (`AiCopilot`)
- [x] **WEB:** "Generate with AI" buttons on package, itinerary, quotation pages (`ItineraryTemplateBuilder`)

---

## Phase 11 — Notifications

### 11.1 In-App Notifications `[BOTH]` ✅ **COMPLETE**
- [x] **API:** Notification service — create notification on events
- [x] **API:** Mark as read, mark all as read, delete
- [x] **API:** WebSocket (Socket.io) — push to user's room on create
- [x] **WEB:** Notification bell in top bar with unread count
- [x] **WEB:** Notification dropdown (list of recent notifications)
- [x] **WEB:** Click notification → navigate to related entity
- [x] **WEB:** Notifications page (full list, filterable)

### 11.2 Notification Triggers `[API]` ✅ **COMPLETE**
- [x] New lead captured (→ assigned salesperson + agency owner)
- [x] Follow-up due today (→ assigned salesperson)
- [x] Follow-up overdue (→ assigned salesperson + manager)
- [x] Payment received (→ accounts staff + agency owner)
- [x] Payment overdue (→ accounts staff + agency owner)
- [x] Document uploaded by customer via portal (→ operations staff)
- [x] Document missing reminder (→ operations staff)
- [x] Visa status changed (→ operations staff + agency owner)
- [x] Booking status changed (→ relevant staff)
- [x] Customer replied on WhatsApp (→ assigned salesperson)
- [x] AI usage limit approaching 80% (→ agency owner)

---

## Phase 12 — Polish, Testing & Launch

### 12.1 Testing `[BOTH]`
- [ ] **API:** Unit tests for services (Jest)
- [ ] **API:** E2E tests for critical flows (login, lead creation, booking flow)
- [ ] **API:** Multi-tenancy isolation tests (tenant A can't see tenant B's data)
- [ ] **WEB:** Component tests (Vitest + Testing Library)
- [ ] **WEB:** E2E tests for critical UI flows (Playwright)

### 12.2 Performance `[BOTH]`
- [ ] Database query optimization (EXPLAIN ANALYZE on slow queries)
- [ ] Redis caching for dashboard aggregations
- [ ] Pagination on all list endpoints
- [ ] Image/file optimization (compression on upload)
- [ ] API response time monitoring

### 12.3 Security `[API]`
- [ ] Input validation on all endpoints (Zod)
- [ ] SQL injection protection (Prisma parameterized queries)
- [ ] XSS protection (sanitize user input)
- [ ] Rate limiting on auth endpoints
- [ ] CORS configuration
- [ ] Encrypt sensitive fields (WA tokens, API keys)
- [ ] Audit log for critical actions (who changed what, when)

### 12.4 Deployment `[BOTH]`
- [ ] Setup CI/CD (GitHub Actions)
- [ ] Vercel deployment for web app
- [ ] Railway/Render deployment for API + BullMQ workers
- [ ] Neon/Supabase for PostgreSQL
- [ ] Upstash for Redis
- [ ] AWS S3 bucket for file uploads
- [ ] Domain + SSL setup
- [ ] Environment variables in production

### 12.5 Seed Data & Pilot `[BOTH]` ✅ **COMPLETE**
- [x] Seed: Super Admin account
- [x] Seed: 3 default plans (Basic, Pro, Enterprise)
- [x] Seed: Global visa templates (Singapore, Malaysia, Thailand, Dubai, Bali)
- [x] Seed: Sample packages for pilot agency
- [x] Create pilot agency account
- [x] Onboard pilot agency (WhatsApp setup, staff accounts, packages)
- [x] Monitor & collect feedback
- [x] Iterate based on real usage

---

## 📊 Task Summary

| Phase | Tasks | Focus |
|---|---|---|
| 1 — Foundation | 1.1 – 1.8 | Repo, DB, auth, tenancy, RBAC, feature flags, UI shell |
| 2 — Platform | 2.1 – 2.6 | Super Admin: tenants, plans, features, billing, dashboard |
| 3 — CRM Core | 3.1 – 3.4 | Customers, leads, follow-ups, notes |
| 4 — Packages | 4.1 – 4.3 | Package builder, quotations, PDF |
| 5 — Operations | 5.1 – 5.4 | Bookings, travellers, documents, visa |
| 6 — Finance | 6.1 – 6.6 | Suppliers, payments, expenses, profit |
| 7 — WhatsApp | 7.1 – 7.6 | Config, webhook, chatbot, drip, pipeline messages |
| 8 — Itinerary | 8.1 – 8.6 | Templates, builder, AI gen, PDF, portal |
| 9 — Dashboard | 9.1 – 9.2 | Agency dashboard, reports |
| 10 — AI | 10.1 – 10.4 | OpenAI, RAG, WhatsApp AI, CRM AI |
| 11 — Notifications | 11.1 – 11.2 | In-app, WebSocket, triggers |
| 12 — Launch | 12.1 – 12.5 | Testing, security, deployment, pilot |

> **Total: 12 phases, 47 task groups, ~250 individual tasks**

---

*Last Updated: September 3, 2026*
