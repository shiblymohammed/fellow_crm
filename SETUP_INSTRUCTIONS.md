# 🚀 Fellow CRM — Setup Instructions

## ✅ What Has Been Created

The complete monorepo foundation is now set up! Here's what you have:

### 📁 Project Structure
```
fellow_crm/
├── apps/
│   ├── api/              ✅ NestJS API with Prisma schema (39 tables)
│   ├── web/              ⏳ Next.js (to be initialized)
│   ├── desktop/          📝 Placeholder for future Tauri app
│   ├── desktop-mac/      📝 Placeholder for future Tauri Mac app
│   └── mobile/           📝 Placeholder for future Capacitor app
├── packages/
│   └── shared/           ✅ Types, constants, validators, utils
├── docs/                 ✅ All documentation files
├── docker-compose.yml    ✅ PostgreSQL + Redis
├── .env.example          ✅ Environment variables template
├── turbo.json            ✅ Turborepo configuration
├── pnpm-workspace.yaml   ✅ Workspace configuration
└── package.json          ✅ Root package.json with scripts
```

---

## 🎯 Next Steps

### Step 1: Install Dependencies

Open PowerShell in the project root and run:

```powershell
# Install pnpm globally if you haven't already
npm install -g pnpm

# Install all dependencies
pnpm install
```

### Step 2: Start Docker (PostgreSQL + Redis)

```powershell
docker compose up -d
```

This starts:
- PostgreSQL on port 5432
- Redis on port 6379

Verify they're running:
```powershell
docker compose ps
```

### Step 3: Setup Environment Variables

```powershell
# Copy example env file
Copy-Item .env.example .env

# Also copy for API
Copy-Item apps\api\.env.example apps\api\.env
```

### Step 4: Initialize Database

```powershell
cd apps\api

# Generate Prisma Client
pnpm prisma generate

# Run migrations (creates all 39 tables)
pnpm prisma migrate dev --name init

# Seed database (creates Super Admin + demo tenant)
pnpm prisma seed

cd ..\..
```

### Step 5: Initialize Next.js Web App

```powershell
cd apps\web

# Create Next.js app
pnpx create-next-app@latest . --typescript --tailwind --app --use-pnpm --no-src-dir

cd ..\..
```

### Step 6: Start Development Servers

From the root directory:

```powershell
pnpm dev
```

This will start both:
- API: http://localhost:3001
- Web: http://localhost:3000

---

## 🔐 Default Login Credentials

After seeding, you can log in with:

### Super Admin (Platform Access)
- Email: `admin@fellowcrm.com`
- Password: `Admin@123456`

### Demo Agency Owner
- Email: `owner@demotravels.com`
- Password: `Demo@123456`
- Tenant: `demo-travels`

---

## 🛠️ Useful Commands

### Database

```powershell
# Open Prisma Studio (visual DB browser)
cd apps\api
pnpm prisma studio

# Create a new migration
pnpm prisma migrate dev --name migration_name

# Reset database (WARNING: deletes all data)
pnpm prisma migrate reset
```

### Development

```powershell
# Start all apps
pnpm dev

# Start only API
pnpm --filter api dev

# Start only Web
pnpm --filter web dev

# Build all apps
pnpm build

# Lint all code
pnpm lint

# Format all code
pnpm format
```

### Docker

```powershell
# Stop services
docker compose down

# Stop and remove volumes (deletes all data)
docker compose down -v

# View logs
docker compose logs -f

# Restart a service
docker compose restart postgres
```

---

## 📊 Database Schema

The Prisma schema includes **39 tables** organized into:

1. **Platform Layer** (7 tables)
   - tenants, plans, tenant_features, users, platform_leads, tenant_billing

2. **CRM Core** (4 tables)
   - customers, leads, followups, lead_notes

3. **Package & Quotations** (4 tables)
   - packages, package_items, quotations, quotation_items

4. **Bookings** (3 tables)
   - bookings, travellers, traveller_documents

5. **Suppliers** (1 table)
   - suppliers

6. **Payments** (4 tables)
   - payments, payment_schedules, supplier_payments, expenses

7. **WhatsApp** (3 tables)
   - wa_configs, wa_conversations, wa_messages

8. **Notifications** (1 table)
   - notifications

---

## 📦 Shared Package

The `@fellow-crm/shared` package contains:

- **Types**: TypeScript interfaces for all entities
- **Constants**: Enums, feature keys, status labels
- **Validators**: Zod schemas for validation
- **Utils**: Currency formatting, date formatting, slug generation, etc.

Both API and Web can import from it:

```typescript
import { Lead, LeadStatus, formatCurrency } from '@fellow-crm/shared';
```

---

## 🚨 Troubleshooting

### "Docker is not running"
Make sure Docker Desktop is installed and running.

### "Port 5432 already in use"
Another PostgreSQL instance is running. Stop it or change the port in `docker-compose.yml`.

### "Cannot find module '@fellow-crm/shared'"
Run `pnpm install` from the root directory.

### "Prisma Client not generated"
Run `cd apps/api && pnpm prisma generate`

---

## ✅ Phase 1 Checklist

- [x] Repository structure created
- [x] Docker Compose setup (PostgreSQL + Redis)
- [x] Prisma schema with 39 tables
- [x] Seed script (Super Admin + demo tenant)
- [x] Shared package (types, constants, validators, utils)
- [x] Turborepo configuration
- [ ] NestJS API authentication module
- [ ] NestJS multi-tenancy middleware
- [ ] NestJS RBAC guards
- [ ] Next.js web app initialization
- [ ] Web app UI components (Button, Input, etc.)
- [ ] Web app layout (Sidebar, TopBar)
- [ ] Web app auth pages (Login, Register)

---

## 📚 What to Build Next

After completing setup, you should start with:

1. **Auth Module (API)** — JWT authentication, login, register
2. **Auth Guards (API)** — Tenant context, role guards, feature guards
3. **Auth Pages (Web)** — Login UI, register UI
4. **Dashboard Layout (Web)** — Sidebar, TopBar, routing

See `tasks.md` for the complete task breakdown.

---

**🎉 Foundation is ready! Let's build something amazing.**
