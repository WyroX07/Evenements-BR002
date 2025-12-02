-- Fix stock management functions to handle unlimited stock (NULL)
-- Products with stock = NULL should not be affected by increment/decrement operations

-- Function to decrement product stock
-- Called when an order is created or reactivated
CREATE OR REPLACE FUNCTION decrement_product_stock(
  product_id UUID,
  quantity INTEGER
)
RETURNS VOID AS $$
BEGIN
  -- Only update stock if it's not NULL (unlimited stock)
  UPDATE products
  SET stock = GREATEST(0, stock - quantity)
  WHERE id = product_id
    AND stock IS NOT NULL;

  -- Log if stock goes to 0 or negative
  IF (SELECT stock FROM products WHERE id = product_id) <= 0 THEN
    RAISE NOTICE 'Product % stock is now 0 or negative', product_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment product stock
-- Called when an order is cancelled
CREATE OR REPLACE FUNCTION increment_product_stock(
  product_id UUID,
  quantity INTEGER
)
RETURNS VOID AS $$
BEGIN
  -- Only restore stock if it's not NULL (unlimited stock)
  UPDATE products
  SET stock = stock + quantity
  WHERE id = product_id
    AND stock IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions remain the same
GRANT EXECUTE ON FUNCTION decrement_product_stock(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_product_stock(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION decrement_product_stock(UUID, INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION increment_product_stock(UUID, INTEGER) TO service_role;
