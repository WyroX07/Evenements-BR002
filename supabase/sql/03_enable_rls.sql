-- Crémant Pionniers - Configuration Row Level Security (RLS)

-- Activer RLS sur toutes les tables
ALTER TABLE cuvees ENABLE ROW LEVEL SECURITY;
ALTER TABLE slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Politique pour cuvees : lecture publique des cuvées actives uniquement
-- (les écritures se font côté serveur avec Service Role)
CREATE POLICY "Public peut lire les cuvées actives"
  ON cuvees
  FOR SELECT
  USING (is_active = true);

-- Politique pour slots : lecture publique des créneaux futurs
CREATE POLICY "Public peut lire les créneaux futurs"
  ON slots
  FOR SELECT
  USING (date >= CURRENT_DATE);

-- Politique pour orders : aucune lecture publique
-- Toutes les opérations via Service Role côté serveur
CREATE POLICY "Deny all public access to orders"
  ON orders
  FOR ALL
  USING (false);

-- Politique pour order_items : aucune lecture publique
CREATE POLICY "Deny all public access to order_items"
  ON order_items
  FOR ALL
  USING (false);

-- Politique pour settings : lecture publique des paramètres publics uniquement
-- (certaines clés peuvent être exposées si nécessaire)
CREATE POLICY "Public peut lire certains paramètres"
  ON settings
  FOR SELECT
  USING (
    key IN (
      'pickup_address',
      'delivery_enabled',
      'sale_deadline',
      'contact_email'
    )
  );

-- Politique pour audit_logs : aucune lecture publique
CREATE POLICY "Deny all public access to audit_logs"
  ON audit_logs
  FOR ALL
  USING (false);

-- Note : Toutes les écritures (INSERT/UPDATE/DELETE) nécessitent le Service Role Key
-- qui est utilisé uniquement côté serveur dans les API routes.
