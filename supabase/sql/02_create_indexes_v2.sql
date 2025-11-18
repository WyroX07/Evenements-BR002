-- Système Multi-Événements - Index optimisés VERSION 2

-- ========================================
-- INDEX SUR SECTIONS
-- ========================================
CREATE INDEX idx_sections_slug ON sections(slug);
CREATE INDEX idx_sections_sort ON sections(sort_order);

-- ========================================
-- INDEX SUR ÉVÉNEMENTS
-- ========================================
CREATE INDEX idx_events_slug ON events(slug);
CREATE INDEX idx_events_section ON events(section_id);
CREATE INDEX idx_events_status ON events(status) WHERE status = 'ACTIVE';
CREATE INDEX idx_events_type ON events(event_type);
CREATE INDEX idx_events_dates ON events(start_date, end_date);
CREATE INDEX idx_events_active_by_section ON events(section_id, status) WHERE status = 'ACTIVE';

-- ========================================
-- INDEX SUR PRODUITS
-- ========================================
CREATE INDEX idx_products_event ON products(event_id);
CREATE INDEX idx_products_active ON products(event_id, is_active) WHERE is_active = true;
CREATE INDEX idx_products_sort ON products(event_id, sort_order, name);
CREATE INDEX idx_products_type ON products(product_type);

-- ========================================
-- INDEX SUR CRÉNEAUX
-- ========================================
CREATE INDEX idx_slots_event ON slots(event_id);
CREATE INDEX idx_slots_date ON slots(event_id, date);
CREATE INDEX idx_slots_datetime ON slots(event_id, date, start_time);

-- ========================================
-- INDEX SUR COMMANDES
-- ========================================
CREATE INDEX idx_orders_event ON orders(event_id);
CREATE INDEX idx_orders_code ON orders(code);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
CREATE INDEX idx_orders_email ON orders(email);
CREATE INDEX idx_orders_delivery_type ON orders(delivery_type);
CREATE INDEX idx_orders_slot ON orders(slot_id) WHERE slot_id IS NOT NULL;

-- Index composite pour dashboard admin
CREATE INDEX idx_orders_event_status ON orders(event_id, status);
CREATE INDEX idx_orders_event_created ON orders(event_id, created_at DESC);

-- Index pour calcul des statistiques
CREATE INDEX idx_orders_event_status_totals ON orders(event_id, status, total_cents)
  WHERE status IN ('PAID', 'PREPARED', 'DELIVERED');

-- Index pour recherche full-text
CREATE INDEX idx_orders_customer_search ON orders USING gin(
  to_tsvector('french', customer_name || ' ' || email || ' ' || code)
);

-- ========================================
-- INDEX SUR LIGNES DE COMMANDE
-- ========================================
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);
CREATE INDEX idx_order_items_event ON order_items(product_id, order_id); -- Pour stats par événement

-- ========================================
-- INDEX SUR AUDIT LOGS
-- ========================================
CREATE INDEX idx_audit_logs_event ON audit_logs(event_id) WHERE event_id IS NOT NULL;
CREATE INDEX idx_audit_logs_order ON audit_logs(order_id) WHERE order_id IS NOT NULL;
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
