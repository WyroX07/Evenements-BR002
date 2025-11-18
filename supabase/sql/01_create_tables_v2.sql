-- Système Multi-Événements pour Ventes Scouts - VERSION 2
-- À exécuter dans Supabase SQL Editor
-- ⚠️ REMPLACE la version 1 : supprimer d'abord les anciennes tables si elles existent

-- Extension pour UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- SECTIONS SCOUTES
-- ========================================
CREATE TABLE sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL DEFAULT '#f7a910', -- Couleur hex pour l'UI
  sort_order INTEGER DEFAULT 0 NOT NULL,

  -- Compte bancaire de la section
  iban TEXT, -- IBAN propre à la section
  iban_name TEXT, -- Nom du titulaire du compte

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE sections IS 'Sections scoutes (Baladins, Louveteaux, Éclaireurs, Pionniers, Unité)';
COMMENT ON COLUMN sections.iban IS 'IBAN propre à la section pour les virements';
COMMENT ON COLUMN sections.iban_name IS 'Nom du titulaire du compte (ex: "Louveteaux Ecaussinnes")';

-- ========================================
-- ÉVÉNEMENTS (cœur du système)
-- ========================================
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE, -- URL friendly: "cremant-pionniers-2024"
  section_id UUID NOT NULL REFERENCES sections(id) ON DELETE RESTRICT,

  -- Type d'événement
  event_type TEXT NOT NULL CHECK (event_type IN ('PRODUCT_SALE', 'MEAL', 'RAFFLE')),

  -- Statut
  status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'ACTIVE', 'CLOSED')),

  -- Informations de base
  name TEXT NOT NULL,
  description TEXT,

  -- Dates de vente
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,

  -- Configuration du Hero (landing page)
  hero_config JSONB DEFAULT '{
    "title": "",
    "subtitle": "",
    "description": "",
    "banner_url": null,
    "show_deadline": true,
    "show_stats": true,
    "features": [],
    "cta_text": "Commander maintenant"
  }'::jsonb NOT NULL,

  -- Configuration spécifique par type
  config JSONB DEFAULT '{
    "delivery_enabled": false,
    "delivery_min_bottles": 5,
    "delivery_fee_cents": 0,
    "allowed_zip_codes": [],
    "discount_10for9": false,
    "pickup_address": "",
    "contact_email": "",
    "payment_methods_enabled": ["BANK_TRANSFER", "ON_SITE"],
    "payment_iban_override": null,
    "payment_iban_name_override": null,
    "order_code_prefix": "PEC"
  }'::jsonb NOT NULL,

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Contraintes
  CONSTRAINT valid_dates CHECK (end_date >= start_date)
);

COMMENT ON TABLE events IS 'Événements de vente (produits, soupers, tombolas)';
COMMENT ON COLUMN events.hero_config IS 'Configuration de la landing page (hero section)';
COMMENT ON COLUMN events.config IS 'Configuration spécifique selon le type d''événement';
COMMENT ON COLUMN events.config IS 'payment_iban_override: si null, utilise l''IBAN de la section';

-- ========================================
-- PRODUITS (liés à un événement)
-- ========================================
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  description TEXT,
  price_cents INTEGER NOT NULL CHECK (price_cents >= 0),

  -- Type de produit
  product_type TEXT NOT NULL DEFAULT 'ITEM' CHECK (product_type IN ('ITEM', 'MENU', 'TICKET')),

  -- Stock (NULL = illimité)
  stock INTEGER CHECK (stock IS NULL OR stock >= 0),

  -- Visibilité
  is_active BOOLEAN DEFAULT true NOT NULL,
  sort_order INTEGER DEFAULT 0 NOT NULL,

  -- Image optionnelle
  image_url TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE products IS 'Produits/Menus/Tickets liés à un événement';

-- ========================================
-- CRÉNEAUX (retrait pour ventes, date pour soupers)
-- ========================================
CREATE TABLE slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,

  date DATE NOT NULL,
  start_time TEXT NOT NULL, -- Format "HH:mm"
  end_time TEXT NOT NULL,   -- Format "HH:mm"
  capacity INTEGER NOT NULL CHECK (capacity > 0),

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE slots IS 'Créneaux horaires pour retraits ou dates de soupers';

-- ========================================
-- COMMANDES (universelles)
-- ========================================
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE RESTRICT,
  code TEXT UNIQUE NOT NULL, -- "CRE-2024-00001"

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Statut de la commande
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (
    status IN ('PENDING', 'PAID', 'PREPARED', 'DELIVERED', 'CANCELLED')
  ),

  -- Informations client
  customer_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,

  -- Type de livraison/récupération
  delivery_type TEXT NOT NULL CHECK (delivery_type IN ('PICKUP', 'DELIVERY', 'ON_SITE')),

  -- Créneau (si retrait ou souper)
  slot_id UUID REFERENCES slots(id) ON DELETE SET NULL,

  -- Adresse (si livraison)
  address TEXT,
  city TEXT,
  zip TEXT,

  -- Montants en centimes
  subtotal_cents INTEGER NOT NULL CHECK (subtotal_cents >= 0),
  discount_cents INTEGER DEFAULT 0 NOT NULL CHECK (discount_cents >= 0),
  delivery_fee_cents INTEGER DEFAULT 0 NOT NULL CHECK (delivery_fee_cents >= 0),
  total_cents INTEGER NOT NULL CHECK (total_cents >= 0),

  -- Méthode de paiement
  payment_method TEXT NOT NULL CHECK (
    payment_method IN ('BANK_TRANSFER', 'ON_SITE')
  ),

  -- Communication virement (générée automatiquement)
  payment_communication TEXT, -- Ex: "Dupont Jean - Crémant Pionniers 2024"

  -- Notes et références
  notes TEXT, -- Notes client (allergies, demandes spéciales)
  bank_reference TEXT, -- Référence virement reçu (pour traçabilité)
  admin_internal_note TEXT, -- Notes internes admin

  -- Consentement RGPD
  rgpd_consent BOOLEAN DEFAULT false NOT NULL,

  -- Contraintes
  CONSTRAINT delivery_requires_address CHECK (
    delivery_type != 'DELIVERY' OR (
      address IS NOT NULL AND
      city IS NOT NULL AND
      zip IS NOT NULL
    )
  ),
  CONSTRAINT pickup_or_onsite_requires_slot CHECK (
    delivery_type = 'DELIVERY' OR slot_id IS NOT NULL
  )
);

COMMENT ON TABLE orders IS 'Commandes/Réservations universelles pour tous types d''événements';
COMMENT ON COLUMN orders.payment_communication IS 'Communication virement générée : "NOM Prénom - Nom événement"';

-- ========================================
-- LIGNES DE COMMANDE
-- ========================================
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE RESTRICT,

  qty INTEGER NOT NULL CHECK (qty > 0),
  unit_price_cents INTEGER NOT NULL CHECK (unit_price_cents >= 0),
  line_total_cents INTEGER NOT NULL CHECK (line_total_cents >= 0),

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE order_items IS 'Lignes de commande (détail des produits commandés)';

-- ========================================
-- PARAMÈTRES GLOBAUX
-- ========================================
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE settings IS 'Paramètres globaux de l''application (admin, emails, etc.)';

-- ========================================
-- AUDIT LOGS
-- ========================================
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  meta JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE audit_logs IS 'Journal d''audit pour traçabilité des actions admin';
