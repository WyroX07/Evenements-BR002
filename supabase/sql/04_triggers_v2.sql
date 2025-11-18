-- Système Multi-Événements - Triggers VERSION 2

-- ========================================
-- FONCTION: Mise à jour timestamp updated_at
-- ========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- TRIGGERS UPDATED_AT
-- ========================================
CREATE TRIGGER update_sections_updated_at
  BEFORE UPDATE ON sections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_slots_updated_at
  BEFORE UPDATE ON slots
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at
  BEFORE UPDATE ON settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- FONCTION: Audit automatique changement statut commande
-- ========================================
CREATE OR REPLACE FUNCTION log_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO audit_logs (event_id, order_id, action, meta)
    VALUES (
      NEW.event_id,
      NEW.id,
      'status_changed',
      jsonb_build_object(
        'old_status', OLD.status,
        'new_status', NEW.status,
        'order_code', NEW.code,
        'timestamp', NOW()
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_order_status_change
  AFTER UPDATE ON orders
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION log_order_status_change();

-- ========================================
-- FONCTION: Audit création/suppression événement
-- ========================================
CREATE OR REPLACE FUNCTION log_event_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO audit_logs (event_id, action, meta)
    VALUES (
      NEW.id,
      'event_created',
      jsonb_build_object(
        'event_slug', NEW.slug,
        'event_name', NEW.name,
        'event_type', NEW.event_type,
        'timestamp', NOW()
      )
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO audit_logs (event_id, action, meta)
    VALUES (
      NEW.id,
      'event_status_changed',
      jsonb_build_object(
        'event_slug', NEW.slug,
        'old_status', OLD.status,
        'new_status', NEW.status,
        'timestamp', NOW()
      )
    );
    RETURN NEW;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_event_changes
  AFTER INSERT OR UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION log_event_changes();

-- ========================================
-- FONCTION: Empêcher suppression événement avec commandes
-- ========================================
CREATE OR REPLACE FUNCTION prevent_event_deletion_with_orders()
RETURNS TRIGGER AS $$
DECLARE
  orders_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO orders_count
  FROM orders
  WHERE event_id = OLD.id;

  IF orders_count > 0 THEN
    RAISE EXCEPTION 'Impossible de supprimer un événement avec des commandes associées (% commandes)', orders_count;
  END IF;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_event_deletion
  BEFORE DELETE ON events
  FOR EACH ROW
  EXECUTE FUNCTION prevent_event_deletion_with_orders();
