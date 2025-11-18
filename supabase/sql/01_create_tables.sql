-- Crémant Pionniers - Migration initiale des tables
-- À exécuter dans Supabase SQL Editor

-- Extension pour UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table des cuvées (produits)
CREATE TABLE cuvees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price_cents INTEGER NOT NULL CHECK (price_cents >= 0),
  is_active BOOLEAN DEFAULT true NOT NULL,
  stock INTEGER CHECK (stock IS NULL OR stock >= 0),
  sort_order INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Table des créneaux de retrait
CREATE TABLE slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  capacity INTEGER NOT NULL CHECK (capacity > 0),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Table des commandes
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
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

  -- Type de livraison
  delivery_type TEXT NOT NULL CHECK (delivery_type IN ('PICKUP', 'DELIVERY')),

  -- Créneau (si retrait)
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
    payment_method IN ('BANK_TRANSFER', 'ON_SITE', 'PAY_LINK')
  ),

  -- Notes et références
  notes TEXT,
  bank_reference TEXT,
  admin_internal_note TEXT,

  -- Contraintes
  CONSTRAINT delivery_requires_address CHECK (
    delivery_type = 'PICKUP' OR (
      address IS NOT NULL AND
      city IS NOT NULL AND
      zip IS NOT NULL
    )
  ),
  CONSTRAINT pickup_requires_slot CHECK (
    delivery_type = 'DELIVERY' OR slot_id IS NOT NULL
  )
);

-- Table des lignes de commande
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  cuvee_id UUID REFERENCES cuvees(id) ON DELETE RESTRICT,
  qty INTEGER NOT NULL CHECK (qty > 0),
  unit_price_cents INTEGER NOT NULL CHECK (unit_price_cents >= 0),
  line_total_cents INTEGER NOT NULL CHECK (line_total_cents >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Table des paramètres (key-value store)
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Table d'audit pour traçabilité
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  meta JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Commentaires
COMMENT ON TABLE cuvees IS 'Catalogue des cuvées de crémant disponibles';
COMMENT ON TABLE slots IS 'Créneaux horaires de retrait disponibles';
COMMENT ON TABLE orders IS 'Commandes clients avec informations de livraison/retrait';
COMMENT ON TABLE order_items IS 'Lignes de commande (détail des produits commandés)';
COMMENT ON TABLE settings IS 'Configuration de l''application (JSON)';
COMMENT ON TABLE audit_logs IS 'Journal des actions admin pour traçabilité';
