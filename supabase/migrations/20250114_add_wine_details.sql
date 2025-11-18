-- Migration: Ajouter les champs d�taill�s pour les vins et bulles
-- Date: 2025-01-14
-- Description: Ajoute les informations d�taill�es pour la vente de cr�mants/champagnes/vins

ALTER TABLE products
ADD COLUMN IF NOT EXISTS is_wine BOOLEAN DEFAULT false,  -- Indique si le produit est un vin/crémant/champagne
ADD COLUMN IF NOT EXISTS vintage TEXT,                    -- Mill�sime (ex: "2018z", "2013/2014")
ADD COLUMN IF NOT EXISTS color TEXT,                      -- Couleur (ex: "jaune clair", "rose", "rouge clair")
ADD COLUMN IF NOT EXISTS aromas TEXT,                     -- Parfums/ar�mes (ex: "�pic�, intense", "fruit�, salin")
ADD COLUMN IF NOT EXISTS balance TEXT,                    -- �quilibre (ex: "frais et puissant", "l�ger, sans sucres r�siduels")
ADD COLUMN IF NOT EXISTS food_pairings TEXT,              -- Accords culinaires (ex: "ap�ritif, viande, poissons")
ADD COLUMN IF NOT EXISTS conservation TEXT,               -- Conservation (ex: "2 ans", "5-7 ans", "+ 10 ans")
ADD COLUMN IF NOT EXISTS grape_variety TEXT,              -- C�page (ex: "Pinot Blanc", "Riesling", "Chardonnay")
ADD COLUMN IF NOT EXISTS wine_type TEXT,                  -- Type de vin (ex: "sec", "l�g�rement moelleux", "liquoreux", "brut nature")
ADD COLUMN IF NOT EXISTS appellation TEXT,                -- Appellation (ex: "Grand Cru Altenberg de Wolxheim", "AOC Alsace")
ADD COLUMN IF NOT EXISTS special_mentions TEXT[],         -- Mentions sp�ciales (ex: ["Z - non filtr�", "biologique", "brut nature"])
ADD COLUMN IF NOT EXISTS residual_sugar_gl INTEGER,       -- Sucres r�siduels en g/l
ADD COLUMN IF NOT EXISTS limited_stock BOOLEAN DEFAULT false,  -- Stock limit� (pour cr�er l'urgence marketing)
ADD COLUMN IF NOT EXISTS highlight_badge TEXT,            -- Badge de mise en avant (ex: "�dition limit�e", "Exclusivit�", "Coup de coeur")
ADD COLUMN IF NOT EXISTS producer TEXT,                   -- Producteur (ex: "Lissner", "Veuve Doussot")
ADD COLUMN IF NOT EXISTS origin TEXT;                     -- Origine (ex: "Alsace", "Champagne")

-- Commentaire sur la table
COMMENT ON COLUMN products.vintage IS 'Mill�sime du vin (ex: 2018z pour mill�sime 2018 non filtr�)';
COMMENT ON COLUMN products.color IS 'Couleur du vin (jaune clair, rose, rouge clair, etc.)';
COMMENT ON COLUMN products.aromas IS 'Parfums et ar�mes du vin';
COMMENT ON COLUMN products.balance IS 'Description de l''�quilibre en bouche';
COMMENT ON COLUMN products.food_pairings IS 'Accords culinaires recommand�s';
COMMENT ON COLUMN products.conservation IS 'Dur�e de conservation recommand�e';
COMMENT ON COLUMN products.grape_variety IS 'C�page principal du vin';
COMMENT ON COLUMN products.wine_type IS 'Type de vin: sec, moelleux, liquoreux, brut, etc.';
COMMENT ON COLUMN products.appellation IS 'Appellation d''origine (AOC, Grand Cru, etc.)';
COMMENT ON COLUMN products.special_mentions IS 'Mentions sp�ciales (bio, non filtr�, etc.)';
COMMENT ON COLUMN products.residual_sugar_gl IS 'Sucres r�siduels en grammes par litre';
COMMENT ON COLUMN products.limited_stock IS 'Indique si le produit est en quantit� limit�e';
COMMENT ON COLUMN products.highlight_badge IS 'Badge de mise en avant pour le marketing';
COMMENT ON COLUMN products.producer IS 'Nom du producteur';
COMMENT ON COLUMN products.origin IS 'R�gion d''origine du vin';
