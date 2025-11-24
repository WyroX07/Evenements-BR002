# Vibe Coding Context: Unite Scoute d'Ecaussinnes - Plateforme Multi-Evenements

**Version**: 2.0 (Next.js 15 Multi-Events Architecture)
**Last Updated**: November 2025
**Status**: Production-ready with pending wine details migration

---

## Project Overview

### What Is This?
A comprehensive **Next.js 15 event management platform** designed for the Scout units of Ecaussinnes (Belgium) to manage and sell products, organize meals, and run raffles. Think of it as "Shopify meets Eventbrite" but tailored specifically for scout fundraising activities.

### Target Users
- **Public**: Parents, community members ordering wines/cremants or booking meals
- **Admins**: Scout leaders managing events, products, orders, and logistics

### Core Value Proposition
One centralized platform for **all scout sections** (Baladins, Louveteaux, Eclaireurs, Pionniers, Unite) to:
- Create and manage events (product sales, meals, raffles)
- Accept orders with multiple delivery methods (pickup, delivery, on-site)
- Track payments via bank transfer or on-site payment (zero payment processor fees)
- Send automated confirmation emails with QR codes
- Export orders to Excel for logistics
- Manage promo codes and discounts

### Main Features
1. **Multi-Section Multi-Event System**: Each section can run multiple events simultaneously
2. **Dynamic Landing Pages**: Each event gets a customizable landing page with hero section
3. **Flexible Product Catalog**: Wines with detailed specs, meal menus, raffle tickets
4. **Smart Order Flow**: Multi-step checkout with progressive summary
5. **Admin Dashboard**: Full CRUD for events, products, slots, orders, promo codes
6. **Email Automation**: Resend-powered transactional emails with calendar invites
7. **Export Tools**: Excel exports, CSV imports for bulk product creation

---

## Technical Stack

### Frontend
- **Next.js 15** with App Router (React Server Components + Client Components)
- **React 19** (latest stable with async transitions)
- **TypeScript 5.3** (strict mode enabled)
- **Tailwind CSS 3.4** (utility-first styling)
- **React Hook Form** + **Zod** (forms and validation)
- **Lucide React** (icon library)
- **date-fns** + **date-fns-tz** (date handling in Europe/Brussels timezone)

### Backend & Database
- **Supabase** (PostgreSQL with Row Level Security)
- **Next.js API Routes** (serverless functions)
- **Supabase Service Role** for admin operations
- **uuid-ossp** PostgreSQL extension for UUID generation

### External Services
- **Resend** for transactional emails
- **Vercel** for hosting with cron jobs
- **QRCode** library for order QR codes
- **xlsx** library for Excel exports

### Development Tools
- **Vitest** for unit tests
- **Playwright** for E2E tests
- **ESLint** + Next.js config
- **tsx** for running TypeScript scripts

---

## Architecture Deep Dive

### Database Schema

The entire system revolves around a flexible multi-event architecture:

```
sections (Scout units)
   |
   +-- events (Sales, Meals, Raffles)
         |
         +-- products (Items, Menus, Tickets)
         +-- slots (Time slots for pickup/meals)
         +-- orders (Customer orders)
         |     |
         |     +-- order_items (Line items)
         |
         +-- audit_logs (Admin actions)

promo_codes (Discount codes, independent)
```

#### Key Tables

**sections**
- Each scout section (Baladins, Louveteaux, etc.) has its own IBAN account
- Stores section name, slug, color (for UI theming), and sort order

**events**
- `event_type`: PRODUCT_SALE | MEAL | RAFFLE
- `status`: DRAFT | ACTIVE | CLOSED
- `hero_config` (JSONB): Landing page configuration (title, subtitle, banner, features, CTA)
- `config` (JSONB): Event-specific settings (delivery rules, discount settings, allowed zip codes, payment methods, IBANs)

**products**
- `product_type`: ITEM (wine/cremant) | MENU (meal) | TICKET (raffle)
- Standard fields: name, description, price_cents, stock, image_url
- Wine-specific fields (17 columns): `is_wine`, `vintage`, `color`, `aromas`, `balance`, `grape_variety`, `wine_type`, `appellation`, `producer`, `origin`, `residual_sugar_gl`, `limited_stock`, `highlight_badge`, etc.
- Allergen fields: `allergens` (text), `is_vegetarian`, `is_vegan`

**slots**
- Date + start_time + end_time + capacity
- Used for pickup time slots (product sales) or meal dates

**orders**
- `delivery_type`: PICKUP | DELIVERY | ON_SITE
- `payment_method`: BANK_TRANSFER | ON_SITE | PAY_LINK
- `status`: PENDING | PAID | PREPARED | DELIVERED | CANCELLED
- Auto-generated `code` (e.g., "CRE-2024-00001")
- Stores customer info, delivery address, payment communication

**promo_codes**
- `code` (unique): The promo code string
- `discount_type`: PERCENTAGE | FIXED_AMOUNT
- `discount_value`: Percentage (0-100) or amount in cents
- `valid_from`, `valid_until`: Date range
- `max_uses`, `used_count`: Usage limits
- `min_order_cents`: Minimum order requirement
- `event_id` (nullable): Optional event restriction

### App Structure

```
app/
├── page.tsx                          # Homepage: lists all active events grouped by section
├── event/
│   └── [slug]/
│       ├── page.tsx                  # Event landing page (uses templates)
│       └── commander/
│           └── page.tsx              # Multi-step order form
├── commande/
│   └── [code]/
│       └── page.tsx                  # Persistent order confirmation page
├── merci/
│   └── [code]/
│       └── page.tsx                  # Post-order thank you page (redirects to /commande/[code])
├── admin/
│   ├── login/page.tsx                # Simple password auth
│   ├── dashboard/page.tsx            # Admin home (order management)
│   ├── events/page.tsx               # Event list + CRUD
│   └── promo-codes/page.tsx          # Promo code management
├── api/
│   ├── events/
│   │   ├── route.ts                  # GET all active events
│   │   └── [slug]/route.ts           # GET event details
│   ├── sections/route.ts             # GET all sections
│   ├── orders/route.ts               # POST create order (with promo code validation)
│   ├── promo-codes/
│   │   └── validate/route.ts         # POST validate promo code
│   ├── admin/
│   │   ├── events/
│   │   │   ├── route.ts              # GET/POST events
│   │   │   └── [id]/
│   │   │       ├── route.ts          # GET/PATCH/DELETE event
│   │   │       ├── products/
│   │   │       │   ├── route.ts      # GET/POST/PATCH/DELETE products
│   │   │       │   └── import/route.ts # POST CSV import
│   │   │       └── slots/route.ts    # GET/POST/PATCH/DELETE slots
│   │   ├── orders/
│   │   │   ├── route.ts              # GET/PATCH/DELETE orders
│   │   │   └── export/route.ts       # GET Excel export
│   │   └── promo-codes/route.ts      # CRUD promo codes
│   └── cron/
│       └── reminders/route.ts        # Vercel cron for J-1 reminders
└── globals.css
```

### Routing Strategy
- **App Router**: All pages use the new Next.js 15 App Router
- **Server Components by default**: Data fetching on server
- **Client Components**: Used for interactivity (forms, accordions, toasts)
- **API Routes**: RESTful endpoints for all operations
- **Dynamic Routes**: `[slug]` for events, `[code]` for orders, `[id]` for admin resources

### Data Flow

**Public Order Flow:**
1. User visits homepage → fetches active events from `/api/events`
2. User clicks event → `/event/[slug]` fetches event with products + slots
3. User clicks "Commander" → `/event/[slug]/commander` multi-step form
4. Form submission → `POST /api/orders` with validation, stock check, promo code validation
5. Order created → email sent via Resend → redirect to `/commande/[code]`

**Admin Flow:**
1. Login → simple password check → cookie-based session (7 days)
2. Dashboard → fetches orders with filters (status, search, date range)
3. Event management → CRUD operations on events/products/slots
4. Order management → status updates, cancellations
5. Promo code management → CRUD operations, view usage stats
6. Export → generates Excel with all order details

---

## Key Features Implemented

### 1. Multi-Step Order Form
**File**: `app/event/[slug]/commander/page.tsx`

6-step wizard with React Hook Form + Zod validation:
1. **Cart** (Panier): Select products and quantities
2. **Delivery** (Livraison): Choose PICKUP or DELIVERY
3. **Slot** (Creneau): Select pickup time slot (accordion by date)
4. **Info** (Coordonnees): Customer name, email, phone, notes
5. **Payment** (Paiement): Choose BANK_TRANSFER or ON_SITE
6. **Confirmation**: Review and accept GDPR, submit

**Special Features**:
- Progressive order summary (sticky sidebar, invoice-style)
- Accordion slots grouped by date with visual indicators
- Real-time validation with error messages
- 10-for-9 discount calculation (buy 10, get 1 free)
- Minimum bottle requirement for delivery

### 2. Dynamic Landing Pages
Each event has a customizable landing page with:
- Hero section (title, subtitle, banner image, features, CTA)
- Product catalog with wine details
- Value propositions
- Slot display
- FAQ section
- Social links

**Template System**: Custom templates can override default layout (see `app/event/templates/`)

### 3. Wine Details System
17 specialized fields for wines/cremants:
- Vintage, color, aromas, balance, food pairings
- Grape variety, wine type, appellation
- Producer, origin, residual sugar
- Limited stock flag, highlight badge
- Special mentions (bio, non-filtered, etc.)

**Status**: SQL migration created but **NOT YET EXECUTED** on production Supabase (see Known Issues)

### 4. Promo Code System
Full-featured discount codes:
- Percentage or fixed amount discounts
- Date range validity
- Usage limits (max uses per code)
- Minimum order requirements
- Optional event restriction
- Real-time validation at checkout
- Admin dashboard with usage stats

### 5. Email Automation
**Powered by Resend** (configured in `.env.local`)

Templates:
- **Order Confirmation**: Sent immediately with QR code, order summary, payment instructions, and calendar invite (ICS) for pickups
- **Admin Notification**: Alerts admin of new orders
- **J-1 Reminder**: Cron job sends reminder 1 day before pickup

HTML emails are fully responsive with inline styles.

### 6. Admin Dashboard
**Authentication**: Simple password-based (cookie session)

Features:
- Order list with filters (status, search by name/email/code, date range)
- Status management (PENDING → PAID → PREPARED → DELIVERED)
- Order details modal
- Excel export (all orders or filtered subset)
- Event CRUD (create, edit, activate, close, delete)
- Product CRUD with CSV import
- Slot management with bulk delete
- Promo code CRUD
- Audit logs for all admin actions

### 7. CSV Import & Excel Export
**Import**: Upload CSV (semicolon-separated for French Excel) to bulk-create products
- Template provided with all required columns
- Zod validation before import
- Preview before confirmation

**Export**: Download Excel with all order details
- Customer info, products, quantities, prices
- Delivery method, address, slot
- Payment method, status
- Promo code applied

---

## Pending Features (TODO)

### Critical
1. **Execute Wine Details Migration** (blocks event display)
   - File: `supabase/migrations/20250114_add_wine_details.sql`
   - Action: Run in Supabase SQL Editor manually

2. **Configure Resend API**
   - Get API key from Resend.com
   - Verify custom domain for `SENDER_EMAIL`
   - Test email sending

### High Priority
3. **Event Templates** (Sale vs Meal presets)
4. **Event Duplication** (copy event + products + slots)
5. **Remove Promo Code from Order** (admin action)

### Medium Priority
6. **Reusable UI Components** (Badge, ProductCard, WineDetails, AllergenTag)
7. **Order Editing** (admin quick edit for address, slot, quantities)
8. **Dashboard Stats** (revenue, top products, conversion rates)

### Low Priority
9. **Status Dropdown** (change order status inline)
10. **Printable Slot Lists** (for pickup organization)
11. **Dark Mode**
12. **Multi-language** (FR/NL)

---

## Code Patterns & Conventions

### Component Patterns

**Server Components** (default):
```tsx
// app/page.tsx
async function getActiveEvents() {
  const supabase = createServerClient()
  // Fetch data server-side
}

export default async function HomePage() {
  const events = await getActiveEvents()
  return <div>...</div>
}
```

**Client Components** (when needed):
```tsx
// components/ui/Button.tsx
'use client'
import { ButtonHTMLAttributes } from 'react'

export default function Button({ children, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button {...props}>{children}</button>
}
```

### Form Validation Pattern
```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createOrderSchema } from '@/lib/validators'

const { register, handleSubmit, formState: { errors }, watch } = useForm({
  resolver: zodResolver(createOrderSchema)
})

const onSubmit = async (data) => {
  // Data is already validated by Zod
  const res = await fetch('/api/orders', {
    method: 'POST',
    body: JSON.stringify(data)
  })
}
```

### API Route Pattern
```tsx
// app/api/orders/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { createOrderSchema } from '@/lib/validators'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createOrderSchema.parse(body)

    const supabase = createServerClient()
    // Perform operations with service role key

    return NextResponse.json({ success: true, data: order })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
```

### Admin Auth Pattern
```tsx
import { checkAdminAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const isAuthenticated = await checkAdminAuth()
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  // Proceed with admin operation
}
```

### Money Handling
**Always use centimes (integers) for prices**:
```tsx
// Storage
const priceCents = 950 // 9.50 EUR

// Display
const formatPrice = (cents: number) => `${(cents / 100).toFixed(2)} €`

// Calculation
const totalCents = items.reduce((sum, item) => sum + item.qty * item.unitPriceCents, 0)
```

### Date Formatting
**Always use `date-fns` with Europe/Brussels timezone**:
```tsx
import { format } from 'date-fns'
import { zonedTimeToUtc, utcToZonedTime } from 'date-fns-tz'
import { fr } from 'date-fns/locale'

const date = utcToZonedTime(new Date(slot.date), 'Europe/Brussels')
const formatted = format(date, 'EEEE d MMMM yyyy', { locale: fr })
// "lundi 15 janvier 2024"
```

### Discount Calculation (10-for-9)
```tsx
export function calculate10for9Discount(items: CartItem[]): number {
  const totalBottles = items.reduce((sum, item) => sum + item.qty, 0)
  const groups = Math.floor(totalBottles / 10)
  if (groups === 0) return 0

  const minUnitPrice = Math.min(...items.map(item => item.unitPriceCents))
  return groups * minUnitPrice
}
```

### Progressive Disclosure Pattern
Used in order summary to show info step-by-step:
```tsx
{currentStepIndex >= 1 && deliveryType && (
  <div>Show delivery info</div>
)}

{currentStepIndex >= 2 && watchedSlotId && (
  <div>Show selected slot</div>
)}
```

---

## Database Schema Details

### Important Relationships

**Section → Events** (1:N)
- Each section owns multiple events
- Section's IBAN is used for payment unless overridden in event config

**Event → Products** (1:N)
- Products belong to one event
- Cascade delete: deleting event removes all products

**Event → Slots** (1:N)
- Slots belong to one event
- Cascade delete: deleting event removes all slots

**Event → Orders** (1:N)
- Orders belong to one event
- Restrict delete: cannot delete event with orders

**Order → Order Items** (1:N)
- Each order has multiple line items
- Cascade delete: deleting order removes items

**Promo Code → Orders** (1:N via order.promo_code_id)
- Promo code can be used by multiple orders
- Tracks usage count for limits

### JSONB Configuration Examples

**Event hero_config**:
```json
{
  "title": "Vente de Cremant 2025",
  "subtitle": "Maison Lissner - Alsace",
  "description": "Soutenez les Pionniers en commandant nos cremants d'exception",
  "banner_url": "https://example.com/banner.jpg",
  "show_deadline": true,
  "show_stats": true,
  "features": [
    "Remise 10 pour 9",
    "Livraison gratuite",
    "Producteur alsacien"
  ],
  "cta_text": "Commander maintenant"
}
```

**Event config**:
```json
{
  "delivery_enabled": true,
  "delivery_min_bottles": 5,
  "delivery_fee_cents": 0,
  "allowed_zip_codes": ["1400", "1348", "7190"],
  "discount_10for9": true,
  "pickup_address": "Rue des fontenelles 26, 7190 Ecaussinnes",
  "contact_email": "contact@pionniers-ecaussinnes.be",
  "payment_methods_enabled": ["BANK_TRANSFER", "ON_SITE"],
  "payment_iban_override": null,
  "payment_iban_name_override": null,
  "order_code_prefix": "CRE"
}
```

### Row Level Security (RLS)

**Public Read** (via anon key):
- Active events, products, slots, sections
- Specific order by code

**Admin Write** (via service role key):
- All mutations (INSERT, UPDATE, DELETE)
- Protected by admin authentication middleware

**Security Model**:
- Client-side: Uses `SUPABASE_ANON_KEY` (read-only on public data)
- Server-side: Uses `SUPABASE_SERVICE_ROLE_KEY` (full access)
- Admin routes: Protected by cookie-based auth (`checkAdminAuth()`)

---

## Deployment Setup

### Vercel Configuration

**Environment Variables** (set in Vercel dashboard):
```env
# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Resend
RESEND_API_KEY=re_xxx
SENDER_EMAIL=noreply@pionniers-ecaussinnes.be
SENDER_NAME=Les Pionniers d'Ecaussinnes

# Admin
ADMIN_PASSWORD=@Banane123

# Site
NEXT_PUBLIC_SITE_URL=https://cremant.pionniers-ecaussinnes.be
NEXT_PUBLIC_PICKUP_ADDRESS=Rue des fontenelles 26, 7190 Ecaussinnes
CONTACT_EMAIL=contact@pionniers-ecaussinnes.be
```

**Cron Jobs** (`vercel.json`):
```json
{
  "crons": [
    {
      "path": "/api/cron/reminders",
      "schedule": "0 8 * * *"
    }
  ]
}
```
Runs daily at 8:00 AM Europe/Brussels to send pickup reminders.

**Build Settings**:
- Framework: Next.js
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install --legacy-peer-deps` (required for React 19)

### DNS Configuration
Point custom domain to Vercel:
- Type: A record
- Name: `cremant` (or `@` for apex)
- Value: Vercel's IP (provided in dashboard)

Or use CNAME:
- Type: CNAME
- Name: `cremant`
- Value: `cname.vercel-dns.com`

---

## Recent Changes (Migration to Next.js 15)

### Breaking Changes Addressed

**1. Async Params Pattern**
Next.js 15 requires route params to be awaited:

**Old** (Next.js 14):
```tsx
export default function Page({ params }: { params: { slug: string } }) {
  const { slug } = params
}
```

**New** (Next.js 15):
```tsx
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
}
```

**2. Async `cookies()` and `headers()`**
These APIs now return promises:

**Old**:
```tsx
import { cookies } from 'next/headers'

const cookieStore = cookies()
const sessionCookie = cookieStore.get('admin_session')
```

**New**:
```tsx
import { cookies } from 'next/headers'

const cookieStore = await cookies()
const sessionCookie = cookieStore.get('admin_session')
```

**3. React 19 Upgrade**
- Updated `react` and `react-dom` to 19.0.0
- Changed `@types/react` to `^18.2.55` (compatible with React 19)
- Installed with `--legacy-peer-deps` flag

### Files Updated
- All API routes with `params` usage
- `lib/auth.ts` (async cookies)
- All page components with dynamic routes
- `package.json` (React 19 dependencies)

---

## Known Issues

### 1. Wine Details SQL Migration Not Executed
**Symptom**: Event pages return 404 with error `"column products_1.is_wine does not exist"`

**Cause**: Migration `supabase/migrations/20250114_add_wine_details.sql` was created but never executed on Supabase.

**Solution**:
1. Go to Supabase SQL Editor: https://supabase.com/dashboard/project/dcctmozipqrdezqsdzxf/sql
2. Copy-paste the SQL from `supabase/migrations/20250114_add_wine_details.sql`
3. Execute
4. Verify by checking `products` table schema

**Why It Happened**: Supabase doesn't auto-run migrations from file system. They must be manually executed or integrated with a migration tool like `supabase-cli` (not currently configured).

### 2. Resend API Not Configured
**Status**: Code is ready but API keys are missing

**Required**:
- `RESEND_API_KEY` from Resend.com
- `SENDER_EMAIL` with verified domain
- Test by creating an order and checking email receipt

---

## Testing Strategy

### Unit Tests (Vitest)
**Location**: `tests/unit/`

Covers:
- Calculation functions (`calculate10for9Discount`, `calculateOrderTotals`)
- Utility functions (`generateOrderCode`, `formatPrice`)
- Validation schemas (Zod schemas)

**Run**: `npm test`

### E2E Tests (Playwright)
**Location**: `tests/e2e/`

Covers:
- Complete order flow (homepage → event → checkout → confirmation)
- Admin login and order management
- Status changes and cancellations

**Run**: `npm run test:e2e`

### Manual Testing Checklist
- [ ] Create event (DRAFT → ACTIVE)
- [ ] Add products via CSV import
- [ ] Create slots for pickup
- [ ] Place order with promo code
- [ ] Verify email receipt
- [ ] Check order in admin dashboard
- [ ] Export orders to Excel
- [ ] Change order status
- [ ] Cancel order

---

## Common Tasks & How-Tos

### How to Create a New Event

**Via Admin UI** (coming soon):
1. Login to `/admin/login`
2. Go to Events → Create New
3. Fill form with basic info
4. Save as DRAFT
5. Add products (manual or CSV import)
6. Create time slots
7. Activate event

**Via Database** (current method):
1. Insert into `events` table with all required fields
2. Insert products into `products` table
3. Insert slots into `slots` table
4. Set event status to ACTIVE

### How to Add Wine Details to a Product

**Prerequisites**: Wine details migration must be executed (see Known Issues)

**Via Admin**:
1. Edit product
2. Check "This is a wine/cremant"
3. Fill wine-specific fields (vintage, color, aromas, etc.)
4. Save

**Via Database**:
```sql
UPDATE products
SET
  is_wine = true,
  vintage = '2018',
  color = 'jaune clair',
  aromas = 'floral, fruité',
  balance = 'frais et vif',
  grape_variety = 'Riesling',
  wine_type = 'sec',
  producer = 'Lissner',
  origin = 'Alsace'
WHERE id = 'product-uuid';
```

### How to Create a Promo Code

**Via Admin UI**:
1. Go to `/admin/promo-codes`
2. Click "Create Promo Code"
3. Fill form:
   - Code (e.g., "NOEL2025")
   - Discount type (percentage or fixed)
   - Discount value
   - Valid from/until dates
   - Max uses (optional)
   - Min order amount (optional)
   - Event restriction (optional)
4. Save

**Via API**:
```bash
POST /api/admin/promo-codes
{
  "code": "NOEL2025",
  "discount_type": "PERCENTAGE",
  "discount_value": 10,
  "valid_from": "2025-01-01",
  "valid_until": "2025-12-31",
  "max_uses": 100,
  "min_order_cents": 5000
}
```

### How to Export Orders

**Via Admin UI**:
1. Go to `/admin/dashboard`
2. Apply filters (optional)
3. Click "Export to Excel"
4. File downloads with all filtered orders

**Via API**:
```bash
GET /api/admin/orders/export?event_id=xxx&status=PAID
```

### How to Import Products via CSV

**Via Admin UI**:
1. Go to event edit page
2. Navigate to Products tab
3. Click "Import CSV"
4. Download template (pre-filled Google Sheet)
5. Fill with product data (use semicolon separator)
6. Upload CSV
7. Review preview
8. Confirm import

**CSV Format** (semicolon-separated):
```csv
name;description;price_cents;stock;is_active
Cremant Brut;Delicieux cremant d'Alsace;950;100;true
Riesling 2018;Vin blanc sec;1200;50;true
```

### How to Create a Custom Event Template

**Step 1**: Create template component
```tsx
// app/event/templates/EventTemplate_my_event_slug.tsx
'use client'

export default function EventTemplate_MyEventSlug({ event, products, slots }) {
  return (
    <div>
      {/* Custom hero */}
      {/* Custom sections */}
      {/* Product display */}
    </div>
  )
}
```

**Step 2**: Register in templates index
```tsx
// app/event/templates/index.tsx
import EventTemplate_MyEventSlug from './EventTemplate_my_event_slug'

export const customTemplates = {
  'my-event-slug': EventTemplate_MyEventSlug
}
```

**Step 3**: Create event with slug `my-event-slug`

The system will automatically use your custom template if it exists, otherwise fall back to default.

---

## Vibe & Philosophy

### Design Principles
1. **User-First**: Optimized for parents ordering on mobile devices
2. **Admin-Friendly**: Minimal clicks to manage orders and events
3. **Zero Fees**: Bank transfer + on-site payment to avoid processor fees
4. **Flexible**: One system for all event types (sales, meals, raffles)
5. **Transparent**: Full audit logs, clear pricing, no hidden costs

### Code Quality
- **Type Safety**: TypeScript everywhere, strict mode enabled
- **Validation**: Zod schemas for all user input
- **Error Handling**: Try-catch blocks, meaningful error messages
- **Server-First**: Fetch data server-side when possible
- **Responsive**: Mobile-first design with Tailwind

### Scout Spirit
This project embodies scout values:
- **Community**: Helps all scout sections fundraise
- **Simplicity**: Easy for volunteers to manage
- **Autonomy**: Each section controls their own events
- **Transparency**: Clear pricing, open communication

---

## Useful Commands

```bash
# Development
npm run dev                    # Start dev server (localhost:3000)
npm run build                  # Build for production
npm run start                  # Start production server
npm run lint                   # Run ESLint
npm run type-check             # TypeScript check

# Testing
npm test                       # Unit tests (Vitest)
npm run test:e2e               # E2E tests (Playwright)

# Database (if using Supabase CLI)
npx supabase db reset          # Reset local DB
npx supabase db push           # Push schema changes
npx supabase gen types typescript --local > lib/supabase/database.types.ts
```

---

## Quick Reference: File Locations

| Need | File Path |
|------|-----------|
| Homepage | `app/page.tsx` |
| Event landing page | `app/event/[slug]/page.tsx` |
| Order form | `app/event/[slug]/commander/page.tsx` |
| Order confirmation | `app/commande/[code]/page.tsx` |
| Admin dashboard | `app/admin/dashboard/page.tsx` |
| Admin login | `app/admin/login/page.tsx` |
| Create order API | `app/api/orders/route.ts` |
| Event details API | `app/api/events/[slug]/route.ts` |
| Admin orders API | `app/api/admin/orders/route.ts` |
| Promo code validation | `app/api/promo-codes/validate/route.ts` |
| Excel export | `app/api/admin/orders/export/route.ts` |
| CSV import | `app/api/admin/events/[id]/products/import/route.ts` |
| Email templates | `lib/emails.ts` |
| Auth helpers | `lib/auth.ts` |
| Calculations | `lib/calculations.ts` |
| Validators | `lib/validators.ts` |
| Supabase client | `lib/supabase/server.ts` |
| Database types | `lib/supabase/database.types.v2.ts` |
| DB schema (V2) | `supabase/sql/01_create_tables_v2.sql` |
| Wine migration | `supabase/migrations/20250114_add_wine_details.sql` |

---

## Environment Variables Reference

```env
# === REQUIRED FOR PRODUCTION ===

# Supabase (from Supabase dashboard → Settings → API)
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...                      # Public anon key (read-only)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...              # Service role key (admin operations)

# Resend (from Resend.com → API Keys)
RESEND_API_KEY=re_xxxxxxxxxxxxx
SENDER_EMAIL=noreply@pionniers-ecaussinnes.be    # Must be verified domain
SENDER_NAME=Les Pionniers d'Ecaussinnes

# Admin Authentication
ADMIN_PASSWORD=@Banane123                         # Change in production!

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://cremant.pionniers-ecaussinnes.be
NEXT_PUBLIC_PICKUP_ADDRESS=Rue des fontenelles 26, 7190 Ecaussinnes
CONTACT_EMAIL=contact@pionniers-ecaussinnes.be

# === OPTIONAL ===

# Delivery Configuration (optional, can be set per event)
DELIVERY_ALLOWED_ZONES=["1400","1348","7190"]
DELIVERY_MIN_BOTTLES=5
DELIVERY_FEE_CENTS=0

# Feature Flags
DISCOUNT_10FOR9=true
```

---

## Getting Started for New AI Assistants

### If You Need to Fix a Bug
1. Read this document fully (you're doing it now!)
2. Check **Known Issues** section first
3. Search for error message in codebase with grep
4. Check relevant API route in `app/api/`
5. Verify database schema in `supabase/sql/`
6. Test fix locally before deploying

### If You Need to Add a Feature
1. Understand the data model (see Database Schema)
2. Check if similar feature exists (refer to Code Patterns)
3. Create API route first (`app/api/`)
4. Add admin UI if needed (`app/admin/`)
5. Update validators in `lib/validators.ts`
6. Write unit tests in `tests/unit/`
7. Update this document with new patterns

### If You're Lost
1. Start with `app/page.tsx` to understand the homepage
2. Follow the user flow: Homepage → Event page → Order form
3. Check API routes to understand backend logic
4. Review `lib/supabase/database.types.v2.ts` for data structures
5. Look at existing components in `components/` for UI patterns

---

## Support & Documentation Links

- **Next.js 15 Docs**: https://nextjs.org/docs
- **React 19 Docs**: https://react.dev
- **Supabase Docs**: https://supabase.com/docs
- **Resend Docs**: https://resend.com/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Zod**: https://zod.dev
- **React Hook Form**: https://react-hook-form.com
- **Vercel Docs**: https://vercel.com/docs

---

## Contributing Guidelines

### Code Style
- Use TypeScript strict mode
- Follow Next.js conventions (Server Components by default)
- Use Tailwind utility classes (avoid custom CSS)
- Name components with PascalCase
- Name files with camelCase for utils, PascalCase for components

### Git Workflow
- Branch naming: `feature/description` or `fix/description`
- Commit messages: Conventional Commits format
- PR description: Include screenshots for UI changes

### Before Committing
- [ ] Run `npm run type-check`
- [ ] Run `npm run lint`
- [ ] Test locally with `npm run dev`
- [ ] Update this document if adding new patterns

---

## Project Metadata

**Project Name**: Unite Scoute d'Ecaussinnes - Plateforme Multi-Evenements
**Codebase**: `cremant-pionniers/`
**Primary Language**: TypeScript
**Framework**: Next.js 15
**Database**: PostgreSQL (via Supabase)
**Hosting**: Vercel
**Domain**: TBD (likely pionniers-ecaussinnes.be subdomain)
**License**: Private (Scout unit property)
**Maintainer**: Thomas (Scout leader)

---

**This document is your single source of truth for understanding and contributing to this project. Keep it updated as the codebase evolves.**

**Last updated**: November 2025
**Version**: 2.0
**Status**: Production-ready (pending wine migration + Resend config)
