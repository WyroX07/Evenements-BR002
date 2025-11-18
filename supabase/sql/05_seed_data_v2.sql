-- Système Multi-Événements - Données de seed VERSION 2

-- ========================================
-- 1. SECTIONS SCOUTES (avec IBANs propres)
-- ========================================
INSERT INTO sections (name, slug, color, sort_order, iban, iban_name) VALUES
  ('Baladins', 'baladins', '#FF6B35', 1, 'BE68 5390 0000 0001', 'Baladins Ecaussinnes'),
  ('Louveteaux', 'louveteaux', '#F7931E', 2, 'BE68 5390 0000 0002', 'Louveteaux Ecaussinnes'),
  ('Éclaireurs', 'eclaireurs', '#00A651', 3, 'BE68 5390 0000 0003', 'Éclaireurs Ecaussinnes'),
  ('Pionniers', 'pionniers', '#0071BC', 4, 'BE68 5390 0754 7034', 'Pionniers d''Ecaussinnes'),
  ('Unité', 'unite', '#8B4789', 5, 'BE68 5390 0000 0005', 'Unité Scoute Ecaussinnes')
ON CONFLICT (slug) DO UPDATE SET
  iban = EXCLUDED.iban,
  iban_name = EXCLUDED.iban_name;

-- ========================================
-- 2. PARAMÈTRES GLOBAUX
-- ========================================
INSERT INTO settings (key, value) VALUES
  ('site_name', '"Scouts d''Ecaussinnes"'),
  ('contact_email', '"contact@pionniers-ecaussinnes.be"'),
  ('admin_iban', '"BE68 5390 0754 7034"'),
  ('admin_iban_name', '"Pionniers d''Ecaussinnes"'),
  ('privacy_text', '"Vos données personnelles sont collectées uniquement dans le cadre de nos ventes caritatives et ne seront pas transmises à des tiers. Conformément au RGPD, vous disposez d''un droit d''accès, de rectification et de suppression de vos données. Contact: contact@pionniers-ecaussinnes.be"')
ON CONFLICT (key) DO NOTHING;

-- ========================================
-- 3. ÉVÉNEMENT EXEMPLE: Vente de Crémant
-- ========================================
DO $$
DECLARE
  section_pionniers_id UUID;
  event_cremant_id UUID;
  cuvee_blanc_id UUID;
  cuvee_rose_id UUID;
  next_saturday DATE;
  following_saturday DATE;
BEGIN
  -- Récupérer l'ID de la section Pionniers
  SELECT id INTO section_pionniers_id FROM sections WHERE slug = 'pionniers';

  -- Calculer les prochains samedis
  next_saturday := CURRENT_DATE + ((6 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7);
  IF next_saturday = CURRENT_DATE THEN
    next_saturday := next_saturday + 7;
  END IF;
  following_saturday := next_saturday + 7;

  -- Créer l'événement Crémant
  INSERT INTO events (
    slug,
    section_id,
    event_type,
    status,
    name,
    description,
    start_date,
    end_date,
    hero_config,
    config
  ) VALUES (
    'cremant-pionniers-2024',
    section_pionniers_id,
    'PRODUCT_SALE',
    'ACTIVE',
    'Vente de Crémant 2024',
    'Soutenez les Pionniers d''Ecaussinnes en commandant nos délicieux crémants de la Maison Lissner.',
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '60 days',
    jsonb_build_object(
      'title', 'Vente de Crémant 2024',
      'subtitle', 'Maison Lissner',
      'description', 'Soutenez nos activités en commandant nos délicieux crémants. Remise spéciale : 10 bouteilles pour le prix de 9 !',
      'banner_url', null,
      'show_deadline', true,
      'show_stats', true,
      'features', jsonb_build_array(
        'Crémants de qualité',
        'Remise 10 pour 9',
        'Retrait ou livraison',
        'Vente caritative scoute'
      ),
      'cta_text', 'Commander maintenant'
    ),
    jsonb_build_object(
      'delivery_enabled', true,
      'delivery_min_bottles', 5,
      'delivery_fee_cents', 0,
      'allowed_zip_codes', jsonb_build_array('1400','1348','1340','7100','7060','7090','7180','7190'),
      'discount_10for9', true,
      'pickup_address', 'Rue des fontenelles 26, 7190 Ecaussinnes',
      'pay_link_url', '',
      'order_code_prefix', 'CRE'
    )
  ) RETURNING id INTO event_cremant_id;

  -- Créer les produits (cuvées)
  INSERT INTO products (event_id, name, description, price_cents, product_type, stock, is_active, sort_order)
  VALUES
    (
      event_cremant_id,
      'Crémant Blanc - Maison Lissner',
      'Crémant blanc élégant et raffiné, parfait pour vos célébrations. Notes de fruits blancs et d''agrumes.',
      1200,
      'ITEM',
      NULL, -- Stock illimité
      true,
      1
    ),
    (
      event_cremant_id,
      'Crémant Rosé - Maison Lissner',
      'Crémant rosé délicat aux arômes de fruits rouges. Idéal pour l''apéritif.',
      1300,
      'ITEM',
      NULL,
      false, -- Pas encore disponible
      2
    );

  -- Créer les créneaux de retrait
  INSERT INTO slots (event_id, date, start_time, end_time, capacity)
  VALUES
    (event_cremant_id, next_saturday, '14:00', '17:30', 50),
    (event_cremant_id, following_saturday, '14:00', '17:30', 50);

  RAISE NOTICE 'Événement Crémant créé avec succès!';
END $$;

-- ========================================
-- 4. ÉVÉNEMENT EXEMPLE: Souper Scout
-- ========================================
DO $$
DECLARE
  section_louveteaux_id UUID;
  event_souper_id UUID;
  souper_date DATE;
BEGIN
  SELECT id INTO section_louveteaux_id FROM sections WHERE slug = 'louveteaux';

  -- Date du souper : dans 30 jours
  souper_date := CURRENT_DATE + INTERVAL '30 days';

  INSERT INTO events (
    slug,
    section_id,
    event_type,
    status,
    name,
    description,
    start_date,
    end_date,
    hero_config,
    config
  ) VALUES (
    'souper-louveteaux-2024',
    section_louveteaux_id,
    'MEAL',
    'DRAFT', -- Pas encore actif
    'Souper des Louveteaux 2024',
    'Venez partager un moment convivial autour d''un délicieux repas préparé avec amour par les Louveteaux!',
    CURRENT_DATE,
    souper_date - INTERVAL '3 days', -- Réservations jusqu'à 3 jours avant
    jsonb_build_object(
      'title', 'Souper des Louveteaux',
      'subtitle', souper_date::TEXT || ' à 19h00',
      'description', 'Rejoignez-nous pour une soirée conviviale ! Menu complet préparé avec soin.',
      'banner_url', null,
      'show_deadline', true,
      'show_stats', true,
      'features', jsonb_build_array(
        'Menu complet',
        'Ambiance conviviale',
        'Places limitées',
        'Au local scout'
      ),
      'cta_text', 'Réserver ma place'
    ),
    jsonb_build_object(
      'delivery_enabled', false,
      'pickup_address', 'Rue des fontenelles 26, 7190 Ecaussinnes',
      'order_code_prefix', 'SOU'
    )
  ) RETURNING id INTO event_souper_id;

  -- Créer les menus
  INSERT INTO products (event_id, name, description, price_cents, product_type, stock, is_active, sort_order)
  VALUES
    (
      event_souper_id,
      'Menu Adulte',
      'Entrée + Plat + Dessert + Boissons',
      1500,
      'MENU',
      NULL,
      true,
      1
    ),
    (
      event_souper_id,
      'Menu Enfant (-12 ans)',
      'Plat adapté + Dessert + Boisson',
      800,
      'MENU',
      NULL,
      true,
      2
    );

  -- Créer le créneau unique (date du souper)
  INSERT INTO slots (event_id, date, start_time, end_time, capacity)
  VALUES (event_souper_id, souper_date, '19:00', '22:00', 80);

  RAISE NOTICE 'Événement Souper créé avec succès!';
END $$;

-- ========================================
-- Message final
-- ========================================
DO $$
BEGIN
  RAISE NOTICE '✅ Seed data inserted successfully!';
  RAISE NOTICE '📦 Sections: Baladins, Louveteaux, Éclaireurs, Pionniers, Unité';
  RAISE NOTICE '🍾 Événement actif: Vente de Crémant (Pionniers)';
  RAISE NOTICE '🍽️ Événement draft: Souper des Louveteaux';
END $$;
