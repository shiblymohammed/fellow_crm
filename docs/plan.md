# Fellow CRM — Travel CRM + Operations Management System

> **Vision:** A multi-tenant operating system for small and medium travel agencies — not just a CRM.
> **Target:** Kerala-based outbound travel companies handling Malaysia, Singapore, Thailand & similar destinations.
> **Model:** Sales-driven SaaS — no self-serve signup. Super Admin provisions agencies manually.

---

## 🔄 Core Workflow Pipeline

The entire application revolves around this pipeline:

```
LEAD → ENQUIRY → QUOTATION → FOLLOW-UP → CONFIRMED → BOOKING → PAYMENT → DOCUMENTS → VISA → SUPPLIER BOOKINGS → ITINERARY → TRAVEL → COMPLETED → FEEDBACK / REPEAT CUSTOMER
```

---

## 🔐 Platform Architecture — Multi-Tenant SaaS

### How It Works

```
MARKETING SITE (public)
  └── Contact Form → "I'm interested in Fellow CRM"
        ↓
SUPER ADMIN DASHBOARD (you)
  ├── See all inbound leads from contact form
  ├── Contact the agency via call / WhatsApp
  ├── Close the sale manually
  ├── Create agency account + assign plan
  ├── Toggle features per agency based on plan
  └── Manage all tenants from one place
        ↓
AGENCY WORKSPACE (the customer)
  ├── Agency Owner logs in → sees only their data
  ├── Creates their own staff (Sales, Operations, etc.)
  └── Uses the CRM modules enabled for their plan
```

### Role Hierarchy

| Role | Scope | What They Can Do |
|---|---|---|
| **Super Admin** (You) | Entire platform | Create/manage agencies, assign plans, toggle features, view all data, platform analytics |
| **Agency Owner** | Their agency only | Manage their staff, settings, and all CRM data within their workspace |
| **Agency Manager** | Their agency only | Oversee sales team, approve quotations, view reports |
| **Sales Staff** | Their agency only | Manage leads, create quotations, follow-ups |
| **Operations Staff** | Their agency only | Manage bookings, documents, visa, suppliers, itineraries |
| **Accounts Staff** | Their agency only | Manage payments, expenses, financial reports |

### Subscription & Plan Management

> **No automated payments. No self-serve. 100% sales-driven.**

| Step | Action |
|---|---|
| 1 | Agency discovers Fellow CRM (website, referral, marketing) |
| 2 | Agency fills **contact form** on marketing site |
| 3 | Lead appears in **Super Admin dashboard** |
| 4 | You (Super Admin) contact them, demo the product, close the sale |
| 5 | You **manually create** their agency account |
| 6 | You **assign a plan** (Basic, Pro, Enterprise, or custom) |
| 7 | You **toggle features** — enable/disable modules per their plan |
| 8 | Agency Owner receives login credentials |
| 9 | Renewal / upgrades handled via direct communication |

### Feature Toggle System

Super Admin can enable/disable any module per agency:

| Module | Basic | Pro | Enterprise | Custom |
|---|---|---|---|---|
| Leads & CRM | ✅ | ✅ | ✅ | Configurable |
| Packages | ✅ | ✅ | ✅ | Configurable |
| Quotations | ✅ | ✅ | ✅ | Configurable |
| Bookings | ✅ | ✅ | ✅ | Configurable |
| Payments | ✅ | ✅ | ✅ | Configurable |
| Documents | ❌ | ✅ | ✅ | Configurable |
| Visa Management | ❌ | ✅ | ✅ | Configurable |
| Supplier Management | ❌ | ✅ | ✅ | Configurable |
| Itinerary Builder | ❌ | ✅ | ✅ | Configurable |
| WhatsApp Lead Chatbot | ✅ | ✅ | ✅ | Configurable |
| WhatsApp Automation & Drip | ❌ | ✅ | ✅ | Configurable |
| AI Assistant | ❌ | ❌ | ✅ | Configurable |
| AI Conversations/month | — | — | 2,000 | Configurable |
| Reports & Analytics | Basic | Full | Full | Configurable |
| PDF Generation | ❌ | ✅ | ✅ | Configurable |
| Customer Portal | ❌ | ❌ | ✅ | Configurable |

> Plans and feature mappings are fully customizable by Super Admin — not hardcoded.

### Super Admin Dashboard

| Section | What You See |
|---|---|
| **Inbound Leads** | Contact form submissions, status, follow-up notes |
| **Agencies** | All active agencies, their plan, status, expiry |
| **Plans** | Create/edit subscription plans and pricing |
| **Feature Control** | Toggle modules on/off per agency |
| **WhatsApp Status** | Which agencies have connected their WhatsApp number |
| **AI Usage** | Monthly AI conversations used vs limit per agency |
| **Platform Analytics** | Total agencies, total bookings across platform, revenue |
| **Agency Health** | Which agencies are active, inactive, churning |
| **Billing** | Manual payment tracking per agency (invoice, paid, pending) |

### Data Isolation

- Every database table has a `tenant_id` column
- Agency A can **never** see Agency B's data
- Super Admin can view **all** data across tenants
- All API requests are scoped to the logged-in user's tenant

### AI Token Management

> **Model: Platform pays. You absorb the cost, price it into the subscription.**

#### How It Works

```
Agency staff / customer triggers AI (WhatsApp chat, package suggestion, etc.)
      ↓
YOUR backend checks:
  1. Is AI enabled for this tenant? (feature flag)
  2. Has this tenant exceeded their monthly limit?
      ├── Yes exceeded → Return: "AI limit reached, upgrade plan"
      └── No → Call OpenAI API (YOUR single API key)
            ↓
      Increment tenant's ai_conversations_used counter
            ↓
      Return response to WhatsApp / CRM
```

#### AI Usage Limits Per Plan

| Plan | AI Conversations/month | What Happens When Exceeded |
|---|---|---|
| Basic | 0 | AI not available |
| Pro | 0 | AI not available |
| Enterprise | 2,000 | AI disabled, notify agency to upgrade |
| Custom | Set manually by Super Admin | Per agreement |

#### Your Cost vs Revenue

| Agency Count | Avg AI Conversations/month | Your AI Cost | What You Charge |
|---|---|---|---|
| 10 agencies | 1,000 each | ~₹1,000/month | Priced into Enterprise plan |
| 50 agencies | 1,000 each | ~₹5,000/month | Priced into Enterprise plan |
| 100 agencies | 1,000 each | ~₹10,000/month | Priced into Enterprise plan |

> At ₹0.10 per conversation (GPT-4o-mini), AI costs are negligible vs subscription revenue.

#### DB Schema (per tenant)

```sql
tenants table:
  ai_enabled                boolean   -- from feature flag
  ai_conversations_used     integer   -- resets on 1st of every month
  ai_conversations_limit    integer   -- set by Super Admin per plan
  ai_model                  varchar   -- 'gpt-4o-mini' (platform default)
  ai_usage_reset_at         date      -- next reset date
```

#### AI Model
- **GPT-4o-mini** (OpenAI) — platform default for all agencies
- One OpenAI API key on your backend — never exposed to agencies
- You can upgrade to GPT-4o for specific agencies if needed
- Model can be swapped to Gemini Flash or Claude Haiku without agency noticing

---

## 📦 Module 1 — Lead & CRM

### Purpose
Capture, track, and nurture every potential customer from first contact to conversion — **automatically**, even while you sleep.

### Features

| Feature | Description |
|---|---|
| **Lead Capture** | New enquiry from WhatsApp / phone / website / walk-in / Instagram / Facebook |
| **Auto Lead via WhatsApp** | Chatbot qualifies leads in 4 steps → auto-creates in CRM |
| **Customer Profile** | Full contact details, travel history, preferences |
| **Lead Details** | Number of travellers, destination, travel dates, budget, adults/children count, preferred hotels |
| **Lead Source Tracking** | WhatsApp, phone, website, walk-in, referral, Instagram, Facebook, Google Ads |
| **Salesperson Assignment** | Auto-assign or manually assign leads to sales staff |
| **Lead Status** | New → Contacted → Interested → Quotation Sent → Negotiating → Won → Lost |
| **Follow-up Reminders** | Scheduled follow-up dates with notifications |
| **Communication Log** | WhatsApp/call notes with timestamps |
| **CRM Notifications** | Push/in-app notifications for every new lead |

### 🤖 Automated WhatsApp Lead Capture (Key Feature)

> **Scenario:** You run an Instagram ad campaign at night. By morning, all leads are qualified and sitting in your CRM with full details + notifications.

#### How It Works

```
INSTAGRAM / FACEBOOK AD
  └── "Click to WhatsApp" CTA
        ↓
CUSTOMER LANDS ON WHATSAPP
  └── Automated chatbot starts a 4-step qualification
        ↓
STEP 1: 👋 "Hi! Welcome to [Agency Name]. Where would you like to travel?"
  └── Customer replies: "Singapore"
        ↓
STEP 2: 📅 "Great! When are you planning to travel? (e.g., Dec 15-20)"
  └── Customer replies: "December 15"
        ↓
STEP 3: 👥 "How many travellers? (Adults & Children)"
  └── Customer replies: "2 adults, 1 child"
        ↓
STEP 4: 💰 "What's your approximate budget per person?"
  └── Customer replies: "₹60,000"
        ↓
CHATBOT RESPONDS:
  └── "Thank you! Our travel expert will contact you shortly with 
       the best Singapore packages. 🌟"
        ↓
CRM (AUTOMATIC)
  ├── New lead created with all 4 details
  ├── Source tagged: "Instagram → WhatsApp"
  ├── Status: "New"
  ├── Assigned to next available salesperson (round-robin or rules)
  └── 🔔 Notification sent to salesperson + agency owner
```

#### What The Agency Owner Sees Next Morning

```
🔔 12 new leads overnight

┌─────────────────────────────────────────────────────┐
│  Lead #1 — Rahul (via Instagram → WhatsApp)         │
│  📍 Singapore │ 📅 Dec 15 │ 👥 2A+1C │ 💰 ₹60K/pp  │
│  Status: New │ Assigned: Salesperson A              │
├─────────────────────────────────────────────────────┤
│  Lead #2 — Priya (via Instagram → WhatsApp)         │
│  📍 Thailand │ 📅 Jan 5 │ 👥 4A │ 💰 ₹45K/pp       │
│  Status: New │ Assigned: Salesperson B              │
├─────────────────────────────────────────────────────┤
│  Lead #3 — Arun (via Facebook → WhatsApp)           │
│  📍 Malaysia │ 📅 Dec 22 │ 👥 2A+2C │ 💰 ₹50K/pp   │
│  Status: New │ Assigned: Salesperson A              │
└─────────────────────────────────────────────────────┘
```

#### Lead Sources That Auto-Capture

| Source | How It Reaches CRM |
|---|---|
| Instagram Ad → WhatsApp | Chatbot qualifies → auto-create lead |
| Facebook Ad → WhatsApp | Chatbot qualifies → auto-create lead |
| Google Ad → WhatsApp | Chatbot qualifies → auto-create lead |
| Website Contact Form | Form submission → auto-create lead |
| Direct WhatsApp Message | Chatbot qualifies → auto-create lead |
| Phone Call | Salesperson manually creates lead |
| Walk-in | Salesperson manually creates lead |
| Referral | Salesperson manually creates lead |

### Example Lead Entry
```
Rahul → Singapore → 3 people (2A+1C) → Dec 15 → ₹60K/pp budget → Source: Instagram → WhatsApp → Status: New → Assigned: Salesperson A
```

---

## 📦 Module 2 — Package Builder

> **⭐ One of the most critical modules**

### Purpose
Create reusable travel packages that sales staff can customize per customer, with full cost/profit tracking.

### Features

| Feature | Description |
|---|---|
| **Reusable Templates** | Create base packages (e.g., "Singapore 5D/4N") |
| **Package Components** | Flights, Hotel, Airport Transfer, Activities, Tours, Meals, Visa, Travel Insurance |
| **Per-Customer Customization** | Sales staff can modify any package for a specific customer |
| **Cost Structure** | Supplier Cost → Markup → Customer Price → Profit (per line item) |
| **Auto Profit Calculation** | System automatically calculates gross profit |
| **Destination-wise Packages** | Organize by Singapore, Malaysia, Thailand, Bali, Dubai, etc. |
| **Duration Variants** | 3D/2N, 5D/4N, 7D/6N variants of same destination |

### Example Cost Breakdown

| Item | Supplier Cost | Customer Price |
|---|---|---|
| Hotel | ₹55,000 | ₹65,000 |
| Activities | ₹30,000 | ₹38,000 |
| Transfers | ₹12,000 | ₹16,000 |
| Visa | ₹8,000 | ₹10,000 |
| **Total** | **₹1,05,000** | **₹1,29,000** |

> **Gross Profit: ₹24,000** (auto-calculated)

---

## 📦 Module 3 — Quotation System

### Purpose
Generate professional quotations from packages and send them to customers.

### Quotation Creation Flow
1. Salesperson clicks **"Create Quotation"**
2. Selects: Destination, Dates, Travellers, Package, Hotels, Activities, Transport, Visa, Flights
3. System generates a **professional quotation PDF**
4. Send via **WhatsApp** or email

### Quotation Output Example
```
╔══════════════════════════════════════════════╗
║  Singapore Holiday — 5 Days / 4 Nights       ║
║  ₹64,500 / person                            ║
║                                               ║
║  Includes:                                    ║
║  ✓ Hotel (4-star)                             ║
║  ✓ Airport transfers                          ║
║  ✓ City tour + Sentosa + Universal Studios    ║
║  ✓ Visa assistance                            ║
║  ✓ Travel insurance                           ║
║  ✓ Daily breakfast                            ║
╚══════════════════════════════════════════════╝
```

### Quotation Statuses
`Draft → Sent → Viewed → Accepted → Rejected → Expired → Revised`

---

## 📦 Module 4 — Booking Management

### Purpose
Convert accepted quotations into confirmed bookings and manage the entire booking lifecycle.

### Features

| Feature | Description |
|---|---|
| **Quotation → Booking Conversion** | One-click conversion from accepted quotation |
| **Booking ID** | Auto-generated unique ID (e.g., `TRV-2026-1028`) |
| **Booking Details** | Customer, travellers, destination, travel dates, package |
| **Financial Summary** | Total amount, amount paid, balance, payment deadlines |
| **Employee Assignment** | Assigned operations staff |
| **Booking Status** | Confirmed → Documents Pending → Visa Processing → Ready → Travelling → Completed → Cancelled |

### Auto-created on Conversion
- Booking record with unique ID
- Payment schedule
- Document checklist per traveller
- Visa processing entry
- Supplier booking tasks

---

## 📦 Module 5 — Traveller & Document Management

### Purpose
Track every document for every traveller across all bookings — critical for outbound travel.

### Per-Traveller Documents

| Document | Required |
|---|---|
| Passport (copy) | ✅ |
| Passport Expiry Date | ✅ |
| Passport-size Photo | ✅ |
| PAN Card | ✅ |
| Aadhaar Card | ✅ |
| Visa Documents | ✅ |
| Flight Tickets | ✅ |
| Travel Insurance | ✅ |
| Hotel Vouchers | Optional |
| Other Documents | Optional |

### Document Status Indicators
- 🟢 **Received** — Document uploaded and verified
- 🟡 **Pending** — Awaiting from customer
- 🔴 **Missing / Rejected** — Needs immediate attention

### Automatic Reminders
- `"Passport for Mohammed is missing."`
- `"Passport for Aisha expires in 30 days — renewal needed."`
- `"Photo for Rahul is pending — visa submission deadline in 3 days."`

---

## 📦 Module 6 — Visa Management

### Purpose
Dedicated module for visa processing workflow — not just a checkbox.

### Features

| Feature | Description |
|---|---|
| **Visa Tracking Board** | Kanban/table view per booking |
| **Per-Traveller Status** | Track each traveller's visa independently |
| **Document Checklist** | Destination-specific required documents |
| **Submission Tracking** | Date submitted, processing time, expected date |
| **Status Flow** | Not Started → Documents Collecting → Submitted → Processing → Approved → Rejected |
| **Destination Checklists** | Pre-built checklists per country (Singapore, Malaysia, Thailand, etc.) |

### Example Visa Board — Booking #TRV-2026-1028

| Traveller | Passport | Documents | Submitted | Status |
|---|---|---|---|---|
| Traveller A | ✓ | ✓ | ✓ | 🔄 Processing |
| Traveller B | ✓ | ⚠️ Incomplete | — | 🟡 Pending |
| Traveller C | ✓ | ✓ | ✓ | 🟢 Approved |

---

## 📦 Module 7 — Supplier Management

### Purpose
A dedicated CRM for all suppliers the company works with.

### Supplier Types
- Hotels & Resorts
- DMCs (Destination Management Companies)
- Transport / Transfer Companies
- Tour & Activity Providers
- Visa Processing Agents
- Airlines
- Insurance Providers

### Per-Supplier Data

| Field | Description |
|---|---|
| Company Name | Official business name |
| Contact Person | Primary point of contact |
| WhatsApp / Phone | Communication channels |
| Destination(s) | Countries/cities they cover |
| Services Offered | Hotel, transfer, tours, visa, etc. |
| Contract / Rates | Agreed rates and validity |
| Payment Terms | Advance, net-30, per-booking, etc. |
| Outstanding Payments | Current payable amount |
| Booking History | Past bookings with this supplier |
| Rating / Notes | Internal quality notes |

---

## 📦 Module 8 — Itinerary Builder

### Purpose
Generate beautiful, customer-facing day-by-day itineraries after booking confirmation — via templates, AI, or manual creation.

### How Itineraries Get Created

```
BOOKING CONFIRMED
      ↓
Does the package have a pre-built itinerary template?
      ├── YES → Auto-clone template → Staff tweaks dates/details → Done
      ├── NO + AI enabled → Staff clicks "Generate with AI"
      │     → AI drafts full itinerary from package items + destination + duration
      │     → Staff reviews, edits, saves → Done
      └── NO + Manual → Staff builds day-by-day from scratch → Done
```

### Itinerary Template System

> **Key idea:** When creating a package (e.g., "Singapore 5D/4N"), staff also builds a default itinerary template. When a booking uses that package, the template is auto-cloned — saving hours of repeated work.

| Step | What Happens |
|---|---|
| 1 | Staff creates Package "Singapore 5D/4N" in Package Builder |
| 2 | Staff clicks "Add Itinerary Template" on the package |
| 3 | Builds day-by-day activities (reusable for every customer) |
| 4 | Customer books this package → template auto-clones into a real itinerary |
| 5 | Staff adjusts dates, hotel names, flight times for this specific booking |
| 6 | Generate PDF + shareable link → send to customer |

### AI Generation (Enterprise Only)

When no template exists, staff can generate an itinerary with AI:

```
Staff clicks "Generate with AI"
      ↓
Backend sends to GPT-4o-mini:
  - Destination: Singapore
  - Duration: 5D/4N
  - Package items: [Hotel, City Tour, Universal Studios, Sentosa, Airport Transfer]
  - Travel dates: Dec 15-19
      ↓
AI returns structured JSON:
  [{day: 1, title: "Arrival & City Tour", activities: [...]},
   {day: 2, title: "Universal Studios", activities: [...]}, ...]
      ↓
Saved to itinerary_days → Staff reviews and edits → Done
```

### Example Itinerary Output

```
📅 Day 1  ✈️  Kochi → Singapore
           🚐  Airport pickup & transfer
           🏨  Hotel check-in — Marina Bay Sands
           🌃  Evening free / Marina Bay walk

📅 Day 2  🌆  Singapore City Tour
           🌴  Gardens by the Bay
           🍽️  Lunch at Chinatown
           🎡  Singapore Flyer (evening)

📅 Day 3  🎢  Universal Studios Singapore
           🏝️  Sentosa Island
           🌊  S.E.A. Aquarium

📅 Day 4  🛍️  Orchard Road Shopping
           🌃  Night Safari

📅 Day 5  🏨  Hotel checkout
           🚐  Airport transfer
           ✈️  Singapore → Kochi
```

### Output Pipeline

| Format | How It's Generated | Delivery |
|---|---|---|
| **PDF** | Puppeteer renders a branded React template with agency logo + colors → PDF | Stored in S3, URL saved in `itineraries.pdf_url` |
| **Web page** | `public_slug` maps to `/itinerary/:slug` — mobile-friendly, no login needed | Share link via WhatsApp |
| **WhatsApp text** | Simplified text version auto-generated from `itinerary_days` data | Sent as WhatsApp message |

### Shareable Link

```
https://agencyname.fellow.app/itinerary/abc123
```

- No login needed — customer opens and sees their full trip plan
- Mobile-first design with day cards, icons, and timeline
- Branded with agency's logo and colors
- Can be bookmarked and shared with co-travellers

---

## 📦 Module 9 — Payment & Finance

### Purpose
Track every rupee — customer payments, supplier payables, and profit.

### Per-Booking Financial View

| Field | Amount |
|---|---|
| Package Total | ₹2,40,000 |
| Amount Paid | ₹1,00,000 |
| Balance Due | ₹1,40,000 |

### Tracking Features

| Feature | Description |
|---|---|
| **Advance Payment** | Initial deposit tracking |
| **Installments** | Multiple payment schedule support |
| **Payment Dates** | Due dates with reminders |
| **Customer Balance** | Outstanding amount per customer |
| **Supplier Payable** | Amount owed to each supplier per booking |
| **Profit Calculation** | Customer price − supplier cost − expenses = profit |
| **Refund Management** | Track refunds and cancellation charges |
| **Expense Tracking** | Miscellaneous expenses per booking |

### Accounts Dashboard (Overview)

| Metric | Example |
|---|---|
| Today's Collections | ₹1,80,000 |
| Pending Customer Payments | ₹14,50,000 |
| Supplier Payable | ₹8,20,000 |
| Expected Profit | ₹4,60,000 |

### Expense Tracking

Every booking has its own expense ledger:

| Expense Type | Example |
|---|---|
| Visa agent fee (extra) | ₹500 per applicant |
| Porterage / tips | ₹1,000 |
| Extra transport | ₹2,500 |
| Meal upgrade | ₹3,000 |
| Miscellaneous | Any ad-hoc cost |

- Expenses are deducted from booking profit automatically
- Each expense has: amount, category, date, added by, receipt upload
- Reflected in P&L: `Profit = Customer Price − Supplier Cost − Expenses`

---

## 📦 Module 10 — WhatsApp Integration

### Purpose
The agency's **most powerful channel** — automate lead capture, customer communication, and notifications at every pipeline stage.

### A. Lead Capture Chatbot (Core Feature)

The WhatsApp chatbot is the **frontline salesperson** that works 24/7:

| Step | Bot Message | Customer Response |
|---|---|---|
| **Step 1** | 👋 "Hi! Welcome to [Agency]. Where would you like to travel?" | "Singapore" |
| **Step 2** | 📅 "When are you planning to travel?" | "December 15" |
| **Step 3** | 👥 "How many travellers? (Adults & Children)" | "2 adults, 1 child" |
| **Step 4** | 💰 "What's your approximate budget per person?" | "₹60,000" |
| **Done** | ✅ "Thank you! Our expert will contact you shortly. 🌟" | — |

**After Step 4 → CRM automatically:**
- Creates a new lead with all details
- Tags source (Instagram / Facebook / Direct / Google)
- Assigns to salesperson (round-robin or rules-based)
- Sends notification to salesperson + agency owner

### B. Campaign Integration

| Ad Platform | Flow |
|---|---|
| **Instagram Ads** | "Click to WhatsApp" CTA → Chatbot qualifies → Lead in CRM |
| **Facebook Ads** | "Click to WhatsApp" CTA → Chatbot qualifies → Lead in CRM |
| **Google Ads** | Click-to-message extension → Chatbot qualifies → Lead in CRM |
| **Website** | WhatsApp widget → Chatbot qualifies → Lead in CRM |

> **Result:** Agency runs campaign at night → wakes up to qualified, organized leads with notifications.

### C. Pipeline Automated Messages

| Trigger | Message to Customer |
|---|---|
| Lead Captured | ✅ Acknowledgement + "Our team will reach out soon" |
| Quotation Generated | 📄 Send quotation PDF/link |
| Payment Pending | 💰 Payment reminder with amount + deadline |
| Payment Received | ✅ Receipt confirmation |
| Documents Missing | ⚠️ "Please submit your passport copy" |
| Visa Submitted | 📋 "Your visa has been submitted for processing" |
| Visa Approved | 🎉 "Your visa is approved!" |
| Trip Tomorrow | ✈️ Travel reminder with checklist + itinerary link |
| Trip Completed | ⭐ Feedback request + review link |

### D. Internal Notifications (to Staff)

| Trigger | Notification to Staff |
|---|---|
| New Lead | 🔔 "New lead: Rahul — Singapore — ₹60K/pp" |
| Follow-up Due | ⏰ "Follow up with Priya today — Thailand enquiry" |
| Payment Overdue | 🚨 "Payment overdue: Booking #TRV-1028 — ₹1.4L balance" |
| Document Missing | 📎 "Passport missing for Mohammed — Booking #TRV-1032" |
| Visa Rejected | ❌ "Visa rejected for Aisha — immediate action needed" |

### E. AI Assistant (Advanced)
- Handle first-level WhatsApp conversations beyond the 4-step flow
- Answer common queries (pricing, availability, documents needed, visa requirements)
- Suggest packages based on customer's stated budget + destination (RAG from agency's own packages DB)
- Route complex queries to the right salesperson
- Send follow-up messages if customer goes silent for X days

### F. Automated Follow-Up Sequences (Drip Messaging)

> **The system messages customers automatically — no salesperson action needed.**

#### How It Works

```
LEAD CAPTURED (Day 0)
  └── ✅ "Hi Rahul! Thanks for your interest in Singapore travel.
         Our expert will contact you shortly. 🌟"
              ↓ (no reply for 1 day)
DAY 1 AUTO FOLLOW-UP
  └── "Hi Rahul, did you get a chance to look into our Singapore packages?
         We have some great options for December. 😊"
              ↓ (still no reply)
DAY 3 AUTO FOLLOW-UP
  └── "🌴 Special: Singapore 5D/4N at ₹59,500/pp this week only!
         Includes hotel, transfers, Universal Studios & visa.
         Interested? Reply YES and we'll send full details."
              ↓ (still no reply)
DAY 7 AUTO FOLLOW-UP
  └── "Hey Rahul, we'd love to help plan your Singapore trip.
         No pressure — reply anytime when you're ready! ✈️"
              ↓ (still no reply)
DAY 14 → Mark lead as COLD. Stop messaging.
```

#### Sequence Rules

| Rule | Behaviour |
|---|---|
| **Customer replies** | Stop sequence immediately, notify salesperson |
| **Customer books** | Stop sequence, move to booking flow |
| **Customer says STOP** | Opt-out, never message again |
| **Sequence completes** | Mark lead as Cold automatically |
| **Agency configures timing** | Each agency sets their own day intervals |
| **Agency configures messages** | Each agency writes their own template messages |

#### Sequences per Pipeline Stage

| Stage | Sequence Name | Purpose |
|---|---|---|
| New Lead (no contact yet) | Cold Lead Nurture | Build interest, share packages |
| Quotation Sent | Quotation Follow-up | Nudge customer to accept |
| Payment Pending | Payment Reminder | Remind about due amount |
| Documents Pending | Document Nudge | Remind to submit documents |
| Trip Completed | Post-Trip Feedback | Collect reviews, offer next trip |

#### Tech Implementation
- **BullMQ** (job queue) schedules delayed jobs per message
- When a job fires → backend sends WhatsApp message via API
- When customer replies → webhook cancels all pending jobs for that lead
- All sequences stored in DB — agency edits them from their dashboard
- **No n8n needed** — fully on your backend

### G. WhatsApp Number Management Per Agency

> **Each agency uses their OWN WhatsApp Business number — never a shared number.**

#### Why Separate Numbers?

| Issue | Shared Number | Separate Number |
|---|---|---|
| Brand identity | ❌ Generic number, no trust | ✅ Agency's own business name shows |
| Data privacy | ❌ All chats mixed | ✅ Fully isolated per agency |
| Customer confusion | ❌ "Who is this?" | ✅ Clear agency identity |
| Regulatory | ❌ Risky for WhatsApp ToS | ✅ Compliant |

#### How It Works (Per Agency)

```
META BUSINESS ACCOUNT (each agency owns theirs)
  └── WhatsApp Business Phone Number (agency's own number)
        └── Connected to Meta Cloud API
              └── Webhook points to YOUR backend
                    └── Backend routes by phone number → tenant_id
```

#### Onboarding Flow When Agency Subscribes

| Step | Who Does It | What Happens |
|---|---|---|
| 1 | Agency | Creates a **Meta Business Account** (free, one-time) |
| 2 | Agency | Adds their WhatsApp Business number to Meta |
| 3 | Agency | Generates a **WhatsApp Cloud API token** |
| 4 | Agency Owner | Pastes token + phone number ID in Fellow CRM settings |
| 5 | Your Backend | Registers the webhook URL with Meta for that number |
| 6 | Your Backend | Stores `{ tenant_id, wa_phone_number_id, wa_access_token }` |
| 7 | Done | All messages from that number route to that agency's CRM |

> **You (Super Admin) never touch their WhatsApp number.** Agency does it themselves in 10 minutes via a guided setup wizard in the CRM.

#### How Your Backend Routes Messages

```
INBOUND WEBHOOK (from Meta)
  └── POST /api/webhooks/whatsapp
        ├── payload contains: phone_number_id = "1234567890"
        ├── Backend looks up: SELECT tenant_id FROM wa_configs
        │                     WHERE phone_number_id = '1234567890'
        ├── Found: tenant_id = Agency A
        └── Process message in Agency A's context
```

#### What's Stored Per Agency in DB

| Field | Description |
|---|---|
| `tenant_id` | Links to the agency |
| `wa_phone_number_id` | Meta's phone number identifier |
| `wa_access_token` | API token (encrypted at rest) |
| `wa_business_account_id` | Meta Business Account ID |
| `wa_webhook_verified` | Whether webhook is active |
| `wa_connected_at` | When it was connected |

#### BSP Option (Easier for Non-Technical Agencies)

If an agency finds the Meta setup complex, they can use a **BSP (Business Solution Provider)** like WATI or Interakt:

| Setup Type | Who Does It | Complexity | Cost |
|---|---|---|---|
| Meta Cloud API (direct) | Agency (guided by wizard) | Medium | Free API |
| WATI / Interakt | Agency (very easy) | Easy | ₹2-5K/month extra |
| Twilio | Agency (guided) | Medium | Per-message pricing |

Your backend supports **both** — agency just provides the API credentials, backend handles the rest.

---

## 📦 Module 11 — Dashboard

### Purpose
Owner opens the app and immediately sees the full business health.

### Dashboard Sections

#### 📊 Sales
| Metric | Description |
|---|---|
| New Enquiries | Today / this week / this month |
| Active Leads | Currently in pipeline |
| Quotations Sent | Pending response |
| Conversion Rate | Leads → Bookings percentage |
| Today's Follow-ups | Scheduled for today |

#### 📋 Bookings
| Metric | Description |
|---|---|
| Upcoming Trips | Next 7 / 15 / 30 days |
| Confirmed Bookings | Ready to travel |
| Pending Bookings | Awaiting confirmation / payment |

#### 💰 Finance
| Metric | Description |
|---|---|
| Today's Collection | Cash received today |
| Outstanding Payments | Total receivables |
| Supplier Payments Due | Total payables |
| Expected Profit | Projected margin |

#### ⚙️ Operations
| Metric | Description |
|---|---|
| Visa Pending | Travellers awaiting visa |
| Documents Pending | Missing documents count |
| Flights Pending | Unbooked flights |
| Hotel Confirmation Pending | Awaiting supplier confirmation |

#### 📈 Performance
| Metric | Description |
|---|---|
| Salesperson-wise Sales | Revenue per employee |
| Destination-wise Sales | Revenue per destination |
| Monthly Revenue | Trend chart |
| Monthly Profit | Trend chart |

---

## 📦 Module 12 — Customer Portal

### Purpose
A self-service portal where customers can track their own booking without calling the agency.

> **Plan availability:** Enterprise only (feature toggle)

### What Customers Can Do

| Feature | Description |
|---|---|
| **Booking Status** | View current status (Documents Pending / Visa Processing / Ready / etc.) |
| **Document Upload** | Upload passport, photo, PAN, Aadhaar directly |
| **Document Status** | See which documents are received / pending / missing |
| **Itinerary View** | View and download their trip itinerary |
| **Payment Summary** | See total paid, balance due, payment deadlines |
| **Visa Status** | See visa status per traveller |
| **Contact Agent** | One-tap WhatsApp / call to their assigned agent |

### How Customers Access It
- Agency shares a **unique booking link** via WhatsApp
- No app download needed — mobile-friendly web page
- Secured with **OTP login** (customer's registered phone number)
- Each booking link is scoped to that customer only

---

## 📦 Module 13 — AI Sales Assistant

### Purpose
An intelligent assistant that helps sales staff work faster and helps customers get answers instantly.

> **Plan availability:** Enterprise only — 2,000 conversations/month included, platform pays OpenAI

### Features

| Feature | Description |
|---|---|
| **Package Drafter** | "Customer wants Thailand 5N, 2 adults, ₹1.5L" → AI drafts a package |
| **Smart Query** | "Show all customers travelling to Singapore next month with unpaid balance" |
| **Lead Intelligence** | "Which leads haven't been followed up for 3 days?" |
| **Auto Quotation** | "Create a quotation for this customer" from natural language |
| **WhatsApp AI Chat** | Handles customer WhatsApp queries with RAG from agency's own packages DB |
| **Conversation Routing** | Detects when human takeover is needed, alerts salesperson |

### How It Works (RAG Architecture)

```
Customer / Staff sends query
      ↓
Backend fetches relevant context from DB:
  - Agency's packages + pricing
  - Destination visa requirements
  - Customer's booking history
  - FAQs
      ↓
Sends context + query to GPT-4o-mini (platform's API key)
      ↓
AI responds with agency-specific, accurate answer
      ↓
Response sent to WhatsApp / CRM chat
```

### AI Usage Controls
- Monthly limit tracked per tenant (resets 1st of month)
- When limit hit: AI disabled, agency notified to upgrade
- Super Admin can adjust limits per agency from dashboard
- Model: GPT-4o-mini (platform default, swappable)

---

## 🏗️ Tech Architecture

### Project Structure

```
fellow_crm/
│
├── apps/
│   ├── web/                    # Next.js frontend (agency + super admin)
│   ├── api/                    # NestJS backend
│   ├── desktop/                # Tauri desktop app (placeholder)
│   ├── desktop-mac/            # Tauri Mac desktop app (placeholder)
│   └── mobile/                 # Capacitor mobile app (placeholder)
│
├── packages/
│   └── shared/                 # Shared types, constants, validators
│
├── modules/
│   ├── platform/               # ⭐ Multi-tenancy core
│   │   ├── tenants/            # Agency CRUD, tenant provisioning
│   │   ├── plans/              # Subscription plans management
│   │   ├── features/           # Feature toggle system
│   │   ├── billing/            # Manual billing & invoice tracking
│   │   └── platform-leads/    # Inbound leads from contact form
│   │
│   ├── crm/                    # Lead & customer management (Module 1)
│   │   ├── leads/              # Lead capture, status, assignment
│   │   ├── customers/          # Customer profiles & history
│   │   └── followups/          # Follow-up scheduling & reminders
│   ├── quotations/             # Quotation generation (Module 3)
│   ├── packages/               # Package builder
│   ├── bookings/               # Booking lifecycle
│   ├── travellers/             # Traveller profiles
│   ├── documents/              # Document management
│   ├── visa/                   # Visa processing
│   ├── suppliers/              # Supplier CRM
│   ├── itinerary/              # Itinerary builder
│   ├── payments/               # Payment tracking
│   ├── expenses/               # Expense management
│   ├── notifications/          # Alerts & reminders
│   └── reports/                # Analytics & reporting
│
├── integrations/
│   ├── whatsapp/               # WhatsApp Business API
│   ├── email/                  # Email notifications
│   ├── payment/                # Payment gateway
│   └── pdf/                    # PDF generation
│
└── shared/
    ├── database/               # DB models & migrations (all tables have tenant_id)
    ├── auth/                   # Authentication & sessions
    ├── permissions/            # Role-based access control
    ├── tenant-context/         # Middleware to scope all queries by tenant
    └── ui/                     # Shared UI components
```

### Architecture Principles
- **Multi-tenant from day one** — Every table has `tenant_id`, all queries scoped by tenant
- **Modular monolith** — One backend + one database (shared DB, shared schema)
- **Feature flags per tenant** — Super Admin toggles modules on/off per agency
- **Sales-driven onboarding** — No self-serve signup, manual provisioning only
- **API-first** — Frontend consumes REST/GraphQL APIs
- **Role hierarchy** — Super Admin → Agency Owner → Manager → Staff

---

## 🚀 Build Scope — Full System

> **Goal:** Build the complete Travel CRM + Operations Management system with all modules from day one.

| Module # | Name | Key Capability | Detailed In |
|---|---|---|---|
| 1 | Lead & CRM | Lead capture, WhatsApp chatbot, auto-assignment, follow-ups | Module 1 |
| 2 | Package Builder | Reusable packages, cost/markup/profit per line item | Module 2 |
| 3 | Quotation System | PDF quotation generation, send via WhatsApp | Module 3 |
| 4 | Booking Management | Quotation → Booking conversion, lifecycle tracking | Module 4 |
| 5 | Traveller & Documents | Per-traveller document tracking, status, reminders | Module 5 |
| 6 | Visa Management | Per-traveller visa workflow, destination checklists | Module 6 |
| 7 | Supplier Management | Supplier CRM, rates, payables, booking history | Module 7 |
| 8 | Itinerary Builder | Day-by-day itinerary, PDF + web + WhatsApp formats | Module 8 |
| 9 | Payment & Finance | Payments, installments, supplier payables, expense tracking, P&L | Module 9 |
| 10 | WhatsApp Integration | Lead chatbot, drip sequences, pipeline automation, per-agency numbers | Module 10 |
| 11 | Dashboard | Full business health — sales, bookings, finance, operations, performance | Module 11 |
| 12 | Customer Portal | Self-service booking status, document upload, itinerary, OTP login | Module 12 |
| 13 | AI Sales Assistant | Package drafter, smart queries, WhatsApp AI chat, RAG from agency DB | Module 13 |

### Also Included (Platform Layer)
| Component | Description |
|---|---|
| Super Admin Panel | Tenant management, plan assignment, feature toggles, AI usage monitoring |
| Multi-tenancy | `tenant_id` on every table, full data isolation |
| Auth & Roles | Super Admin → Agency Owner → Manager → Sales / Operations / Accounts |
| PDF Engine | Quotations, invoices, itineraries |
| Email Notifications | Booking confirmations, reminders, staff alerts |
| Reports & Analytics | Salesperson, destination, revenue, profit reports |

---

## 🎯 The Bigger Opportunity

> **Don't think of it as:** "CRM for my friend's travel company."
>
> **Think:** "Operating system for small and medium travel agencies."

### Strategy
1. Start with **one pilot agency** as the first customer
2. Build around their **real daily workflow**
3. Watch what employees do every day
4. Onboard more agencies through **direct sales** (contact form → demo → close → provision)
5. Scale to other Kerala / Indian travel agencies
6. Super Admin dashboard gives you **full visibility** across all tenants

### Revenue Model
- **Sales-based subscriptions** — no automated payments
- You control pricing, plans, and feature access per agency
- Manual invoicing and payment tracking in Super Admin
- Upgrade/downgrade by toggling features — no code changes needed

---

## 📝 Key Design Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Architecture | Modular Monolith | Simpler to build, deploy, and maintain initially |
| Multi-tenancy | Shared DB, `tenant_id` on every table | Simple, scalable for this stage |
| Database | PostgreSQL 16 + Prisma | Relational data, complex queries, reliability |
| Frontend | Next.js 14+ (App Router) | SSR, great DX, React ecosystem |
| Backend | NestJS | Modular, decorators, guards, built-in BullMQ support |
| Auth | JWT (access + refresh) | Standard, stateless, works across web/mobile/desktop |
| PDF Engine | Puppeteer / React-PDF | Beautiful, customizable output |
| WhatsApp | Meta Cloud API / BSP (WATI/Interakt) | Agency brings own number, platform routes via webhook |
| AI Model | GPT-4o-mini (OpenAI) | Cheap (~₹0.10/chat), smart enough, easy to swap later |
| AI Billing | Platform pays, included in plan | Zero friction for agencies, cost is negligible |
| Job Queue | BullMQ (Redis) | Scheduled follow-ups, drip sequences, reminders |
| Hosting | VPS / Cloud | Vercel (frontend) + Railway/Render (backend) |

---

*Last Updated: September 3, 2026*
