-- Système Multi-Événements - Row Level Security VERSION 2

-- ========================================
-- ACTIVER RLS SUR TOUTES LES TABLES
-- ========================================
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ========================================
-- POLITIQUES POUR SECTIONS
-- ========================================
CREATE POLICY "Public peut lire les sections"
  ON sections
  FOR SELECT
  USING (true);

-- ========================================
-- POLITIQUES POUR ÉVÉNEMENTS
-- ========================================
-- Lecture publique des événements actifs uniquement
CREATE POLICY "Public peut lire les événements actifs"
  ON events
  FOR SELECT
  USING (status = 'ACTIVE' AND CURRENT_DATE BETWEEN start_date AND end_date);

-- ========================================
-- POLITIQUES POUR PRODUITS
-- ========================================
-- Lecture publique des produits actifs d'événements actifs
CREATE POLICY "Public peut lire les produits actifs"
  ON products
  FOR SELECT
  USING (
    is_active = true
    AND EXISTS (
      SELECT 1 FROM events
      WHERE events.id = products.event_id
      AND events.status = 'ACTIVE'
    )
  );

-- ========================================
-- POLITIQUES POUR CRÉNEAUX
-- ========================================
-- Lecture publique des créneaux futurs d'événements actifs
CREATE POLICY "Public peut lire les créneaux futurs"
  ON slots
  FOR SELECT
  USING (
    date >= CURRENT_DATE
    AND EXISTS (
      SELECT 1 FROM events
      WHERE events.id = slots.event_id
      AND events.status = 'ACTIVE'
    )
  );

-- ========================================
-- POLITIQUES POUR COMMANDES
-- ========================================
-- Aucune lecture publique : tout via Service Role côté serveur
CREATE POLICY "Deny all public access to orders"
  ON orders
  FOR ALL
  USING (false);

-- ========================================
-- POLITIQUES POUR LIGNES DE COMMANDE
-- ========================================
CREATE POLICY "Deny all public access to order_items"
  ON order_items
  FOR ALL
  USING (false);

-- ========================================
-- POLITIQUES POUR SETTINGS
-- ========================================
-- Lecture publique de certains paramètres seulement
CREATE POLICY "Public peut lire certains paramètres"
  ON settings
  FOR SELECT
  USING (
    key IN (
      'contact_email',
      'privacy_text',
      'site_name'
    )
  );

-- ========================================
-- POLITIQUES POUR AUDIT LOGS
-- ========================================
CREATE POLICY "Deny all public access to audit_logs"
  ON audit_logs
  FOR ALL
  USING (false);

-- Note : Toutes les écritures (INSERT/UPDATE/DELETE) nécessitent le Service Role Key
-- utilisé uniquement côté serveur dans les API routes. Aucune écriture publique autorisée.
