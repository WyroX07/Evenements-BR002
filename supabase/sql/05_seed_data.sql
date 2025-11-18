-- Crémant Pionniers - Données initiales de seed

-- Insertion des paramètres par défaut
INSERT INTO settings (key, value) VALUES
  ('pickup_address', '"Rue des fontenelles 26, 7190 Ecaussinnes"'),
  ('delivery_enabled', 'true'),
  ('delivery_min_bottles', '5'),
  ('delivery_fee_cents', '0'),
  ('allowed_zip_codes', '["1400","1348","1340","7100","7060","7090","7180"]'),
  ('discount_10for9', 'true'),
  ('pay_link_url', '""'),
  ('contact_email', '"contact@pionniers-ecaussinnes.be"'),
  ('headline', '"Soutenez les Pionniers d\'\'Ecaussinnes"'),
  ('privacy_text', '"Vos données personnelles sont collectées uniquement dans le cadre de cette vente caritative et ne seront pas transmises à des tiers. Conformément au RGPD, vous disposez d\'\'un droit d\'\'accès, de rectification et de suppression de vos données."')
ON CONFLICT (key) DO NOTHING;

-- Insertion de deux cuvées exemple
INSERT INTO cuvees (name, description, price_cents, is_active, stock, sort_order) VALUES
  (
    'Crémant Blanc - Maison Lissner',
    'Crémant blanc élégant et raffiné, parfait pour vos célébrations. Notes de fruits blancs et d''agrumes.',
    1200,
    true,
    NULL,
    1
  ),
  (
    'Crémant Rosé - Maison Lissner',
    'Crémant rosé délicat aux arômes de fruits rouges. Idéal pour l''apéritif.',
    1300,
    false,
    NULL,
    2
  )
ON CONFLICT DO NOTHING;

-- Insertion de créneaux exemple pour les deux prochains week-ends
-- (À adapter selon vos vraies dates)
DO $$
DECLARE
  next_saturday DATE;
  following_saturday DATE;
BEGIN
  -- Calcul du prochain samedi
  next_saturday := CURRENT_DATE + ((6 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7);
  IF next_saturday = CURRENT_DATE THEN
    next_saturday := next_saturday + 7;
  END IF;

  following_saturday := next_saturday + 7;

  -- Créneaux pour le premier samedi
  INSERT INTO slots (date, start_time, end_time, capacity) VALUES
    (next_saturday, '14:00', '17:30', 50);

  -- Créneaux pour le deuxième samedi
  INSERT INTO slots (date, start_time, end_time, capacity) VALUES
    (following_saturday, '14:00', '17:30', 50);
END $$;

-- Message de confirmation
DO $$
BEGIN
  RAISE NOTICE 'Seed data inserted successfully!';
  RAISE NOTICE 'Cuvées créées, paramètres configurés, créneaux générés.';
END $$;
