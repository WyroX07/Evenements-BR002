-- Function to decrement product stock
-- Called when an order is confirmed (PENDING → PAID)
CREATE OR REPLACE FUNCTION decrement_product_stock(
  product_id UUID,
  quantity INTEGER
)
RETURNS VOID AS $$
BEGIN
  -- Update stock, preventing negative values
  UPDATE products
  SET stock = GREATEST(0, COALESCE(stock, 0) - quantity)
  WHERE id = product_id;

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
  -- Restore stock
  UPDATE products
  SET stock = COALESCE(stock, 0) + quantity
  WHERE id = product_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION decrement_product_stock(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_product_stock(UUID, INTEGER) TO authenticated;

-- Grant execute permissions to service role (for admin operations)
GRANT EXECUTE ON FUNCTION decrement_product_stock(UUID, INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION increment_product_stock(UUID, INTEGER) TO service_role;
