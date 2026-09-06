# Fellow CRM — Technical Architecture

> **Type:** Multi-tenant SaaS Monorepo
> **Pattern:** Modular Monolith (backend) + Next.js App (frontend)

---

## 🏗️ Tech Stack

| Layer | Technology | Why |
|---|---|---|
| **Language** | TypeScript (full-stack) | Type safety, shared types between API & Web |
| **Backend** | NestJS | Modular architecture, guards, interceptors, built-in BullMQ support, better than raw Express for large apps |
| **Frontend** | Next.js 14+ (App Router) | SSR for marketing, React ecosystem, great DX |
| **Database** | PostgreSQL 16 | Relational data, complex queries, JSONB support |
| **ORM** | Prisma | Type-safe queries, migrations, great TS integration |
| **Job Queue** | BullMQ + Redis | Scheduled drip messages, follow-up reminders, AI jobs |
| **Auth** | JWT (access + refresh tokens) | Stateless, scalable, works across web/mobile/desktop |
| **File Storage** | AWS S3 (or MinIO for dev) | PDFs, documents, receipts, images |
| **PDF Engine** | Puppeteer | Render React templates → PDF server-side |
| **WhatsApp** | Meta Cloud API / BSP | Webhook-based, per-agency numbers |
| **AI** | OpenAI API (GPT-4o-mini) | RAG for packages, itinerary generation, smart queries |
| **Real-time** | WebSocket (Socket.io) | Live notifications, chat updates |
| **Monorepo** | pnpm workspaces + Turborepo | Fast builds, shared packages, parallel scripts |
| **Desktop** | Tauri 2.0 | Lightweight, Rust-based, ships web app as native |
| **Mobile** | Capacitor | Wrap Next.js as native iOS/Android app |
| **Hosting** | Vercel (web) + Railway/Render (API) + Supabase/Neon (DB) | Managed, auto-scaling, affordable |

---

## 📁 Repository Structure

```
fellow_crm/
│
├── apps/
│   ├── api/                          # NestJS Backend
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── app.module.ts
│   │   │   │
│   │   │   ├── common/              # Shared backend utilities
│   │   │   │   ├── guards/          # Auth guard, role guard, tenant guard
│   │   │   │   ├── interceptors/    # Response transform, logging
│   │   │   │   ├── decorators/      # @CurrentUser, @TenantId, @Roles
│   │   │   │   ├── filters/         # Global exception filter
│   │   │   │   ├── middleware/      # Tenant context middleware
│   │   │   │   └── pipes/           # Validation pipes
│   │   │   │
│   │   │   ├── modules/
│   │   │   │   ├── auth/            # Login, register, JWT, refresh tokens
│   │   │   │   ├── platform/        # Super Admin: tenants, plans, features, billing, platform-leads
│   │   │   │   ├── users/           # User CRUD, role management
│   │   │   │   ├── crm/             # Leads, customers, follow-ups, lead notes
│   │   │   │   ├── packages/        # Package builder, package items
│   │   │   │   ├── quotations/      # Quotation CRUD, PDF generation
│   │   │   │   ├── bookings/        # Booking lifecycle, status management
│   │   │   │   ├── travellers/      # Traveller profiles, document management
│   │   │   │   ├── visa/            # Visa applications, checklists, templates
│   │   │   │   ├── suppliers/       # Supplier CRUD, supplier bookings
│   │   │   │   ├── itinerary/       # Itinerary builder, templates, AI generation
│   │   │   │   ├── payments/        # Payments, schedules, supplier payments, expenses
│   │   │   │   ├── whatsapp/        # WhatsApp config, webhook, chatbot, drip sequences
│   │   │   │   ├── notifications/   # In-app notifications, WebSocket push
│   │   │   │   ├── dashboard/       # Dashboard aggregations
│   │   │   │   ├── reports/         # Analytics & reporting queries
│   │   │   │   ├── portal/          # Customer portal: OTP auth, booking view
│   │   │   │   └── ai/             # AI assistant: RAG, GPT integration
│   │   │   │
│   │   │   └── integrations/
│   │   │       ├── openai/          # OpenAI API wrapper
│   │   │       ├── s3/              # File upload service
│   │   │       ├── pdf/             # Puppeteer PDF renderer
│   │   │       └── email/           # Email service (Resend/Nodemailer)
│   │   │
│   │   ├── prisma/
│   │   │   ├── schema.prisma        # Database schema
│   │   │   ├── migrations/          # Auto-generated migrations
│   │   │   └── seed.ts              # Seed data (plans, Super Admin, visa templates)
│   │   │
│   │   ├── test/                    # E2E tests
│   │   ├── nest-cli.json
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── web/                          # Next.js Frontend
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── (marketing)/     # Public pages: landing, pricing, contact
│   │   │   │   ├── (auth)/          # Login, forgot password
│   │   │   │   ├── (super-admin)/   # Super Admin dashboard
│   │   │   │   │   ├── tenants/
│   │   │   │   │   ├── plans/
│   │   │   │   │   ├── platform-leads/
│   │   │   │   │   ├── billing/
│   │   │   │   │   └── analytics/
│   │   │   │   ├── (agency)/        # Agency workspace (tenant-scoped)
│   │   │   │   │   ├── dashboard/
│   │   │   │   │   ├── leads/
│   │   │   │   │   ├── customers/
│   │   │   │   │   ├── packages/
│   │   │   │   │   ├── quotations/
│   │   │   │   │   ├── bookings/
│   │   │   │   │   ├── travellers/
│   │   │   │   │   ├── visa/
│   │   │   │   │   ├── suppliers/
│   │   │   │   │   ├── itinerary/
│   │   │   │   │   ├── payments/
│   │   │   │   │   ├── reports/
│   │   │   │   │   └── settings/    # Agency settings, WhatsApp config, drip sequences
│   │   │   │   └── portal/          # Customer portal (public, OTP-gated)
│   │   │   │       └── [slug]/      # /portal/booking-slug
│   │   │   │
│   │   │   ├── components/
│   │   │   │   ├── ui/              # Design system: Button, Input, Modal, Table, etc.
│   │   │   │   ├── layout/          # Sidebar, TopBar, BreadCrumb
│   │   │   │   ├── forms/           # Reusable form components
│   │   │   │   └── charts/          # Dashboard chart components
│   │   │   │
│   │   │   ├── hooks/               # Custom React hooks
│   │   │   ├── lib/                 # API client, auth helpers, utils
│   │   │   ├── stores/              # Zustand stores (auth, tenant, notifications)
│   │   │   └── styles/              # Global CSS, design tokens
│   │   │
│   │   ├── public/                  # Static assets
│   │   ├── next.config.js
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── desktop/                      # Tauri (Windows) — EMPTY FOR NOW
│   │   └── README.md                # "Desktop app - Tauri setup pending"
│   │
│   ├── desktop-mac/                  # Tauri (Mac) — EMPTY FOR NOW
│   │   └── README.md                # "Mac desktop app - pending"
│   │
│   └── mobile/                       # Capacitor — EMPTY FOR NOW
│       └── README.md                # "Mobile app - Capacitor setup pending"
│
├── packages/
│   ├── shared/                       # Shared between API & Web
│   │   ├── types/                   # TypeScript interfaces (Lead, Booking, User, etc.)
│   │   ├── constants/               # Enums, status maps, feature keys
│   │   ├── validators/              # Zod schemas (shared validation)
│   │   └── utils/                   # Date formatting, currency, slug generation
│   │
│   └── ui/                          # Shared UI components (if needed for portal)
│       └── package.json
│
├── docs/                             # Documentation
│   ├── plan.md                      # Master plan
│   ├── database.md                  # Database schema
│   ├── architecture.md              # This file
│   └── tasks.md                     # Task breakdown
│
├── turbo.json                       # Turborepo config
├── pnpm-workspace.yaml              # pnpm workspace config
├── .env.example                     # Environment variables template
├── .gitignore
├── docker-compose.yml               # Local dev: PostgreSQL + Redis
└── README.md
```

---

## 🔌 API Architecture (NestJS)

### Request Flow

```
CLIENT REQUEST
      ↓
Global Exception Filter
      ↓
Auth Guard (JWT verification)
      ↓
Tenant Context Middleware (extract tenant_id from JWT)
      ↓
Role Guard (@Roles('agency_owner', 'sales'))
      ↓
Feature Guard (@RequiresFeature('whatsapp_integration'))
      ↓
Validation Pipe (Zod/class-validator)
      ↓
Controller → Service → Prisma (all queries auto-scoped by tenant_id)
      ↓
Response Interceptor (standard response format)
      ↓
CLIENT RESPONSE
```

### Multi-Tenancy Implementation

```typescript
// Every service method receives tenantId from the controller
// Controllers extract it via @TenantId() decorator

@Controller('leads')
export class LeadsController {
  @Get()
  findAll(@TenantId() tenantId: string) {
    return this.leadsService.findAll(tenantId);
  }
}

// Service always filters by tenantId
export class LeadsService {
  async findAll(tenantId: string) {
    return this.prisma.lead.findMany({
      where: { tenantId }
    });
  }
}
```

### Feature Gating

```typescript
// Decorator on controller/route
@RequiresFeature('ai_assistant')
@Post('generate-itinerary')
async generateWithAI(@TenantId() tenantId: string) {
  // Only executes if tenant has ai_assistant enabled
}
```

---

## 🔐 Authentication Flow

```
LOGIN
  ├── Email + Password → API validates → Returns:
  │     ├── access_token (JWT, 15min expiry)
  │     ├── refresh_token (JWT, 7 day expiry, stored in httpOnly cookie)
  │     └── user object { id, name, role, tenantId, tenantSlug }
  │
EVERY REQUEST
  ├── Authorization: Bearer <access_token>
  ├── API decodes JWT → extracts userId, tenantId, role
  └── Guards check role + feature access
  │
TOKEN REFRESH
  ├── access_token expired → frontend calls /auth/refresh
  ├── API validates refresh_token cookie
  └── Returns new access_token

SUPER ADMIN LOGIN
  ├── Same flow, but tenantId = NULL in JWT
  └── Super Admin guard checks role = 'super_admin'
```

---

## 📡 WebSocket (Notifications)

```
CLIENT connects to WebSocket with JWT
      ↓
Server authenticates → joins room: tenant_{tenantId}_user_{userId}
      ↓
When events happen (new lead, payment, visa update):
  → Backend creates notification record in DB
  → Emits to user's WebSocket room
  → Frontend shows toast + updates bell icon count
```

---

## 🔄 Job Queue (BullMQ)

| Queue | Jobs | Schedule |
|---|---|---|
| `drip-messages` | Send scheduled WhatsApp drip messages | Delayed jobs (1d, 3d, 7d, 14d) |
| `follow-up-reminders` | Check overdue follow-ups, notify staff | Every 30 minutes |
| `payment-reminders` | Check overdue payment schedules, send WhatsApp | Daily at 9 AM |
| `document-reminders` | Nudge customers for missing documents | Daily at 10 AM |
| `ai-usage-reset` | Reset `ai_conversations_used` to 0 for all tenants | 1st of every month |
| `pdf-generation` | Generate quotation/itinerary/invoice PDFs | On-demand |

---

## 🌐 Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/fellow_crm

# Redis (BullMQ)
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret

# OpenAI
OPENAI_API_KEY=sk-...

# AWS S3
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=fellow-crm-uploads
AWS_REGION=ap-south-1

# WhatsApp (platform-level webhook verification)
WA_WEBHOOK_VERIFY_TOKEN=your-verify-token

# Email (Resend)
RESEND_API_KEY=re_...

# App
API_URL=http://localhost:3001
WEB_URL=http://localhost:3000
NODE_ENV=development
```

---

## 🐳 Local Development

```yaml
# docker-compose.yml
services:
  postgres:
    image: postgres:16
    ports: ["5432:5432"]
    environment:
      POSTGRES_DB: fellow_crm
      POSTGRES_USER: fellow
      POSTGRES_PASSWORD: fellow123
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]

volumes:
  pgdata:
```

### Dev Commands

```bash
# Start infrastructure
docker compose up -d

# Install dependencies
pnpm install

# Run database migrations
pnpm --filter api prisma migrate dev

# Seed database (Super Admin + plans + visa templates)
pnpm --filter api prisma db seed

# Start all apps in dev mode
pnpm dev           # runs api + web in parallel via Turborepo

# Start individually
pnpm --filter api dev      # NestJS on :3001
pnpm --filter web dev      # Next.js on :3000
```

---

## 📊 API Response Format

```json
// Success
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 156
  }
}

// Error
{
  "success": false,
  "error": {
    "code": "LEAD_NOT_FOUND",
    "message": "Lead with ID xyz not found"
  }
}
```

---

## 🚀 Deployment Architecture

```
                    ┌─────────────────┐
                    │   Cloudflare     │
                    │   (DNS + CDN)    │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              ↓              ↓              ↓
     ┌────────────┐  ┌────────────┐  ┌────────────┐
     │   Vercel   │  │  Railway   │  │  Neon /     │
     │  (Next.js) │  │  (NestJS)  │  │  Supabase   │
     │   Web App  │  │   API +    │  │ (PostgreSQL) │
     │            │  │  BullMQ    │  │             │
     └────────────┘  │  Workers   │  └────────────┘
                     └──────┬─────┘
                            │
                     ┌──────┼──────┐
                     ↓             ↓
              ┌──────────┐  ┌──────────┐
              │  Upstash  │  │  AWS S3   │
              │  (Redis)  │  │  (Files)  │
              └──────────┘  └──────────┘
```

---

*Last Updated: September 3, 2026*
