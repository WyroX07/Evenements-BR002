-- Crémant Pionniers - Index pour optimiser les requêtes

-- Index sur les cuvées
CREATE INDEX idx_cuvees_active ON cuvees(is_active) WHERE is_active = true;
CREATE INDEX idx_cuvees_sort ON cuvees(sort_order, name);

-- Index sur les créneaux
CREATE INDEX idx_slots_date ON slots(date);
CREATE INDEX idx_slots_date_time ON slots(date, start_time);

-- Index sur les commandes
CREATE INDEX idx_orders_code ON orders(code);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
CREATE INDEX idx_orders_email ON orders(email);
CREATE INDEX idx_orders_delivery_type ON orders(delivery_type);
CREATE INDEX idx_orders_slot ON orders(slot_id) WHERE slot_id IS NOT NULL;
CREATE INDEX idx_orders_status_slot ON orders(status, slot_id) WHERE slot_id IS NOT NULL;

-- Index texte pour recherche
CREATE INDEX idx_orders_customer_search ON orders USING gin(
  to_tsvector('french', customer_name || ' ' || email)
);

-- Index sur les lignes de commande
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_cuvee ON order_items(cuvee_id);

-- Index sur les logs d'audit
CREATE INDEX idx_audit_logs_order ON audit_logs(order_id) WHERE order_id IS NOT NULL;
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);
