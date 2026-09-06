# Fellow CRM — Database Schema

> **Database:** PostgreSQL
> **Convention:** All tenant-scoped tables have `tenant_id`. UUIDs as primary keys. `created_at` / `updated_at` on all tables.

---

## 🏗️ Platform Layer

### `tenants`
```sql
id                      UUID PRIMARY KEY DEFAULT gen_random_uuid()
name                    VARCHAR(255) NOT NULL          -- Agency name
slug                    VARCHAR(100) UNIQUE NOT NULL   -- URL slug
owner_name              VARCHAR(255)
owner_email             VARCHAR(255) UNIQUE NOT NULL
owner_phone             VARCHAR(20)
plan_id                 UUID REFERENCES plans(id)
status                  ENUM('active','suspended','expired','trial')
trial_ends_at           TIMESTAMPTZ
subscription_ends_at    TIMESTAMPTZ
-- Sequence counters (for generating TRV-2026-0001, QT-2026-0001)
booking_sequence        INTEGER DEFAULT 0
quotation_sequence      INTEGER DEFAULT 0
-- AI fields
ai_enabled              BOOLEAN DEFAULT false
ai_conversations_used   INTEGER DEFAULT 0
ai_conversations_limit  INTEGER DEFAULT 0
ai_model                VARCHAR(50) DEFAULT 'gpt-4o-mini'
ai_usage_reset_at       DATE
-- Branding
logo_url                VARCHAR(500)
primary_color           VARCHAR(10)
created_at              TIMESTAMPTZ DEFAULT NOW()
updated_at              TIMESTAMPTZ DEFAULT NOW()
```

### `plans`
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
name            VARCHAR(100) NOT NULL     -- Basic, Pro, Enterprise, Custom
description     TEXT
price           NUMERIC(10,2)
billing_cycle   ENUM('monthly','quarterly','annual')
is_active       BOOLEAN DEFAULT true
created_at      TIMESTAMPTZ DEFAULT NOW()
updated_at      TIMESTAMPTZ DEFAULT NOW()
```

### `tenant_features`
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE
feature_key     VARCHAR(100) NOT NULL     -- 'visa_management', 'ai_assistant', etc.
is_enabled      BOOLEAN DEFAULT false
config          JSONB                     -- optional per-feature config
updated_by      UUID REFERENCES users(id)
updated_at      TIMESTAMPTZ DEFAULT NOW()
UNIQUE(tenant_id, feature_key)
```

### `users`
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
tenant_id       UUID REFERENCES tenants(id) ON DELETE CASCADE   -- NULL for Super Admin
name            VARCHAR(255) NOT NULL
email           VARCHAR(255) UNIQUE NOT NULL
phone           VARCHAR(20)
password_hash   VARCHAR(255) NOT NULL
role            ENUM('super_admin','agency_owner','manager','sales','operations','accounts')
is_active       BOOLEAN DEFAULT true
last_login_at   TIMESTAMPTZ
created_at      TIMESTAMPTZ DEFAULT NOW()
updated_at      TIMESTAMPTZ DEFAULT NOW()
```

### `platform_leads`
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
name            VARCHAR(255)
email           VARCHAR(255)
phone           VARCHAR(20)
agency_name     VARCHAR(255)
message         TEXT
source          VARCHAR(100)              -- 'contact_form', 'referral'
status          ENUM('new','contacted','demo_scheduled','closed_won','closed_lost')
notes           TEXT
assigned_to     UUID REFERENCES users(id) -- Super Admin user
created_at      TIMESTAMPTZ DEFAULT NOW()
updated_at      TIMESTAMPTZ DEFAULT NOW()
```

### `tenant_billing`
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
tenant_id       UUID NOT NULL REFERENCES tenants(id)
invoice_number  VARCHAR(100)
amount          NUMERIC(10,2)
currency        VARCHAR(10) DEFAULT 'INR'
status          ENUM('pending','paid','overdue','cancelled')
due_date        DATE
paid_at         TIMESTAMPTZ
payment_method  VARCHAR(100)
notes           TEXT
created_at      TIMESTAMPTZ DEFAULT NOW()
updated_at      TIMESTAMPTZ DEFAULT NOW()
```

---

## 📦 Module 1 — Lead & CRM

### `customers`
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
tenant_id       UUID NOT NULL REFERENCES tenants(id)
name            VARCHAR(255) NOT NULL
email           VARCHAR(255)
phone           VARCHAR(20) NOT NULL
whatsapp        VARCHAR(20)
city            VARCHAR(100)
state           VARCHAR(100)
source          ENUM('whatsapp','phone','website','walk_in','instagram','facebook','google','referral')
notes           TEXT
tags            TEXT[]
created_at      TIMESTAMPTZ DEFAULT NOW()
updated_at      TIMESTAMPTZ DEFAULT NOW()
```

### `leads`
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
tenant_id       UUID NOT NULL REFERENCES tenants(id)
customer_id     UUID REFERENCES customers(id)
-- Lead details (filled by chatbot or manually)
destination     VARCHAR(255)
travel_date     DATE
return_date     DATE
adults          INTEGER DEFAULT 1
children        INTEGER DEFAULT 0
infants         INTEGER DEFAULT 0
budget_per_person NUMERIC(10,2)
preferred_hotels TEXT
special_requests TEXT
-- Tracking
source          ENUM('whatsapp','phone','website','walk_in','instagram','facebook','google','referral')
status          ENUM('new','contacted','interested','quotation_sent','negotiating','won','lost','cold')
assigned_to     UUID REFERENCES users(id)
lost_reason     TEXT
-- NOTE: WhatsApp chatbot state lives in wa_conversations table, NOT here
created_at      TIMESTAMPTZ DEFAULT NOW()
updated_at      TIMESTAMPTZ DEFAULT NOW()
```

### `followups`
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
tenant_id       UUID NOT NULL REFERENCES tenants(id)
lead_id         UUID REFERENCES leads(id)
booking_id      UUID REFERENCES bookings(id)
assigned_to     UUID NOT NULL REFERENCES users(id)
due_at          TIMESTAMPTZ NOT NULL
type            ENUM('call','whatsapp','email','visit','other')
note            TEXT
status          ENUM('pending','done','missed')
completed_at    TIMESTAMPTZ
created_at      TIMESTAMPTZ DEFAULT NOW()
updated_at      TIMESTAMPTZ DEFAULT NOW()
```

### `lead_notes`
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
tenant_id       UUID NOT NULL REFERENCES tenants(id)
lead_id         UUID NOT NULL REFERENCES leads(id)
created_by      UUID NOT NULL REFERENCES users(id)
type            ENUM('call','whatsapp','email','note','meeting')
content         TEXT NOT NULL
created_at      TIMESTAMPTZ DEFAULT NOW()
```

---

## 📦 Module 2 — Package Builder

### `packages`
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
tenant_id       UUID NOT NULL REFERENCES tenants(id)
name            VARCHAR(255) NOT NULL     -- "Singapore 5D/4N"
destination     VARCHAR(255) NOT NULL
duration_days   INTEGER NOT NULL
duration_nights INTEGER NOT NULL
description     TEXT
is_active       BOOLEAN DEFAULT true
created_by      UUID REFERENCES users(id)
created_at      TIMESTAMPTZ DEFAULT NOW()
updated_at      TIMESTAMPTZ DEFAULT NOW()
```

### `package_items`
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
tenant_id       UUID NOT NULL REFERENCES tenants(id)
package_id      UUID NOT NULL REFERENCES packages(id) ON DELETE CASCADE
category        ENUM('hotel','flight','transfer','activity','tour','meal','visa','insurance','other')
name            VARCHAR(255) NOT NULL
description     TEXT
supplier_id     UUID REFERENCES suppliers(id)
supplier_cost   NUMERIC(10,2) NOT NULL DEFAULT 0
markup_type     ENUM('fixed','percentage') DEFAULT 'fixed'
markup_value    NUMERIC(10,2) DEFAULT 0
customer_price  NUMERIC(10,2) NOT NULL
sort_order      INTEGER DEFAULT 0
created_at      TIMESTAMPTZ DEFAULT NOW()
updated_at      TIMESTAMPTZ DEFAULT NOW()
```

---

## 📦 Module 3 — Quotation System

### `quotations`
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
tenant_id       UUID NOT NULL REFERENCES tenants(id)
quotation_number VARCHAR(50) NOT NULL      -- QT-2026-0001 (unique per tenant)
lead_id         UUID REFERENCES leads(id)
customer_id     UUID NOT NULL REFERENCES customers(id)
package_id      UUID REFERENCES packages(id)
destination     VARCHAR(255)
travel_date     DATE
return_date     DATE
adults          INTEGER DEFAULT 1
children        INTEGER DEFAULT 0
infants         INTEGER DEFAULT 0
total_supplier_cost NUMERIC(12,2) DEFAULT 0
total_customer_price NUMERIC(12,2) DEFAULT 0
gross_profit    NUMERIC(12,2) DEFAULT 0
status          ENUM('draft','sent','viewed','accepted','rejected','expired','revised')
valid_until     DATE
notes           TEXT
pdf_url         VARCHAR(500)
sent_via        ENUM('whatsapp','email','both')
sent_at         TIMESTAMPTZ
created_by      UUID NOT NULL REFERENCES users(id)
created_at      TIMESTAMPTZ DEFAULT NOW()
updated_at      TIMESTAMPTZ DEFAULT NOW()
UNIQUE(tenant_id, quotation_number)
```

### `quotation_items`
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
tenant_id       UUID NOT NULL REFERENCES tenants(id)
quotation_id    UUID NOT NULL REFERENCES quotations(id) ON DELETE CASCADE
category        ENUM('hotel','flight','transfer','activity','tour','meal','visa','insurance','other')
name            VARCHAR(255) NOT NULL
description     TEXT
supplier_id     UUID REFERENCES suppliers(id)
supplier_cost   NUMERIC(10,2) DEFAULT 0
customer_price  NUMERIC(10,2) NOT NULL
sort_order      INTEGER DEFAULT 0
created_at      TIMESTAMPTZ DEFAULT NOW()
```

---

## 📦 Module 4 — Booking Management

### `bookings`
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
tenant_id       UUID NOT NULL REFERENCES tenants(id)
booking_number  VARCHAR(50) NOT NULL       -- TRV-2026-1028 (unique per tenant)
quotation_id    UUID REFERENCES quotations(id)
customer_id     UUID NOT NULL REFERENCES customers(id)
destination     VARCHAR(255) NOT NULL
travel_date     DATE NOT NULL
return_date     DATE
adults          INTEGER DEFAULT 1
children        INTEGER DEFAULT 0
infants         INTEGER DEFAULT 0
package_id      UUID REFERENCES packages(id)
total_amount    NUMERIC(12,2) NOT NULL
amount_paid     NUMERIC(12,2) DEFAULT 0     -- updated by trigger on payments insert/delete
balance         NUMERIC(12,2) DEFAULT 0     -- updated by trigger: total_amount - amount_paid
status          ENUM('confirmed','documents_pending','visa_processing','ready','travelling','completed','cancelled')
assigned_sales  UUID REFERENCES users(id)
assigned_ops    UUID REFERENCES users(id)
notes           TEXT
cancelled_at    TIMESTAMPTZ
cancel_reason   TEXT
created_by      UUID NOT NULL REFERENCES users(id)
created_at      TIMESTAMPTZ DEFAULT NOW()
updated_at      TIMESTAMPTZ DEFAULT NOW()
UNIQUE(tenant_id, booking_number)
```

> **Note:** `amount_paid` and `balance` are updated by a database trigger that fires on `INSERT`/`DELETE` on the `payments` table. This ensures they stay in sync without using generated columns (which can't reference other tables).

---

## 📦 Module 5 — Travellers & Documents

### `travellers`
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
tenant_id       UUID NOT NULL REFERENCES tenants(id)
booking_id      UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE
customer_id     UUID REFERENCES customers(id)
name            VARCHAR(255) NOT NULL
date_of_birth   DATE
gender          ENUM('male','female','other')    -- required for most visa applications
type            ENUM('adult','child','infant')
passport_number VARCHAR(100)
passport_expiry DATE
place_of_birth  VARCHAR(100)                     -- some visas require this
nationality     VARCHAR(100)
created_at      TIMESTAMPTZ DEFAULT NOW()
updated_at      TIMESTAMPTZ DEFAULT NOW()
```

### `traveller_documents`
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
tenant_id       UUID NOT NULL REFERENCES tenants(id)
traveller_id    UUID NOT NULL REFERENCES travellers(id) ON DELETE CASCADE
booking_id      UUID NOT NULL REFERENCES bookings(id)
doc_type        ENUM('passport','photo','pan','aadhaar','visa','flight_ticket','insurance','hotel_voucher','other')
file_url        VARCHAR(500)
file_name       VARCHAR(255)
status          ENUM('pending','received','verified','rejected','missing')
rejection_note  TEXT
uploaded_by     UUID REFERENCES users(id)
uploaded_at     TIMESTAMPTZ
verified_by     UUID REFERENCES users(id)
verified_at     TIMESTAMPTZ
created_at      TIMESTAMPTZ DEFAULT NOW()
updated_at      TIMESTAMPTZ DEFAULT NOW()
```

---

## 📦 Module 6 — Visa Management

### `visa_applications`
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
tenant_id       UUID NOT NULL REFERENCES tenants(id)
booking_id      UUID NOT NULL REFERENCES bookings(id)
traveller_id    UUID NOT NULL REFERENCES travellers(id)
destination     VARCHAR(255) NOT NULL
visa_type       VARCHAR(100)
status          ENUM('not_started','collecting_docs','submitted','processing','approved','rejected')
submitted_at    DATE
expected_date   DATE
approved_at     DATE
visa_number     VARCHAR(100)               -- stored once visa is approved
rejection_reason TEXT
visa_agent_id   UUID REFERENCES suppliers(id)
notes           TEXT
created_at      TIMESTAMPTZ DEFAULT NOW()
updated_at      TIMESTAMPTZ DEFAULT NOW()
```

### `visa_checklist_items`
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
tenant_id       UUID NOT NULL REFERENCES tenants(id)
visa_id         UUID NOT NULL REFERENCES visa_applications(id) ON DELETE CASCADE
traveller_id    UUID NOT NULL REFERENCES travellers(id)
item_name       VARCHAR(255) NOT NULL
is_required     BOOLEAN DEFAULT true
status          ENUM('pending','received','not_applicable')
created_at      TIMESTAMPTZ DEFAULT NOW()
updated_at      TIMESTAMPTZ DEFAULT NOW()
```

### `destination_visa_templates`
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
tenant_id       UUID REFERENCES tenants(id)  -- NULL = global platform template
is_global       BOOLEAN DEFAULT false         -- true = seeded by Super Admin for all agencies
destination     VARCHAR(255) NOT NULL
checklist_items JSONB NOT NULL                -- array of required doc names
notes           TEXT
created_at      TIMESTAMPTZ DEFAULT NOW()
updated_at      TIMESTAMPTZ DEFAULT NOW()
```

> **Note:** Super Admin creates global templates (`is_global = true`, `tenant_id = NULL`). Agencies can override by creating their own template for the same destination. Query: `WHERE (tenant_id = ? OR is_global = true) ORDER BY is_global ASC LIMIT 1`.

---

## 📦 Module 7 — Supplier Management

### `suppliers`
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
tenant_id       UUID NOT NULL REFERENCES tenants(id)
company_name    VARCHAR(255) NOT NULL
contact_person  VARCHAR(255)
phone           VARCHAR(20)
whatsapp        VARCHAR(20)
email           VARCHAR(255)
destination     VARCHAR(255)
services        TEXT[] CHECK (services <@ ARRAY['hotel','transfer','tour','visa','airline','insurance','dmc'])
payment_terms   TEXT
contract_url    VARCHAR(500)
rating          SMALLINT CHECK (rating BETWEEN 1 AND 5)
notes           TEXT
is_active       BOOLEAN DEFAULT true
created_at      TIMESTAMPTZ DEFAULT NOW()
updated_at      TIMESTAMPTZ DEFAULT NOW()
```

> **Note:** `outstanding_payable` is NOT stored as a column — it's computed dynamically: `SELECT SUM(amount) FROM supplier_payments WHERE supplier_id = ? AND status = 'pending'`. Storing it would cause desync with actual payment records.

### `supplier_bookings`
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
tenant_id       UUID NOT NULL REFERENCES tenants(id)
booking_id      UUID NOT NULL REFERENCES bookings(id)
supplier_id     UUID NOT NULL REFERENCES suppliers(id)
service_type    ENUM('hotel','flight','transfer','activity','visa','insurance','other')
description     TEXT
amount          NUMERIC(10,2) NOT NULL
status          ENUM('pending','confirmed','cancelled')
confirmation_ref VARCHAR(255)
created_at      TIMESTAMPTZ DEFAULT NOW()
updated_at      TIMESTAMPTZ DEFAULT NOW()
```

---

## 📦 Module 8 — Itinerary Builder

### `package_itinerary_templates`
> Pre-built itinerary templates attached to packages. When a booking is created from this package, the template is auto-cloned into a real itinerary.

```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
tenant_id       UUID NOT NULL REFERENCES tenants(id)
package_id      UUID NOT NULL REFERENCES packages(id) ON DELETE CASCADE
title           VARCHAR(255)              -- "Singapore 5D/4N Itinerary"
created_by      UUID REFERENCES users(id)
created_at      TIMESTAMPTZ DEFAULT NOW()
updated_at      TIMESTAMPTZ DEFAULT NOW()
UNIQUE(tenant_id, package_id)             -- one template per package
```

### `package_itinerary_template_days`
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
tenant_id       UUID NOT NULL REFERENCES tenants(id)
template_id     UUID NOT NULL REFERENCES package_itinerary_templates(id) ON DELETE CASCADE
day_number      INTEGER NOT NULL
title           VARCHAR(255)              -- "Day 1 – Arrival & City Tour"
description     TEXT
activities      JSONB NOT NULL            -- [{time: "09:00", icon: "✈️", description: "Arrive at Singapore"}]
sort_order      INTEGER DEFAULT 0
created_at      TIMESTAMPTZ DEFAULT NOW()
```

### `itineraries`
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
tenant_id       UUID NOT NULL REFERENCES tenants(id)
booking_id      UUID NOT NULL REFERENCES bookings(id) UNIQUE
title           VARCHAR(255)
public_slug     VARCHAR(100)              -- for shareable link (unique per tenant)
pdf_url         VARCHAR(500)
generated_by    ENUM('manual','template','ai') DEFAULT 'manual'
template_id     UUID REFERENCES package_itinerary_templates(id)  -- if cloned from template
created_by      UUID REFERENCES users(id)
created_at      TIMESTAMPTZ DEFAULT NOW()
updated_at      TIMESTAMPTZ DEFAULT NOW()
UNIQUE(tenant_id, public_slug)
```

### `itinerary_days`
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
tenant_id       UUID NOT NULL REFERENCES tenants(id)
itinerary_id    UUID NOT NULL REFERENCES itineraries(id) ON DELETE CASCADE
day_number      INTEGER NOT NULL
date            DATE
title           VARCHAR(255)              -- "Day 1 – Kochi → Singapore"
description     TEXT
activities      JSONB NOT NULL            -- [{time: "09:00", icon: "✈️", description: "Airport pickup & transfer"}]
sort_order      INTEGER DEFAULT 0
created_at      TIMESTAMPTZ DEFAULT NOW()
```

> **Generation flow:**
> 1. **Template:** Package has a template → On booking, clone `package_itinerary_template_days` into `itinerary_days`, set `generated_by = 'template'`
> 2. **AI:** Staff clicks "Generate with AI" → Backend sends package items + destination + duration to GPT → AI returns day-by-day JSON → Saved to `itinerary_days`, set `generated_by = 'ai'`
> 3. **Manual:** Staff builds from scratch, set `generated_by = 'manual'`
> 4. **PDF:** Puppeteer renders a branded React template → uploads to S3 → saves URL in `pdf_url`
> 5. **Web page:** `public_slug` maps to `/itinerary/:slug` → mobile-friendly, no login needed

---

## 📦 Module 9 — Payment & Finance

### `payments`
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
tenant_id       UUID NOT NULL REFERENCES tenants(id)
booking_id      UUID NOT NULL REFERENCES bookings(id)
customer_id     UUID NOT NULL REFERENCES customers(id)
amount          NUMERIC(12,2) NOT NULL
payment_type    ENUM('advance','installment','balance','refund')
payment_method  ENUM('cash','bank_transfer','upi','cheque','card','other')
reference       VARCHAR(255)
receipt_url     VARCHAR(500)               -- payment receipt scan/screenshot
paid_at         TIMESTAMPTZ NOT NULL
due_date        DATE
notes           TEXT
recorded_by     UUID NOT NULL REFERENCES users(id)
created_at      TIMESTAMPTZ DEFAULT NOW()
updated_at      TIMESTAMPTZ DEFAULT NOW()
```

### `payment_schedules`
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
tenant_id       UUID NOT NULL REFERENCES tenants(id)
booking_id      UUID NOT NULL REFERENCES bookings(id)
amount_due      NUMERIC(12,2) NOT NULL
due_date        DATE NOT NULL
label           VARCHAR(100)               -- "Advance", "2nd Installment", "Final Balance"
status          ENUM('pending','paid','overdue') DEFAULT 'pending'
payment_id      UUID REFERENCES payments(id)  -- linked once paid
reminder_sent   BOOLEAN DEFAULT false
created_at      TIMESTAMPTZ DEFAULT NOW()
updated_at      TIMESTAMPTZ DEFAULT NOW()
```

> **Note:** When a booking is created, payment schedules are auto-generated (e.g., 50% advance, 50% before travel). When a payment is recorded, the matching schedule row's `status` is set to `paid` and `payment_id` is linked. A cron job checks for overdue schedules and sends WhatsApp reminders.

### `supplier_payments`
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
tenant_id       UUID NOT NULL REFERENCES tenants(id)
supplier_id     UUID NOT NULL REFERENCES suppliers(id)
booking_id      UUID REFERENCES bookings(id)
amount          NUMERIC(12,2) NOT NULL
payment_method  ENUM('cash','bank_transfer','upi','cheque','card','other')
reference       VARCHAR(255)
paid_at         TIMESTAMPTZ
status          ENUM('pending','paid')
due_date        DATE
notes           TEXT
recorded_by     UUID NOT NULL REFERENCES users(id)
created_at      TIMESTAMPTZ DEFAULT NOW()
updated_at      TIMESTAMPTZ DEFAULT NOW()
```

### `expenses`
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
tenant_id       UUID NOT NULL REFERENCES tenants(id)
booking_id      UUID NOT NULL REFERENCES bookings(id)
category        ENUM('visa_fee','porterage','transport','meal','tip','miscellaneous')
description     VARCHAR(255) NOT NULL
amount          NUMERIC(10,2) NOT NULL
receipt_url     VARCHAR(500)
expense_date    DATE NOT NULL
recorded_by     UUID NOT NULL REFERENCES users(id)
created_at      TIMESTAMPTZ DEFAULT NOW()
updated_at      TIMESTAMPTZ DEFAULT NOW()
```

### `notifications`
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
tenant_id       UUID NOT NULL REFERENCES tenants(id)
user_id         UUID NOT NULL REFERENCES users(id)   -- who receives the notification
type            ENUM('new_lead','followup_due','payment_received','payment_overdue',
                     'document_missing','visa_update','booking_update','system')
title           VARCHAR(255) NOT NULL
body            TEXT
-- Polymorphic link to any entity
entity_type     VARCHAR(50)                -- 'lead', 'booking', 'visa_application', etc.
entity_id       UUID                       -- ID of the linked entity
is_read         BOOLEAN DEFAULT false
read_at         TIMESTAMPTZ
created_at      TIMESTAMPTZ DEFAULT NOW()
```

> **Note:** Notifications are created by backend logic when events happen (lead created, payment received, visa updated, etc.). Frontend polls or uses WebSocket for real-time updates. Old notifications can be cleaned up with a retention policy (e.g., delete after 90 days).

---

## 📦 Module 10 — WhatsApp Integration

### `wa_configs`
```sql
id                    UUID PRIMARY KEY DEFAULT gen_random_uuid()
tenant_id             UUID NOT NULL REFERENCES tenants(id) UNIQUE
wa_phone_number_id    VARCHAR(100) NOT NULL
wa_access_token       TEXT NOT NULL         -- encrypted at rest
wa_business_account_id VARCHAR(100)
wa_webhook_verified   BOOLEAN DEFAULT false
bsp_provider          ENUM('meta_direct','wati','interakt','twilio') DEFAULT 'meta_direct'
bsp_api_key           TEXT                  -- encrypted, for BSP option
connected_at          TIMESTAMPTZ
updated_at            TIMESTAMPTZ DEFAULT NOW()
```

### `wa_conversations`
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
tenant_id       UUID NOT NULL REFERENCES tenants(id)
wa_phone        VARCHAR(20) NOT NULL       -- customer's phone number
lead_id         UUID REFERENCES leads(id)
chat_step       INTEGER DEFAULT 0          -- current step in chatbot flow (0-4)
chat_data       JSONB                      -- data collected so far during chatbot
state           ENUM('chatbot','ai','human','opted_out') DEFAULT 'chatbot'
is_active       BOOLEAN DEFAULT true        -- false when conversation is closed
last_message_at TIMESTAMPTZ
created_at      TIMESTAMPTZ DEFAULT NOW()
updated_at      TIMESTAMPTZ DEFAULT NOW()
```

> **Partial unique index** — only one active conversation per phone per tenant:
> ```sql
> CREATE UNIQUE INDEX idx_wa_conv_active ON wa_conversations(tenant_id, wa_phone) WHERE is_active = true;
> ```
> When a customer messages again after a closed conversation, a new row is created. Old conversations are preserved for history.

### `wa_messages`
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
tenant_id       UUID NOT NULL REFERENCES tenants(id)
conversation_id UUID NOT NULL REFERENCES wa_conversations(id)
direction       ENUM('inbound','outbound')
content         TEXT
message_type    ENUM('text','image','document','template')
wa_message_id   VARCHAR(255)               -- Meta's message ID
status          ENUM('sent','delivered','read','failed')
sent_at         TIMESTAMPTZ DEFAULT NOW()
```

### `drip_sequences`
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
tenant_id       UUID NOT NULL REFERENCES tenants(id)
name            VARCHAR(255) NOT NULL      -- "Cold Lead Nurture"
trigger_stage   ENUM('new_lead','quotation_sent','payment_pending','docs_pending','post_trip')
is_active       BOOLEAN DEFAULT true
created_at      TIMESTAMPTZ DEFAULT NOW()
updated_at      TIMESTAMPTZ DEFAULT NOW()
```

### `drip_sequence_steps`
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
tenant_id       UUID NOT NULL REFERENCES tenants(id)
sequence_id     UUID NOT NULL REFERENCES drip_sequences(id) ON DELETE CASCADE
step_number     INTEGER NOT NULL
delay_days      INTEGER NOT NULL           -- days after trigger / previous step
message_template TEXT NOT NULL
step_type       ENUM('whatsapp','email')
created_at      TIMESTAMPTZ DEFAULT NOW()
```

### `drip_jobs`
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
tenant_id       UUID NOT NULL REFERENCES tenants(id)
sequence_id     UUID NOT NULL REFERENCES drip_sequences(id)
step_id         UUID NOT NULL REFERENCES drip_sequence_steps(id)
lead_id         UUID NOT NULL REFERENCES leads(id)
customer_id     UUID NOT NULL REFERENCES customers(id)
scheduled_at    TIMESTAMPTZ NOT NULL
status          ENUM('scheduled','sent','cancelled','failed')
sent_at         TIMESTAMPTZ
bullmq_job_id   VARCHAR(255)               -- for cancellation
created_at      TIMESTAMPTZ DEFAULT NOW()
updated_at      TIMESTAMPTZ DEFAULT NOW()
```

---

## 📦 Module 12 — Customer Portal

### `portal_sessions`
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
tenant_id       UUID NOT NULL REFERENCES tenants(id)
booking_id      UUID NOT NULL REFERENCES bookings(id)
customer_id     UUID NOT NULL REFERENCES customers(id)
otp             VARCHAR(10)                -- hashed
otp_expires_at  TIMESTAMPTZ
token           VARCHAR(255) UNIQUE        -- session token after OTP verified
token_expires_at TIMESTAMPTZ
created_at      TIMESTAMPTZ DEFAULT NOW()
```

---

## 📦 Module 13 — AI Assistant

### `ai_conversations`
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
tenant_id       UUID NOT NULL REFERENCES tenants(id)
lead_id         UUID REFERENCES leads(id)
wa_conversation_id UUID REFERENCES wa_conversations(id)
source          ENUM('whatsapp','crm_chat')
messages        JSONB NOT NULL             -- array of {role, content, timestamp}
tokens_used     INTEGER DEFAULT 0
model           VARCHAR(50)
created_at      TIMESTAMPTZ DEFAULT NOW()
updated_at      TIMESTAMPTZ DEFAULT NOW()
```

---

## 📊 Indexes

```sql
-- Tenant scoping (on every major table)
CREATE INDEX idx_leads_tenant        ON leads(tenant_id);
CREATE INDEX idx_customers_tenant    ON customers(tenant_id);
CREATE INDEX idx_bookings_tenant     ON bookings(tenant_id);
CREATE INDEX idx_quotations_tenant   ON quotations(tenant_id);
CREATE INDEX idx_payments_tenant     ON payments(tenant_id);
CREATE INDEX idx_suppliers_tenant    ON suppliers(tenant_id);
CREATE INDEX idx_notifications_tenant ON notifications(tenant_id);

-- Frequent lookups
CREATE INDEX idx_leads_status        ON leads(tenant_id, status);
CREATE INDEX idx_leads_assigned      ON leads(tenant_id, assigned_to);
CREATE INDEX idx_bookings_status     ON bookings(tenant_id, status);
CREATE INDEX idx_bookings_travel_date ON bookings(tenant_id, travel_date);
CREATE INDEX idx_followups_due       ON followups(tenant_id, due_at, status);
CREATE INDEX idx_payments_booking    ON payments(booking_id);
CREATE INDEX idx_drip_jobs_scheduled ON drip_jobs(tenant_id, scheduled_at, status);
CREATE INDEX idx_documents_traveller ON traveller_documents(traveller_id, doc_type);
CREATE INDEX idx_visa_booking        ON visa_applications(booking_id);

-- Payment schedules (for cron job checking overdue)
CREATE INDEX idx_payment_schedules_due ON payment_schedules(tenant_id, due_date, status);

-- Notifications (unread per user)
CREATE INDEX idx_notifications_user  ON notifications(user_id, is_read, created_at);

-- WhatsApp (partial unique — one active conversation per phone per tenant)
CREATE UNIQUE INDEX idx_wa_conv_active ON wa_conversations(tenant_id, wa_phone) WHERE is_active = true;
```

---

## 🔑 Key Relationships

```
tenants
  ├── users (staff)
  ├── customers
  │     └── leads → followups, lead_notes
  │           └── quotations → quotation_items
  │                 └── bookings
  │                       ├── travellers → traveller_documents
  │                       ├── visa_applications → visa_checklist_items
  │                       ├── payments
  │                       ├── payment_schedules → payments
  │                       ├── supplier_payments → suppliers
  │                       ├── supplier_bookings → suppliers
  │                       ├── expenses
  │                       └── itineraries → itinerary_days
  │
  ├── packages → package_items → suppliers
  │     └── package_itinerary_templates → package_itinerary_template_days
  ├── wa_configs
  ├── wa_conversations → wa_messages, ai_conversations
  ├── drip_sequences → drip_sequence_steps → drip_jobs → leads
  ├── notifications → users
  ├── portal_sessions → bookings, customers
  ├── destination_visa_templates (tenant-specific or global)
  ├── tenant_features
  └── tenant_billing

plans (standalone, referenced by tenants.plan_id)
platform_leads (standalone, Super Admin only)
```

---

## ✅ Tables Summary

| # | Table | Module |
|---|---|---|
| 1 | tenants | Platform |
| 2 | plans | Platform |
| 3 | tenant_features | Platform |
| 4 | users | Platform |
| 5 | platform_leads | Platform |
| 6 | tenant_billing | Platform |
| 7 | customers | Module 1 — Lead & CRM |
| 8 | leads | Module 1 — Lead & CRM |
| 9 | followups | Module 1 — Lead & CRM |
| 10 | lead_notes | Module 1 — Lead & CRM |
| 11 | packages | Module 2 — Package Builder |
| 12 | package_items | Module 2 — Package Builder |
| 13 | quotations | Module 3 — Quotation System |
| 14 | quotation_items | Module 3 — Quotation System |
| 15 | bookings | Module 4 — Booking Management |
| 16 | travellers | Module 5 — Traveller & Documents |
| 17 | traveller_documents | Module 5 — Traveller & Documents |
| 18 | visa_applications | Module 6 — Visa Management |
| 19 | visa_checklist_items | Module 6 — Visa Management |
| 20 | destination_visa_templates | Module 6 — Visa Management |
| 21 | suppliers | Module 7 — Supplier Management |
| 22 | supplier_bookings | Module 7 — Supplier Management |
| 23 | package_itinerary_templates | Module 8 — Itinerary Builder |
| 24 | package_itinerary_template_days | Module 8 — Itinerary Builder |
| 25 | itineraries | Module 8 — Itinerary Builder |
| 26 | itinerary_days | Module 8 — Itinerary Builder |
| 27 | payments | Module 9 — Payment & Finance |
| 28 | payment_schedules | Module 9 — Payment & Finance |
| 29 | supplier_payments | Module 9 — Payment & Finance |
| 30 | expenses | Module 9 — Payment & Finance |
| 31 | notifications | Notifications (cross-module) |
| 32 | wa_configs | Module 10 — WhatsApp Integration |
| 33 | wa_conversations | Module 10 — WhatsApp Integration |
| 34 | wa_messages | Module 10 — WhatsApp Integration |
| 35 | drip_sequences | Module 10 — WhatsApp Integration |
| 36 | drip_sequence_steps | Module 10 — WhatsApp Integration |
| 37 | drip_jobs | Module 10 — WhatsApp Integration |
| 38 | portal_sessions | Module 12 — Customer Portal |
| 39 | ai_conversations | Module 13 — AI Assistant |

> **Total: 39 tables** (6 platform + 33 tenant-scoped)

*Last Updated: September 3, 2026*
