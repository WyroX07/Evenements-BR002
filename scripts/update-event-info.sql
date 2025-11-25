-- Script pour mettre à jour les informations de l'événement crémant
-- Date de fin: 30 novembre 2025
-- Adresse: Rue des fontenelles 26, Ecaussinnes

-- Mise à jour de la date de fin
UPDATE events
SET end_date = '2025-11-30'
WHERE slug = 'cremant-pionniers-2025';

-- Mise à jour de l'adresse de retrait dans la config
UPDATE events
SET config = jsonb_set(
  COALESCE(config, '{}'::jsonb),
  '{pickup_address}',
  '"Rue des fontenelles 26, Ecaussinnes"'
)
WHERE slug = 'cremant-pionniers-2025';

-- Vérification des modifications
SELECT
  name,
  slug,
  end_date,
  config->>'pickup_address' as pickup_address
FROM events
WHERE slug = 'cremant-pionniers-2025';
