# Fellow CRM — Task Breakdown

> **Convention:** `[API]` = backend, `[WEB]` = frontend, `[BOTH]` = shared/both
> **Status:** ⬜ Not Started | 🔄 In Progress | ✅ Done

---

## Phase 1 — Foundation & Infrastructure

### 1.1 Repository Setup `[BOTH]`
- [ ] Initialize pnpm monorepo with Turborepo
- [ ] Create `apps/api` (NestJS), `apps/web` (Next.js)
- [ ] Create `apps/desktop/README.md` (Tauri — empty placeholder)
- [ ] Create `apps/desktop-mac/README.md` (Tauri Mac — empty placeholder)
- [ ] Create `apps/mobile/README.md` (Capacitor — empty placeholder)
- [ ] Create `packages/shared` (types, constants, validators, utils)
- [ ] Setup `docker-compose.yml` (PostgreSQL 16 + Redis 7)
- [ ] Setup `.env.example` with all env vars
- [ ] Configure Turborepo pipelines (`dev`, `build`, `lint`, `test`)
- [ ] Setup ESLint + Prettier (shared config)
- [ ] Setup Git hooks (Husky + lint-staged)

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
- [ ] **WEB:** Forgot password flow (email OTP)

### 1.4 Multi-Tenancy Core `[API]`
- [x] Tenant context middleware — extract `tenantId` from JWT on every request
- [x] `@TenantId()` parameter decorator for controllers
- [ ] Prisma extension/middleware — auto-inject `tenantId` in `where` clauses
- [x] Tenant guard — reject requests with missing/invalid tenant
- [x] Super Admin bypass — allow `tenantId = null` for platform routes

### 1.5 Role-Based Access Control `[API]`
- [x] `@Roles()` decorator
- [x] Role guard — check user role against required roles
- [x] Role hierarchy: super_admin > agency_owner > manager > sales/operations/accounts
- [ ] Route-level permission matrix

### 1.6 Feature Gating `[API]`
- [ ] `@RequiresFeature('feature_key')` decorator
- [ ] Feature guard — check `tenant_features` table for tenant
- [ ] Cache feature flags per tenant in Redis (invalidate on update)

### 1.7 Shared Package `[BOTH]`
- [ ] TypeScript interfaces for all entities (Lead, Booking, Customer, etc.)
- [ ] Enum constants (lead statuses, booking statuses, roles, etc.)
- [ ] Zod validation schemas (shared between API & Web)
- [ ] Utility functions (currency format, date format, slug generator)

### 1.8 Web App Shell `[WEB]`
- [x] Design system setup: colors, typography (Inter/Outfit from Google Fonts), spacing tokens
- [ ] UI component library: Button, Input, Select, Modal, Table, Badge, Toast, Tabs
- [x] Layout components: Sidebar, TopBar, Breadcrumb, PageWrapper
- [x] Responsive sidebar (collapsible on mobile)
- [ ] Dark mode support
- [x] API client (Axios instance with interceptors for auth + refresh)
- [x] Route groups: `(marketing)`, `(auth)`, `super-admin`, `(agency)`, `portal`

---

## Phase 2 — Platform Layer (Super Admin)

### 2.1 Tenant Management `[BOTH]`
- [ ] **API:** Tenants CRUD — create, read, update, suspend, reactivate
- [ ] **API:** Auto-generate tenant slug from agency name
- [ ] **API:** On create: seed default feature flags from plan
- [ ] **WEB:** Agencies list page (table with filters: status, plan)
- [ ] **WEB:** Create agency form (name, owner email, phone, plan)
- [ ] **WEB:** Agency detail page (settings, status, plan, features)

### 2.2 Plans Management `[BOTH]`
- [ ] **API:** Plans CRUD — create, update, deactivate
- [ ] **API:** Plan → default feature mapping
- [ ] **WEB:** Plans list page
- [ ] **WEB:** Create/edit plan form (name, price, billing cycle, default features)

### 2.3 Feature Toggle UI `[BOTH]`
- [ ] **API:** Get features for tenant, update feature flags
- [ ] **WEB:** Per-agency feature toggle panel (checklist of all modules)
- [ ] **WEB:** Bulk toggle by plan template

### 2.4 Platform Leads `[BOTH]`
- [ ] **API:** Platform leads CRUD (from contact form submissions)
- [ ] **API:** Status workflow: new → contacted → demo_scheduled → closed_won → closed_lost
- [ ] **WEB:** Platform leads table with status filters
- [ ] **WEB:** Lead detail view with notes + status update

### 2.5 Tenant Billing `[BOTH]`
- [ ] **API:** Billing CRUD — create invoice, record payment, mark overdue
- [ ] **WEB:** Billing table per agency
- [ ] **WEB:** Create invoice form, record payment form

### 2.6 Super Admin Dashboard `[BOTH]`
- [ ] **API:** Aggregation endpoints (total agencies, revenue, health metrics)
- [ ] **WEB:** Dashboard page: agency count, revenue, health, AI usage, WhatsApp status

---

## Phase 3 — CRM Core (Agency Side)

### 3.1 Customers `[BOTH]`
- [ ] **API:** Customers CRUD (tenant-scoped)
- [ ] **API:** Search, filter, pagination
- [ ] **API:** Duplicate detection (phone/email match)
- [ ] **WEB:** Customers list page (table + search)
- [ ] **WEB:** Customer detail page (profile, travel history, linked leads/bookings)
- [ ] **WEB:** Create/edit customer form

### 3.2 Leads `[BOTH]`
- [ ] **API:** Leads CRUD (tenant-scoped)
- [ ] **API:** Lead status workflow (new → contacted → interested → ... → won/lost/cold)
- [ ] **API:** Lead assignment (manual + round-robin auto-assign)
- [ ] **API:** Filter by status, source, assigned_to, destination, date range
- [ ] **API:** Auto-create customer on lead creation if new phone number
- [ ] **WEB:** Leads list (table view + Kanban board view by status)
- [ ] **WEB:** Lead detail page (full info, status history, linked quotations)
- [ ] **WEB:** Create/edit lead form
- [ ] **WEB:** Quick actions: assign, change status, create quotation

### 3.3 Follow-ups `[BOTH]`
- [ ] **API:** Follow-ups CRUD (linked to lead or booking)
- [ ] **API:** Due date tracking, status (pending/done/missed)
- [ ] **API:** Overdue detection (BullMQ job every 30 min)
- [ ] **WEB:** Follow-up list (filterable: today, overdue, upcoming)
- [ ] **WEB:** Follow-up widget on lead detail page
- [ ] **WEB:** Quick-add follow-up from lead card

### 3.4 Lead Notes / Communication Log `[BOTH]`
- [ ] **API:** Lead notes CRUD (type: call, whatsapp, email, note, meeting)
- [ ] **WEB:** Timeline view on lead detail page (chronological notes)
- [ ] **WEB:** Quick-add note form

---

## Phase 4 — Package Builder & Quotations

### 4.1 Package Builder `[BOTH]`
- [ ] **API:** Packages CRUD (tenant-scoped)
- [ ] **API:** Package items CRUD (hotel, flight, transfer, activity, etc.)
- [ ] **API:** Auto-calculate totals (supplier cost, customer price, profit)
- [ ] **API:** Link items to suppliers
- [ ] **WEB:** Packages list page
- [ ] **WEB:** Package builder UI (drag-drop line items, cost/markup/price columns)
- [ ] **WEB:** Package preview card (summary view)

### 4.2 Quotation System `[BOTH]`
- [ ] **API:** Quotations CRUD
- [ ] **API:** Auto-generate quotation number (QT-{YEAR}-{sequence} per tenant)
- [ ] **API:** Clone package items → quotation items (with per-customer edits)
- [ ] **API:** Status workflow (draft → sent → viewed → accepted → rejected → expired → revised)
- [ ] **API:** Validity date tracking
- [ ] **WEB:** Quotations list (table + status filters)
- [ ] **WEB:** Quotation builder UI (select package → customize → preview → send)
- [ ] **WEB:** Quotation detail/preview page

### 4.3 PDF Generation `[API]`
- [ ] Puppeteer service — render React template → PDF
- [ ] Quotation PDF template (branded with agency logo + colors)
- [ ] Upload PDF to S3, save URL in `quotations.pdf_url`
- [ ] Download endpoint (GET /quotations/:id/pdf)
- [ ] Send via WhatsApp API (document message)

---

## Phase 5 — Booking & Operations

### 5.1 Booking Management `[BOTH]`
- [ ] **API:** Bookings CRUD
- [ ] **API:** Quotation → Booking conversion (one-click, auto-populate)
- [ ] **API:** Auto-generate booking number (TRV-{YEAR}-{sequence} per tenant)
- [ ] **API:** Status workflow (confirmed → documents_pending → visa_processing → ready → travelling → completed → cancelled)
- [ ] **API:** Trigger: on create → auto-generate payment schedule, document checklist, notification
- [ ] **WEB:** Bookings list (table + Kanban by status)
- [ ] **WEB:** Booking detail page (tabs: overview, travellers, documents, visa, payments, itinerary, supplier bookings)
- [ ] **WEB:** Convert quotation → booking button

### 5.2 Traveller Management `[BOTH]`
- [ ] **API:** Travellers CRUD (linked to booking)
- [ ] **API:** Auto-add primary customer as first traveller
- [ ] **WEB:** Traveller form (name, DOB, gender, passport, nationality)
- [ ] **WEB:** Traveller list within booking detail

### 5.3 Document Management `[BOTH]`
- [ ] **API:** Traveller documents CRUD
- [ ] **API:** File upload to S3 (passport, photo, PAN, Aadhaar, etc.)
- [ ] **API:** Status tracking (pending/received/verified/rejected/missing)
- [ ] **API:** Verification workflow (uploaded_by, verified_by, rejection notes)
- [ ] **API:** BullMQ: document reminder job (nudge for missing docs)
- [ ] **WEB:** Document checklist per traveller (visual status indicators 🟢🟡🔴)
- [ ] **WEB:** Upload widget (drag-drop file upload)
- [ ] **WEB:** Verify/reject buttons for operations staff

### 5.4 Visa Management `[BOTH]`
- [ ] **API:** Visa applications CRUD (per traveller per booking)
- [ ] **API:** Status workflow (not_started → collecting_docs → submitted → processing → approved → rejected)
- [ ] **API:** Destination visa templates (global + per-tenant override)
- [ ] **API:** Auto-create visa checklist from template on booking creation
- [ ] **WEB:** Visa board (Kanban or table per booking)
- [ ] **WEB:** Per-traveller visa status card
- [ ] **WEB:** Visa checklist items (checkable, with status)

---

## Phase 6 — Suppliers & Finance

### 6.1 Supplier Management `[BOTH]`
- [ ] **API:** Suppliers CRUD (tenant-scoped)
- [ ] **API:** Filter by destination, service type, active status
- [ ] **API:** Computed outstanding payable (aggregate from supplier_payments)
- [ ] **WEB:** Suppliers list page
- [ ] **WEB:** Supplier detail page (profile, booking history, outstanding payable)
- [ ] **WEB:** Create/edit supplier form

### 6.2 Supplier Bookings `[BOTH]`
- [ ] **API:** Supplier bookings CRUD (linked to booking + supplier)
- [ ] **API:** Status: pending → confirmed → cancelled
- [ ] **API:** Confirmation reference tracking
- [ ] **WEB:** Supplier bookings tab within booking detail
- [ ] **WEB:** Assign supplier to booking item

### 6.3 Payments `[BOTH]`
- [ ] **API:** Payments CRUD (linked to booking)
- [ ] **API:** Trigger: on payment create → update booking.amount_paid + balance
- [ ] **API:** Payment schedule CRUD (auto-generated on booking create)
- [ ] **API:** Schedule → payment linking (mark as paid)
- [ ] **API:** BullMQ: daily overdue payment check → WhatsApp reminder
- [ ] **WEB:** Payment list within booking detail
- [ ] **WEB:** Record payment form (amount, method, reference, receipt upload)
- [ ] **WEB:** Payment schedule view (timeline of due dates with status)

### 6.4 Supplier Payments `[BOTH]`
- [ ] **API:** Supplier payments CRUD
- [ ] **API:** Status: pending → paid
- [ ] **WEB:** Supplier payment list (per supplier and per booking)
- [ ] **WEB:** Record supplier payment form

### 6.5 Expense Tracking `[BOTH]`
- [ ] **API:** Expenses CRUD (per booking)
- [ ] **API:** Category-based (visa_fee, porterage, transport, meal, tip, misc)
- [ ] **API:** Receipt upload to S3
- [ ] **WEB:** Expenses tab within booking detail
- [ ] **WEB:** Add expense form (amount, category, receipt)

### 6.6 Profit Calculation `[API]`
- [ ] Per-booking P&L: customer_price - supplier_cost - expenses = profit
- [ ] Per-destination profit aggregation
- [ ] Per-salesperson profit aggregation
- [ ] Monthly/quarterly/annual profit trends

---

## Phase 7 — WhatsApp Integration

### 7.1 WhatsApp Config `[BOTH]`
- [ ] **API:** WA config CRUD per tenant (phone_number_id, access_token, BSP provider)
- [ ] **API:** Encrypt tokens at rest
- [ ] **API:** Webhook verification endpoint (GET /webhooks/whatsapp)
- [ ] **WEB:** WhatsApp setup wizard in agency settings (guided step-by-step)
- [ ] **WEB:** Connection status indicator

### 7.2 Webhook Receiver `[API]`
- [ ] POST /webhooks/whatsapp — receive all inbound messages
- [ ] Route by phone_number_id → tenant_id lookup
- [ ] Parse message types (text, image, document)
- [ ] Message deduplication (wa_message_id)

### 7.3 4-Step Lead Chatbot `[API]`
- [ ] Chatbot state machine in `wa_conversations` (step 0-4)
- [ ] Step 1: Ask destination → parse response
- [ ] Step 2: Ask travel dates → parse response
- [ ] Step 3: Ask traveller count → parse response
- [ ] Step 4: Ask budget → parse response
- [ ] On complete: auto-create customer + lead + assign salesperson + notify
- [ ] Handle edge cases: non-text replies, random messages, restart flow

### 7.4 Pipeline Messages `[API]`
- [ ] Template message sender service
- [ ] Trigger messages on status changes (quotation sent, payment received, visa approved, etc.)
- [ ] Message templates per trigger type
- [ ] Delivery status tracking (sent → delivered → read → failed)

### 7.5 Drip Sequences `[BOTH]`
- [ ] **API:** Drip sequences CRUD (per tenant)
- [ ] **API:** Drip sequence steps CRUD (delay_days, message_template)
- [ ] **API:** BullMQ: schedule delayed jobs per lead
- [ ] **API:** Cancel all pending jobs when customer replies
- [ ] **API:** Auto-mark lead as cold when sequence completes
- [ ] **WEB:** Drip sequence builder in agency settings
- [ ] **WEB:** Sequence list with enable/disable toggle

### 7.6 Staff Notifications via WhatsApp `[API]`
- [ ] Send internal WhatsApp alerts to staff (new lead, overdue payment, visa rejected)
- [ ] Configurable per agency (which events trigger staff WhatsApp)

---

## Phase 8 — Itinerary & Customer Portal

### 8.1 Itinerary Templates `[BOTH]`
- [ ] **API:** Package itinerary templates CRUD
- [ ] **API:** Template days CRUD (day_number, title, activities JSONB)
- [ ] **API:** Clone template → real itinerary on booking creation
- [ ] **WEB:** Template builder UI within package detail
- [ ] **WEB:** Day-by-day activity editor (add/remove/reorder)

### 8.2 Itinerary Builder `[BOTH]`
- [ ] **API:** Itineraries CRUD (linked to booking)
- [ ] **API:** Itinerary days CRUD
- [ ] **API:** Auto-populate dates from booking travel_date
- [ ] **API:** Public slug generation for shareable link
- [ ] **WEB:** Itinerary builder page (day cards, drag-drop reorder)
- [ ] **WEB:** Activity editor per day (time, icon picker, description)
- [ ] **WEB:** Preview mode (how customer will see it)

### 8.3 AI Itinerary Generation `[API]`
- [ ] OpenAI integration — send package items + destination + duration
- [ ] Prompt engineering for structured JSON output
- [ ] Parse AI response → save to itinerary_days
- [ ] Set `generated_by = 'ai'`
- [ ] Respect AI usage limits per tenant

### 8.4 Itinerary PDF `[API]`
- [ ] Branded itinerary PDF template (React component)
- [ ] Puppeteer render → S3 upload → save URL
- [ ] Send PDF via WhatsApp

### 8.5 Itinerary Public Page `[WEB]`
- [ ] Public route: `/itinerary/[slug]` — no login required
- [ ] Mobile-first design with day cards, icons, timeline
- [ ] Branded with agency logo + colors
- [ ] Share button (copy link, WhatsApp share)

### 8.6 Customer Portal `[BOTH]`
- [ ] **API:** Portal session — generate OTP, verify OTP, issue portal token
- [ ] **API:** Portal endpoints (booking status, documents, payments, itinerary)
- [ ] **API:** Rate limiting on OTP requests
- [ ] **WEB:** Portal landing page — enter phone, receive OTP
- [ ] **WEB:** Portal dashboard — booking status, document upload, payment summary, itinerary view, visa status
- [ ] **WEB:** One-tap WhatsApp/call to assigned agent

---

## Phase 9 — Dashboard & Reports

### 9.1 Agency Dashboard `[BOTH]`
- [ ] **API:** Dashboard aggregation endpoints (cached in Redis, 5min TTL)
- [ ] Sales: new enquiries, active leads, quotations, conversion rate, today's follow-ups
- [ ] Bookings: upcoming trips, confirmed, pending
- [ ] Finance: today's collection, outstanding, supplier payable, expected profit
- [ ] Operations: visa pending, docs pending, flights pending, hotel pending
- [ ] Performance: salesperson-wise, destination-wise, monthly trends
- [ ] **WEB:** Dashboard page with chart components (Recharts/Chart.js)
- [ ] **WEB:** Quick action cards (add lead, create quotation, record payment)

### 9.2 Reports `[BOTH]`
- [ ] **API:** Report query endpoints (date range, filters)
- [ ] Sales report (leads by source, conversion funnel, salesperson performance)
- [ ] Revenue report (monthly, destination-wise, package-wise)
- [ ] Profit report (per booking, per destination, per month)
- [ ] Supplier report (payables, booking volume)
- [ ] **WEB:** Reports page with interactive charts + table views
- [ ] **WEB:** Export to CSV/PDF

---

## Phase 10 — AI Assistant

### 10.1 OpenAI Integration `[API]`
- [ ] OpenAI service wrapper (API key from env, model selection)
- [ ] Token usage tracking per tenant
- [ ] Monthly limit enforcement (check before every API call)
- [ ] Rate limiting per tenant

### 10.2 RAG Pipeline `[API]`
- [ ] Context builder: fetch agency's packages, pricing, visa requirements, FAQs
- [ ] System prompt with agency context
- [ ] Send context + user query to GPT-4o-mini
- [ ] Parse and return structured response

### 10.3 WhatsApp AI Chat `[API]`
- [ ] When `wa_conversations.state = 'ai'` → route to AI service
- [ ] Detect when human takeover needed → switch state to 'human', notify staff
- [ ] Handle common queries: pricing, availability, documents needed

### 10.4 CRM AI Features `[BOTH]`
- [ ] **API:** Package drafter (natural language → package suggestion)
- [ ] **API:** Smart query ("show leads not followed up for 3 days")
- [ ] **API:** Auto quotation from natural language
- [ ] **WEB:** AI chat widget in CRM sidebar
- [ ] **WEB:** "Generate with AI" buttons on package, itinerary, quotation pages

---

## Phase 11 — Notifications

### 11.1 In-App Notifications `[BOTH]`
- [ ] **API:** Notification service — create notification on events
- [ ] **API:** Mark as read, mark all as read, delete
- [ ] **API:** WebSocket (Socket.io) — push to user's room on create
- [ ] **WEB:** Notification bell in top bar with unread count
- [ ] **WEB:** Notification dropdown (list of recent notifications)
- [ ] **WEB:** Click notification → navigate to related entity
- [ ] **WEB:** Notifications page (full list, filterable)

### 11.2 Notification Triggers `[API]`
- [ ] New lead captured (→ assigned salesperson + agency owner)
- [ ] Follow-up due today (→ assigned salesperson)
- [ ] Follow-up overdue (→ assigned salesperson + manager)
- [ ] Payment received (→ accounts staff + agency owner)
- [ ] Payment overdue (→ accounts staff + agency owner)
- [ ] Document uploaded by customer via portal (→ operations staff)
- [ ] Document missing reminder (→ operations staff)
- [ ] Visa status changed (→ operations staff + agency owner)
- [ ] Booking status changed (→ relevant staff)
- [ ] Customer replied on WhatsApp (→ assigned salesperson)
- [ ] AI usage limit approaching 80% (→ agency owner)

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

### 12.5 Seed Data & Pilot `[BOTH]`
- [ ] Seed: Super Admin account
- [ ] Seed: 3 default plans (Basic, Pro, Enterprise)
- [ ] Seed: Global visa templates (Singapore, Malaysia, Thailand, Dubai, Bali)
- [ ] Seed: Sample packages for pilot agency
- [ ] Create pilot agency account
- [ ] Onboard pilot agency (WhatsApp setup, staff accounts, packages)
- [ ] Monitor & collect feedback
- [ ] Iterate based on real usage

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
