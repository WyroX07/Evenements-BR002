# 🏗️ Architecture Technique - Plateforme Multi-Événements

## Vue d'ensemble

Cette application est une **plateforme centralisée** permettant à toutes les sections scoutes d'Ecaussinnes de gérer leurs événements caritatifs (ventes, soupers, tombolas) depuis un seul site web.

## Stack Technique

### Frontend
- **Next.js 15** (App Router)
- **React 19** (Server & Client Components)
- **TypeScript** 5.3
- **Tailwind CSS** 3.4
- **Lucide React** (icônes)

### Backend
- **Next.js API Routes** (serverless)
- **Supabase** (PostgreSQL)
- **Zod** (validation)
- **React Hook Form** (formulaires)

### Services externes
- **Resend** (emails transactionnels)
- **Vercel** (hosting + cron jobs)

---

## Architecture de la Base de Données

### Modèle Relationnel

```
┌─────────────┐
│  SECTIONS   │ Sections scoutes (Baladins, Louveteaux, etc.)
├─────────────┤
│ id          │ UUID PRIMARY KEY
│ name        │ TEXT (Baladins, Louveteaux...)
│ slug        │ TEXT UNIQUE (baladins, louveteaux...)
│ color       │ TEXT (#FF6B35, #F7931E...)
│ iban        │ TEXT (IBAN propre à chaque section)
│ iban_name   │ TEXT (Nom titulaire compte)
│ sort_order  │ INTEGER
└─────────────┘
       │
       │ 1:N
       ▼
┌─────────────┐
│   EVENTS    │ Événements (ventes, soupers, tombolas)
├─────────────┤
│ id          │ UUID PRIMARY KEY
│ section_id  │ UUID FK → sections
│ slug        │ TEXT UNIQUE (cremant-2024, souper-louveteaux...)
│ event_type  │ TEXT (PRODUCT_SALE | MEAL | RAFFLE)
│ status      │ TEXT (DRAFT | ACTIVE | CLOSED)
│ name        │ TEXT
│ description │ TEXT
│ start_date  │ DATE
│ end_date    │ DATE
│ hero_config │ JSONB (config landing page)
│ config      │ JSONB (delivery, remises, IBANs...)
└─────────────┘
       │
       ├─────────────┬─────────────┬─────────────┐
       │ 1:N         │ 1:N         │ 1:N         │ 1:N
       ▼             ▼             ▼             ▼
┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐
│ PRODUCTS  │ │   SLOTS   │ │  ORDERS   │ │AUDIT_LOGS │
├───────────┤ ├───────────┤ ├───────────┤ ├───────────┤
│ event_id  │ │ event_id  │ │ event_id  │ │ event_id  │
│ name      │ │ date      │ │ code      │ │ action    │
│ price_...│ │ start_... │ │ customer_.│ │ meta      │
│ product_..│ │ end_time  │ │ status    │ │ ...       │
│ stock     │ │ capacity  │ │ ...       │ └───────────┘
└───────────┘ └───────────┘ └───────────┘
                                  │
                                  │ 1:N
                                  ▼
                            ┌─────────────┐
                            │ORDER_ITEMS  │
                            ├─────────────┤
                            │ order_id    │
                            │ product_id  │
                            │ qty         │
                            │ ...         │
                            └─────────────┘
```

### Configuration JSONB

#### `events.hero_config`
```json
{
  "title": "Vente de Crémant 2024",
  "subtitle": "Maison Lissner",
  "description": "Soutenez les Pionniers...",
  "banner_url": "https://...",
  "show_deadline": true,
  "show_stats": true,
  "features": [
    "Remise 10 pour 9",
    "Livraison gratuite"
  ],
  "cta_text": "Commander maintenant"
}
```

#### `events.config`
```json
{
  "delivery_enabled": true,
  "delivery_min_bottles": 5,
  "delivery_fee_cents": 0,
  "allowed_zip_codes": ["1400", "7190", "..."],
  "discount_10for9": true,
  "pickup_address": "Rue des fontenelles 26...",
  "contact_email": "...",
  "payment_methods_enabled": ["BANK_TRANSFER", "ON_SITE"],
  "payment_iban_override": null,
  "payment_iban_name_override": null,
  "order_code_prefix": "CRE"
}
```

---

## Architecture Applicative

### Structure du projet

```
cremant-pionniers/
├── app/
│   ├── page.tsx                          # Accueil multi-événements
│   ├── event/[slug]/
│   │   ├── page.tsx                      # Landing page événement
│   │   └── commander/page.tsx            # Formulaire commande (TODO)
│   ├── merci/[code]/page.tsx             # Page confirmation (TODO)
│   ├── admin/
│   │   ├── login/page.tsx                # Login admin (TODO)
│   │   └── dashboard/page.tsx            # Dashboard admin (TODO)
│   └── api/
│       ├── events/                       # APIs publiques événements
│       │   ├── route.ts                  # GET liste événements
│       │   └── [slug]/route.ts           # GET détails événement
│       ├── sections/route.ts             # GET liste sections
│       ├── orders/
│       │   └── route.v2.ts               # POST créer commande V2
│       └── admin/                        # APIs admin (auth required)
│           ├── events/
│           │   ├── route.ts              # CRUD événements
│           │   └── [id]/
│           │       ├── route.ts          # GET/PATCH/DELETE événement
│           │       ├── products/route.ts # CRUD produits
│           │       └── slots/route.ts    # CRUD créneaux
│           └── orders/route.ts           # GET/PATCH/DELETE commandes
│
├── components/
│   ├── ui/                               # Composants UI génériques
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   └── ...
│   ├── payment/
│   │   └── PaymentMethodsBadge.tsx       # Logos paiement
│   └── ...
│
├── lib/
│   ├── supabase/
│   │   ├── server.ts                     # Client Supabase server
│   │   ├── client.ts                     # Client Supabase client
│   │   └── database.types.v2.ts          # Types TypeScript DB
│   ├── validators.ts                     # Schémas Zod
│   ├── calculations.ts                   # Calculs (remises, totaux)
│   └── utils.ts                          # Utilitaires
│
└── supabase/sql/                         # Migrations SQL
    ├── 01_create_tables_v2.sql
    ├── 02_create_indexes_v2.sql
    ├── 03_enable_rls_v2.sql
    ├── 04_triggers_v2.sql
    ├── 05_seed_data_v2.sql
    └── 06_add_iban_and_payment_fields.sql
```

---

## Flux de Données

### Flux Public : Passer une Commande

```
1. Utilisateur → Page d'accueil (/)
   │
   └─→ GET /api/events (fetch events actifs groupés par section)

2. Click sur un événement → /event/[slug]
   │
   └─→ GET /api/events/[slug] (fetch détails + products + slots)

3. Click "Commander" → /event/[slug]/commander
   │
   ├─→ Sélection produits + quantités
   ├─→ Choix créneau (si retrait/souper)
   ├─→ Choix livraison (si activée)
   ├─→ Infos client + paiement
   │
   └─→ POST /api/orders
       │
       ├─→ Validation Zod
       ├─→ Vérifications (stock, capacité, codes postaux...)
       ├─→ Calcul totaux (remises, frais livraison)
       ├─→ Génération code commande (CRE-2024-00001)
       ├─→ Génération communication virement
       ├─→ INSERT orders + order_items
       ├─→ Envoi emails (client + admin)
       │
       └─→ Redirect /merci/[code]
```

### Flux Admin : Gérer un Événement

```
1. Admin → /admin/login
   │
   └─→ POST /api/admin/login (cookie auth)

2. Admin → /admin/dashboard
   │
   ├─→ GET /api/admin/events (liste événements + stats)
   ├─→ GET /api/admin/orders?event_id=... (commandes par événement)
   │
   └─→ Filtres : section, statut, date, recherche

3. Créer événement
   │
   └─→ POST /api/admin/events
       ├─→ Validation Zod
       ├─→ Vérif section exists
       ├─→ INSERT event
       └─→ Audit log

4. Ajouter produits
   │
   └─→ POST /api/admin/events/[id]/products
       ├─→ Validation
       ├─→ INSERT product
       └─→ Audit log

5. Ajouter créneaux
   │
   └─→ POST /api/admin/events/[id]/slots
       ├─→ Validation (start < end, capacité > 0)
       ├─→ INSERT slot
       └─→ Audit log

6. Gérer commandes
   │
   ├─→ PATCH /api/admin/orders?orderId=...
   │   └─→ Changement statut (PENDING → PAID → PREPARED → DELIVERED)
   │
   └─→ DELETE /api/admin/orders?orderId=...
       └─→ Annulation (set status CANCELLED)
```

---

## Authentification & Sécurité

### Admin
- **Authentification simple** : Cookie avec hash du mot de passe
- **Pas de comptes utilisateurs** : Un seul mot de passe admin
- **Protection des routes** : Middleware `checkAdminAuth()` sur toutes les APIs admin

```typescript
async function checkAdminAuth() {
  const cookieStore = await cookies()
  const adminAuth = cookieStore.get('admin_auth')

  if (!adminAuth || adminAuth.value !== process.env.ADMIN_PASSWORD_HASH) {
    return false
  }
  return true
}
```

### Row Level Security (RLS)
- **Lectures publiques** : Tous les clients peuvent lire les données (events, products, slots)
- **Écritures admin only** : Toutes les écritures passent par le Service Role Key
- **Pas d'INSERT direct** : Toutes les commandes passent par l'API

```sql
-- Exemple RLS sur events
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read active events" ON events
  FOR SELECT USING (status = 'ACTIVE');

CREATE POLICY "Admin full access" ON events
  FOR ALL USING (auth.role() = 'service_role');
```

---

## Gestion des Paiements

### Stratégie Zero-Fee

Pour éviter les frais de transaction (2% Stripe, Sumup, etc.), l'application utilise uniquement :

1. **Virement bancaire** (`BANK_TRANSFER`)
   - Chaque section a son IBAN propre
   - Communication structurée auto-générée : "NOM Prénom - Événement Court"
   - Ex: "Dupont Jean - Crémant 24"

2. **Paiement sur place** (`ON_SITE`)
   - Cash, carte bancaire, Apple Pay, Google Pay, NFC
   - Au moment du retrait ou du souper

### Communication de virement

Format optimisé pour lecture humaine:

```typescript
function generatePaymentCommunication(customerName: string, eventName: string): string {
  const nameParts = customerName.trim().split(/\s+/)
  const lastName = nameParts[0] || ''
  const firstName = nameParts[1] || ''

  const shortEventName = eventName
    .replace(/Vente de /gi, '')
    .replace(/Souper /gi, '')
    .replace(/Tombola /gi, '')
    .replace(/\d{4}/g, (year) => year.slice(2)) // 2024 → 24
    .trim()

  return `${lastName} ${firstName} - ${shortEventName}`.trim()
}
```

**Exemples** :
- "Vente de Crémant 2024" → "Dupont Jean - Crémant 24"
- "Souper Louveteaux 2024" → "Martin Sophie - Louveteaux 24"

---

## Calculs & Remises

### Remise "10 pour 9"

```typescript
export function calculateOrderTotals(
  items: Array<{ qty: number; unitPriceCents: number }>,
  discount10for9: boolean,
  deliveryFeeCents: number
) {
  const subtotalCents = items.reduce(
    (sum, item) => sum + item.qty * item.unitPriceCents,
    0
  )

  let discountCents = 0
  if (discount10for9) {
    const totalQty = items.reduce((sum, item) => sum + item.qty, 0)
    const freeBottles = Math.floor(totalQty / 10)

    if (freeBottles > 0 && items.length > 0) {
      const avgPrice = subtotalCents / totalQty
      discountCents = Math.round(freeBottles * avgPrice)
    }
  }

  const totalCents = subtotalCents - discountCents + deliveryFeeCents

  return {
    subtotalCents,
    discountCents,
    deliveryFeeCents,
    totalCents,
  }
}
```

---

## Emails Transactionnels

### Templates (React Email)

1. **Confirmation commande** (`OrderConfirmationEmail.tsx`)
   - QR code avec code commande
   - Récapitulatif détaillé
   - Infos paiement (IBAN + communication)
   - Fichier ICS attaché (si retrait)

2. **Notification admin** (`AdminNotificationEmail.tsx`)
   - Alerte nouvelle commande
   - Lien direct vers dashboard

3. **Rappel J-1** (`ReminderEmail.tsx`)
   - Email automatique la veille du retrait
   - Déclenché par cron Vercel

### Envoi avec Resend

```typescript
await resend.emails.send({
  from: process.env.SENDER_EMAIL || 'pionniers@resend.dev',
  to: order.email,
  subject: `Confirmation - ${event.name}`,
  react: OrderConfirmationEmail({ order, event }),
  attachments: slot ? [icsFile] : [],
})
```

---

## Performance & Optimisation

### Server Components
- Toutes les pages sont des **Server Components** par défaut
- Fetch côté serveur (pas de client-side data fetching)
- Pas de waterfalls : données chargées en parallèle

### Caching
- **ISR (Incremental Static Regeneration)** : Pages événements revalidées toutes les 60s
- **Supabase RLS** : Queries optimisées avec indexes

### Images
- Next.js Image Optimization (lazy loading, WebP, sizes adaptatives)

---

## Déploiement

### Vercel
- **Deployment automatique** : Push sur `main` → build + deploy
- **Preview deployments** : Chaque PR a son URL de preview
- **Edge Functions** : APIs ultra-rapides

### Environnements
- **Development** : `.env.local` (local)
- **Production** : Variables d'environnement Vercel

### Cron Job (Rappels J-1)
```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/reminders",
      "schedule": "0 8 * * *"
    }
  ]
}
```

---

## Monitoring & Observabilité

### Logs
- **Console** : `console.error()` pour erreurs critiques
- **Supabase Logs** : Queries + erreurs SQL
- **Vercel Logs** : Logs d'exécution des APIs

### Audit Trail
- **audit_logs table** : Toutes les actions admin tracées
- Champs : `action`, `event_id`, `order_id`, `meta`

---

## Évolutions Futures

### Phase 1 (En cours)
- ✅ Architecture multi-événements
- ✅ APIs backend complètes
- ✅ Pages publiques (accueil + landing)
- ⏳ Formulaire de commande
- ⏳ Interface admin

### Phase 2
- Authentification admin avancée (comptes multiples)
- Export Excel avec formatage
- Statistiques avancées (CA par section, taux conversion)
- Module de communication (SMS, push notifications)

### Phase 3
- Application mobile (React Native)
- Scanner QR code pour check-in
- Paiement en ligne intégré (Stripe)
- Multi-tenancy (autres unités scoutes)

---

## Références

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Resend Documentation](https://resend.com/docs)
- [Zod Documentation](https://zod.dev)
