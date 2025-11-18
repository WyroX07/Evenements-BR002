-- Migration: Ajout du système de codes promo
-- À exécuter dans Supabase SQL Editor

-- ========================================
-- TABLE PROMO CODES
-- ========================================
CREATE TABLE IF NOT EXISTS promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Code promo (ex: SCOUTS, MERCI2)
  code TEXT NOT NULL UNIQUE,

  -- Réduction en centimes (ex: 200 pour 2€)
  discount_cents INTEGER NOT NULL CHECK (discount_cents > 0),

  -- Activation
  is_active BOOLEAN DEFAULT true NOT NULL,

  -- Description (usage interne)
  description TEXT,

  -- Horodatage
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE promo_codes IS 'Codes promo pour réductions fixes en euros';
COMMENT ON COLUMN promo_codes.code IS 'Code promo unique (ex: SCOUTS, MERCI2)';
COMMENT ON COLUMN promo_codes.discount_cents IS 'Montant de la réduction en centimes (ex: 200 = 2€)';

-- Index pour recherche rapide par code
CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON promo_codes(code);
CREATE INDEX IF NOT EXISTS idx_promo_codes_active ON promo_codes(is_active);

-- ========================================
-- MODIFICATION TABLE ORDERS
-- ========================================
-- Ajouter les colonnes pour tracker le code promo utilisé
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS promo_code_id UUID REFERENCES promo_codes(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS promo_code TEXT, -- Code utilisé (stocké pour historique même si supprimé)
  ADD COLUMN IF NOT EXISTS promo_discount_cents INTEGER DEFAULT 0 NOT NULL CHECK (promo_discount_cents >= 0),
  ADD COLUMN IF NOT EXISTS promo_manually_removed BOOLEAN DEFAULT false NOT NULL; -- Pour annuler le promo sur une commande spécifique

COMMENT ON COLUMN orders.promo_code_id IS 'Référence vers le code promo utilisé';
COMMENT ON COLUMN orders.promo_code IS 'Code promo utilisé (copie pour historique)';
COMMENT ON COLUMN orders.promo_discount_cents IS 'Montant de la réduction promo appliquée en centimes';
COMMENT ON COLUMN orders.promo_manually_removed IS 'Si true, l''admin a manuellement annulé le code promo pour cette commande';

-- ========================================
-- TRIGGER UPDATED_AT
-- ========================================
CREATE OR REPLACE FUNCTION update_promo_codes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_promo_codes_updated_at
BEFORE UPDATE ON promo_codes
FOR EACH ROW
EXECUTE FUNCTION update_promo_codes_updated_at();
