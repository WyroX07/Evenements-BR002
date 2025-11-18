-- Migration: Ajout des champs allergènes et végétarien aux produits
-- Date: 2025-11-13
-- Description: Ajoute des informations nutritionnelles pour aider les clients

-- Ajouter le champ pour les allergènes (array JSON)
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS allergens JSONB DEFAULT '[]'::jsonb;

-- Ajouter le champ végétarien
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS is_vegetarian BOOLEAN DEFAULT false;

-- Ajouter le champ végétalien (vegan)
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS is_vegan BOOLEAN DEFAULT false;

-- Commentaires pour documentation
COMMENT ON COLUMN products.allergens IS 'Liste des allergènes présents (ex: ["gluten", "lactose", "soja"])';
COMMENT ON COLUMN products.is_vegetarian IS 'Produit convient aux végétariens';
COMMENT ON COLUMN products.is_vegan IS 'Produit convient aux végétaliens (vegan)';

-- Exemples d'allergènes courants:
-- gluten, lactose, oeufs, poisson, crustaces, fruits_a_coque,
-- arachides, soja, celeri, moutarde, sesame, sulfites, lupin, mollusques
