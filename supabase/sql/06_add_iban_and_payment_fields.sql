-- Migration incrémentale : Ajout des champs IBAN et paiement
-- À exécuter APRÈS avoir déjà appliqué les migrations v2 de base

-- ========================================
-- 1. AJOUTER COLONNES IBAN À LA TABLE SECTIONS
-- ========================================

-- Ajouter IBAN et nom du titulaire
ALTER TABLE sections
ADD COLUMN IF NOT EXISTS iban TEXT,
ADD COLUMN IF NOT EXISTS iban_name TEXT;

-- Commentaires
COMMENT ON COLUMN sections.iban IS 'IBAN propre à la section pour les virements';
COMMENT ON COLUMN sections.iban_name IS 'Nom du titulaire du compte (ex: "Louveteaux Ecaussinnes")';

-- ========================================
-- 2. METTRE À JOUR LA TABLE ORDERS
-- ========================================

-- Ajouter colonne pour communication de virement
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS payment_communication TEXT;

COMMENT ON COLUMN orders.payment_communication IS 'Communication virement générée : "NOM Prénom - Nom événement"';

-- Mettre à jour la contrainte de payment_method pour enlever PAY_LINK
-- (On garde uniquement BANK_TRANSFER et ON_SITE)
ALTER TABLE orders
DROP CONSTRAINT IF EXISTS orders_payment_method_check;

ALTER TABLE orders
ADD CONSTRAINT orders_payment_method_check CHECK (
  payment_method IN ('BANK_TRANSFER', 'ON_SITE')
);

-- ========================================
-- 3. METTRE À JOUR LA CONFIG DES ÉVÉNEMENTS
-- ========================================

-- Note: La colonne config existe déjà en JSONB
-- On met à jour juste les valeurs par défaut pour les nouveaux événements

-- Les événements existants garderont leur ancienne config
-- Les nouveaux événements auront la nouvelle config par défaut

COMMENT ON COLUMN events.config IS 'Configuration : payment_iban_override (si null, utilise IBAN de la section), payment_methods_enabled, contact_email, etc.';

-- ========================================
-- 4. PEUPLER LES IBANs DES SECTIONS EXISTANTES
-- ========================================

-- Mettre à jour les sections avec leurs IBANs
-- (Remplace ces valeurs par les vrais IBANs de chaque section)

UPDATE sections SET
  iban = 'BE68 5390 0000 0001',
  iban_name = 'Baladins Ecaussinnes'
WHERE slug = 'baladins';

UPDATE sections SET
  iban = 'BE68 5390 0000 0002',
  iban_name = 'Louveteaux Ecaussinnes'
WHERE slug = 'louveteaux';

UPDATE sections SET
  iban = 'BE68 5390 0000 0003',
  iban_name = 'Éclaireurs Ecaussinnes'
WHERE slug = 'eclaireurs';

UPDATE sections SET
  iban = 'BE68 5390 0754 7034',
  iban_name = 'Pionniers d''Ecaussinnes'
WHERE slug = 'pionniers';

UPDATE sections SET
  iban = 'BE68 5390 0000 0005',
  iban_name = 'Unité Scoute Ecaussinnes'
WHERE slug = 'unite';

-- ========================================
-- 5. METTRE À JOUR LA CONFIG DES ÉVÉNEMENTS EXISTANTS
-- ========================================

-- Ajouter les nouveaux champs de config aux événements existants
UPDATE events
SET config = config || jsonb_build_object(
  'contact_email', COALESCE(config->>'contact_email', ''),
  'payment_methods_enabled',
    COALESCE(
      config->'payment_methods_enabled',
      '["BANK_TRANSFER", "ON_SITE"]'::jsonb
    ),
  'payment_iban_override', NULL,
  'payment_iban_name_override', NULL
)
WHERE config IS NOT NULL;

-- ========================================
-- Message de confirmation
-- ========================================

DO $$
BEGIN
  RAISE NOTICE '✅ Migration incrémentale appliquée avec succès!';
  RAISE NOTICE '📋 Colonnes ajoutées:';
  RAISE NOTICE '   - sections.iban';
  RAISE NOTICE '   - sections.iban_name';
  RAISE NOTICE '   - orders.payment_communication';
  RAISE NOTICE '💳 Méthodes de paiement mises à jour: BANK_TRANSFER, ON_SITE';
  RAISE NOTICE '🏦 IBANs des sections configurés';
END $$;
