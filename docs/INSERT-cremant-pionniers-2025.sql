-- ============================================================================
-- INSERTION SIMPLE: Crémant d'Alsace Pionniers 2025
-- ============================================================================

-- NETTOYAGE (supprimer l'ancien événement s'il existe)
DELETE FROM events WHERE id = '35ec2f47-56cf-4a76-88a1-a109cfb6db6e';

-- 1. ÉVÉNEMENT
INSERT INTO events (
  id,
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
  '35ec2f47-56cf-4a76-88a1-a109cfb6db6e',
  'cremant-pionniers-2025',
  '439c18e9-bf47-4740-ae6a-2bf58225fb5a',
  'PRODUCT_SALE',
  'ACTIVE',
  'Vente de Crémant d''Alsace 2025',
  'Soutenez les Pionniers d''Ecaussinnes avec les crémants bio de la Maison Lissner. Viticulture sauvage, terroir d''exception, méthode traditionnelle. Des vins libres et vivants depuis 1848.',
  '2024-11-01',
  '2025-12-31',
  '{
    "title": "Crémant d''Alsace Bio - Maison Lissner",
    "subtitle": "Vins Libres, Sauvages et Bio depuis 1848",
    "description": "Découvrez l''excellence alsacienne avec les crémants bio de la Maison Lissner. Viticulture sauvage, fermentation spontanée, terroir de la Couronne d''Or. Qualité champagne, authenticité nature.",
    "banner_url": null,
    "features": ["Remise 10 pour le prix de 9", "Livraison gratuite dès 10 bouteilles", "Viticulture biologique certifiée", "100% des bénéfices pour les scouts"],
    "cta_text": "Commander mes crémants bio",
    "show_deadline": true,
    "show_stats": true,
    "value_propositions": [
      {
        "icon": "eco",
        "title": "Viticulture Sauvage & Bio",
        "description": "Certification Agriculture Biologique. Approche biodynamique avec sols vivants, biodiversité spontanée et zéro intervention chimique. Des vins qui respirent la nature."
      },
      {
        "icon": "quality",
        "title": "Terroir d''Exception",
        "description": "8 hectares de vignes à Wolxheim, village historique de la Couronne d''Or en Alsace. Fermentation spontanée et méthode traditionnelle pour des bulles d''une finesse incomparable."
      },
      {
        "icon": "support",
        "title": "Soutenez les Pionniers",
        "description": "100% des bénéfices financent les activités de la section Pionniers : camps d''été, sorties nature, projets solidaires et matériel scout."
      }
    ],
    "about_section": {
      "enabled": true,
      "title": "Maison Lissner : Vignerons Libres depuis 1848",
      "content": "**Une philosophie unique : la viticulture sauvage**\n\nDepuis 1848, la Maison Lissner cultive 8 hectares de vignes dans le village historique de Wolxheim, au cœur de la Couronne d''Or alsacienne. Menée par Bruno Schloegel et son fils Théo, la maison incarne une viticulture libre et respectueuse.\n\n**Vins d''Alsace libres, sauvages et bio**\n\nLeur devise ? Laisser la biodiversité spontanée se développer sur chaque parcelle pour que chaque terroir puisse trouver son propre équilibre. Pas d''intervention mécanique inutile, pas de chimie, juste le rythme naturel de la vigne et du sol.\n\n**Certification bio et approche biodynamique**\n\nCertifiés en Agriculture Biologique, les Lissner vont plus loin avec une approche biodynamique. Sols vivants, fermentation spontanée avec levures indigènes, aucun sulfite ajouté : leurs vins sont de véritables produits vivants.\n\n**Crémant vs Champagne : la même excellence**\n\nLa méthode de production du crémant est strictement identique à celle du champagne : méthode traditionnelle, seconde fermentation en bouteille, vieillissement sur lies. La seule différence ? L''Appellation d''Origine Protégée (Champagne vs Alsace). Même rigueur, même finesse, prix plus accessible.\n\n**Qualité champagne, authenticité nature**\n\nAvec Lissner, vous obtenez des bulles d''exception issues d''une viticulture consciente. Et en achetant chez nous, vous soutenez directement les Pionniers d''Ecaussinnes !",
      "image_url": "https://placeholder.com/vignoble-lissner-wolxheim.jpg",
      "link": {
        "url": "https://lissner.fr",
        "label": "Découvrir Maison Lissner"
      }
    },
    "media": {
      "type": "video",
      "title": "Rencontre avec le vigneron - Salon du Vin 2024",
      "video_url": "https://youtube.com/embed/VOTRE_VIDEO_SALON_DU_VIN",
      "video_thumbnail": "https://placeholder.com/video-thumbnail-lissner.jpg"
    },
    "faq": [
      {
        "question": "Pourquoi choisir du crémant plutôt que du champagne ?",
        "answer": "La méthode de production est strictement identique (méthode traditionnelle champenoise). La seule différence est géographique : Champagne vs Alsace. Le crémant Lissner offre la même rigueur de production, la même finesse, pour un prix 30 à 40% plus accessible. Et avec Lissner, vous ajoutez la dimension bio et nature !"
      },
      {
        "question": "C''est quoi la viticulture sauvage de Lissner ?",
        "answer": "C''est une approche où on laisse la nature reprendre ses droits. Biodiversité spontanée, pas d''intervention mécanique excessive, sols vivants, fermentation avec levures indigènes. Le vigneron écoute le terroir au lieu de lui imposer des contraintes. Résultat : des vins authentiques et vivants."
      },
      {
        "question": "Les crémants sont-ils certifiés bio ?",
        "answer": "Oui ! La Maison Lissner est certifiée en Agriculture Biologique et pratique même une approche biodynamique. Aucun pesticide, aucun produit chimique de synthèse. Leurs crémants sont également produits sans sulfites ajoutés."
      },
      {
        "question": "Comment fonctionne la remise 10 pour le prix de 9 ?",
        "answer": "Simple : pour chaque tranche de 10 bouteilles commandées, vous ne payez que 9 bouteilles. Exemple : 20 bouteilles = vous payez 18, soit 2 bouteilles offertes !"
      },
      {
        "question": "Comment récupérer ma commande ?",
        "answer": "Deux options au choix : retrait au local des scouts selon les créneaux proposés (voir section créneaux ci-dessus) ou livraison gratuite à domicile pour toute commande de 10 bouteilles ou plus dans les zones éligibles."
      },
      {
        "question": "Quels sont les modes de paiement acceptés ?",
        "answer": "Virement bancaire (recommandé et instructions envoyées par email) ou paiement sur place lors du retrait (espèces, Bancontact). Vous recevrez toutes les informations dans votre email de confirmation."
      },
      {
        "question": "À quoi servent les bénéfices de cette vente ?",
        "answer": "100% des bénéfices financent les activités de la section Pionniers d''Ecaussinnes : camps d''été, week-ends nature, matériel de camping, projets solidaires et internationaux. Chaque bouteille achetée soutient directement nos jeunes scouts !"
      }
    ],
    "social_links": {
      "facebook_event": "https://facebook.com/events/VOTRE_EVENT_ID",
      "instagram": "@pionniers_ecaussinnes",
      "custom_links": [
        {
          "label": "Site Maison Lissner",
          "url": "https://lissner.fr",
          "icon": "🍇"
        }
      ]
    }
  }'::jsonb,
  '{
    "delivery_enabled": true,
    "delivery_min_bottles": 10,
    "delivery_fee_cents": 0,
    "discount_10for9": true,
    "pickup_address": "Local des Scouts, Rue de la Place 12, 7190 Ecaussinnes",
    "allowed_zip_codes": ["7190", "7191", "7120", "7110", "1400", "1480", "1420", "7060"],
    "order_code_prefix": "CRE"
  }'::jsonb
);

-- 2. PRODUITS
INSERT INTO products (event_id, name, description, price_cents, product_type, is_active, sort_order) VALUES
('35ec2f47-56cf-4a76-88a1-a109cfb6db6e', 'Crémant d''Alsace Brut Nature', 'Élégant et minéral. Bulles fines et persistantes, notes d''agrumes et de fleurs blanches. Fermentation spontanée, zéro sulfites ajoutés. Parfait à l''apéritif ou avec fruits de mer.', 1400, 'ITEM', true, 1),
('35ec2f47-56cf-4a76-88a1-a109cfb6db6e', 'Crémant d''Alsace Rosé Bio', 'Fruité et délicat. Arômes de fruits rouges (fraise, framboise) avec une belle fraîcheur. Vinification nature, levures indigènes. Idéal pour desserts aux fruits ou apéritif estival.', 1500, 'ITEM', true, 2),
('35ec2f47-56cf-4a76-88a1-a109cfb6db6e', 'Crémant d''Alsace Prestige', 'Cuvée premium issue de vieilles vignes. Vieillissement prolongé sur lies (36 mois minimum). Complexité aromatique, finesse exceptionnelle. Pour les grandes occasions. Vinification biodynamique.', 1800, 'ITEM', true, 3);

-- 3. CRÉNEAUX
INSERT INTO slots (event_id, date, start_time, end_time, capacity) VALUES
('35ec2f47-56cf-4a76-88a1-a109cfb6db6e', '2025-03-22', '10:00', '12:00', 30),
('35ec2f47-56cf-4a76-88a1-a109cfb6db6e', '2025-03-22', '14:00', '17:00', 40),
('35ec2f47-56cf-4a76-88a1-a109cfb6db6e', '2025-03-29', '10:00', '12:00', 30),
('35ec2f47-56cf-4a76-88a1-a109cfb6db6e', '2025-03-29', '14:00', '16:00', 25);

-- VÉRIFICATION
SELECT 'Événement créé:' as info, id, slug, name FROM events WHERE slug = 'cremant-pionniers-2025';
SELECT 'Produits créés:' as info, COUNT(*) as total FROM products WHERE event_id = '35ec2f47-56cf-4a76-88a1-a109cfb6db6e';
SELECT 'Créneaux créés:' as info, COUNT(*) as total FROM slots WHERE event_id = '35ec2f47-56cf-4a76-88a1-a109cfb6db6e';
