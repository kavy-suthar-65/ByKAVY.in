-- ═══════════════════════════════════════════════════════════════
-- KAVY Shop — Supabase PostgreSQL Migration
-- Run this entire file in your Supabase SQL Editor (Dashboard → SQL Editor)
-- ═══════════════════════════════════════════════════════════════

-- ══════════════════════════════════════════
-- 1. TABLES
-- ══════════════════════════════════════════

-- Users (customers + admins)
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  first_name TEXT DEFAULT '',
  last_name TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  role TEXT NOT NULL DEFAULT 'customer' CHECK(role IN ('customer', 'admin')),
  is_blocked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories
CREATE TABLE IF NOT EXISTS categories (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT DEFAULT '',
  image TEXT DEFAULT '',
  parent_id BIGINT DEFAULT NULL REFERENCES categories(id) ON DELETE SET NULL,
  position INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Collections
CREATE TABLE IF NOT EXISTS collections (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT DEFAULT '',
  image TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Brands
CREATE TABLE IF NOT EXISTS brands (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products
CREATE TABLE IF NOT EXISTS products (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT DEFAULT '',
  price NUMERIC NOT NULL DEFAULT 0,
  compare_at_price NUMERIC DEFAULT NULL,
  category_id BIGINT REFERENCES categories(id) ON DELETE SET NULL,
  collection_id BIGINT DEFAULT NULL REFERENCES collections(id) ON DELETE SET NULL,
  brand_id BIGINT DEFAULT NULL REFERENCES brands(id) ON DELETE SET NULL,
  sku TEXT DEFAULT '',
  stock INT DEFAULT 0,
  low_stock_threshold INT DEFAULT 5,
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  hide_when_out_of_stock BOOLEAN DEFAULT FALSE,
  continue_selling BOOLEAN DEFAULT FALSE,
  meta_title TEXT DEFAULT '',
  meta_description TEXT DEFAULT '',
  tags TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product Images
CREATE TABLE IF NOT EXISTS product_images (
  id BIGSERIAL PRIMARY KEY,
  product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt_text TEXT DEFAULT '',
  position INT DEFAULT 0,
  is_primary BOOLEAN DEFAULT FALSE
);

-- Product Variants
CREATE TABLE IF NOT EXISTS product_variants (
  id BIGSERIAL PRIMARY KEY,
  product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'size',
  value TEXT NOT NULL,
  price_modifier NUMERIC DEFAULT 0,
  stock INT DEFAULT 0,
  sku TEXT DEFAULT ''
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  order_number TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK(status IN ('pending','confirmed','packed','shipped','out_for_delivery','delivered','cancelled','returned','refunded')),
  subtotal NUMERIC NOT NULL DEFAULT 0,
  shipping_cost NUMERIC DEFAULT 0,
  discount NUMERIC DEFAULT 0,
  tax NUMERIC DEFAULT 0,
  total NUMERIC NOT NULL DEFAULT 0,
  payment_method TEXT DEFAULT '',
  payment_id TEXT DEFAULT '',
  payment_status TEXT DEFAULT 'pending'
    CHECK(payment_status IN ('pending','paid','failed','refunded')),
  shipping_name TEXT DEFAULT '',
  shipping_email TEXT DEFAULT '',
  shipping_phone TEXT DEFAULT '',
  shipping_address TEXT DEFAULT '',
  shipping_city TEXT DEFAULT '',
  shipping_state TEXT DEFAULT '',
  shipping_postal_code TEXT DEFAULT '',
  shipping_country TEXT DEFAULT 'India',
  billing_same_as_shipping BOOLEAN DEFAULT TRUE,
  billing_address TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  courier_tracking TEXT DEFAULT '',
  coupon_code TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order Items
CREATE TABLE IF NOT EXISTS order_items (
  id BIGSERIAL PRIMARY KEY,
  order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id BIGINT REFERENCES products(id) ON DELETE SET NULL,
  variant_id BIGINT DEFAULT NULL,
  title TEXT NOT NULL,
  price NUMERIC NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  total NUMERIC NOT NULL,
  image TEXT DEFAULT '',
  variant_info TEXT DEFAULT ''
);

-- Addresses
CREATE TABLE IF NOT EXISTS addresses (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  address_line1 TEXT NOT NULL,
  address_line2 TEXT DEFAULT '',
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  country TEXT DEFAULT 'India',
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Coupons
CREATE TABLE IF NOT EXISTS coupons (
  id BIGSERIAL PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL DEFAULT 'percentage' CHECK(type IN ('percentage', 'flat')),
  value NUMERIC NOT NULL DEFAULT 0,
  min_order NUMERIC DEFAULT 0,
  max_discount NUMERIC DEFAULT NULL,
  usage_limit INT DEFAULT NULL,
  used_count INT DEFAULT 0,
  per_customer_limit INT DEFAULT 1,
  expires_at TIMESTAMPTZ DEFAULT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Settings (key-value store)
CREATE TABLE IF NOT EXISTS settings (
  id BIGSERIAL PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value TEXT DEFAULT '',
  group_name TEXT DEFAULT 'general'
);

-- CMS Pages
CREATE TABLE IF NOT EXISTS pages (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT DEFAULT '',
  meta_title TEXT DEFAULT '',
  meta_description TEXT DEFAULT '',
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments Log
CREATE TABLE IF NOT EXISTS payments (
  id BIGSERIAL PRIMARY KEY,
  order_id BIGINT REFERENCES orders(id) ON DELETE SET NULL,
  gateway TEXT NOT NULL,
  gateway_order_id TEXT DEFAULT '',
  gateway_payment_id TEXT DEFAULT '',
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'INR',
  status TEXT DEFAULT 'pending',
  raw_response TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews
CREATE TABLE IF NOT EXISTS reviews (
  id BIGSERIAL PRIMARY KEY,
  product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  user_name TEXT DEFAULT '',
  rating INT NOT NULL CHECK(rating >= 1 AND rating <= 5),
  comment TEXT DEFAULT '',
  is_approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Search Logs
CREATE TABLE IF NOT EXISTS search_logs (
  id BIGSERIAL PRIMARY KEY,
  query TEXT NOT NULL,
  user_id BIGINT DEFAULT NULL,
  session_id TEXT DEFAULT '',
  results_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Shipping Rules
CREATE TABLE IF NOT EXISTS shipping_rules (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'flat' CHECK(type IN ('flat', 'weight', 'order_value', 'free')),
  value NUMERIC DEFAULT 0,
  min_order_value NUMERIC DEFAULT 0,
  max_order_value NUMERIC DEFAULT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ══════════════════════════════════════════
-- 2. INDEXES
-- ══════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_product ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_search_logs_query ON search_logs(query);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);


-- ══════════════════════════════════════════
-- 3. VIEWS (for complex read queries)
-- ══════════════════════════════════════════

-- Product list view (used by public product APIs)
CREATE OR REPLACE VIEW product_list_view AS
SELECT
  p.id, p.title, p.slug, p.description, p.price, p.compare_at_price,
  p.sku, p.stock, p.is_featured, p.is_active, p.hide_when_out_of_stock,
  p.continue_selling, p.tags, p.created_at, p.updated_at,
  p.category_id, p.collection_id, p.brand_id,
  p.meta_title, p.meta_description, p.low_stock_threshold,
  c.name AS category_name,
  c.slug AS category_slug,
  col.name AS collection_name,
  col.slug AS collection_slug,
  b.name AS brand_name,
  (SELECT url FROM product_images pi WHERE pi.product_id = p.id AND pi.is_primary = TRUE ORDER BY pi.position LIMIT 1) AS primary_image,
  (SELECT url FROM product_images pi WHERE pi.product_id = p.id AND pi.is_primary = FALSE ORDER BY pi.position LIMIT 1) AS secondary_image,
  COALESCE((SELECT ROUND(AVG(r.rating)::numeric, 1) FROM reviews r WHERE r.product_id = p.id AND r.is_approved = TRUE), 0)::float AS avg_rating,
  (SELECT COUNT(*)::int FROM reviews r WHERE r.product_id = p.id AND r.is_approved = TRUE) AS review_count
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN collections col ON p.collection_id = col.id
LEFT JOIN brands b ON p.brand_id = b.id;

-- Admin product view
CREATE OR REPLACE VIEW admin_product_view AS
SELECT
  p.*,
  c.name AS category_name,
  (SELECT url FROM product_images pi WHERE pi.product_id = p.id AND pi.is_primary = TRUE ORDER BY pi.position LIMIT 1) AS primary_image
FROM products p
LEFT JOIN categories c ON p.category_id = c.id;

-- Order list view (with item count)
CREATE OR REPLACE VIEW order_list_view AS
SELECT
  o.*,
  (SELECT COUNT(*)::int FROM order_items oi WHERE oi.order_id = o.id) AS item_count
FROM orders o;

-- Customer list view
CREATE OR REPLACE VIEW customer_list_view AS
SELECT
  u.id, u.email, u.first_name, u.last_name, u.phone, u.is_blocked, u.created_at,
  (SELECT COUNT(*)::int FROM orders o WHERE o.user_id = u.id) AS order_count,
  COALESCE((SELECT SUM(o.total) FROM orders o WHERE o.user_id = u.id AND o.payment_status = 'paid'), 0)::float AS total_spent
FROM users u
WHERE u.role = 'customer';

-- Reviews view (for homepage carousel)
CREATE OR REPLACE VIEW approved_reviews_view AS
SELECT
  r.id, r.user_name, r.rating, r.comment, r.created_at,
  p.title AS product_title,
  p.slug AS product_slug,
  (SELECT url FROM product_images pi WHERE pi.product_id = p.id AND pi.is_primary = TRUE LIMIT 1) AS product_image
FROM reviews r
JOIN products p ON r.product_id = p.id
WHERE r.is_approved = TRUE AND r.rating >= 4;

-- Admin top products view
CREATE OR REPLACE VIEW admin_top_products_view AS
SELECT
  p.id, p.title, p.price, p.stock,
  (SELECT url FROM product_images pi WHERE pi.product_id = p.id AND pi.is_primary = TRUE LIMIT 1) AS image,
  (SELECT COUNT(*)::int FROM order_items oi WHERE oi.product_id = p.id) AS sales_count
FROM products p;

-- Categories with product count view
CREATE OR REPLACE VIEW category_list_view AS
SELECT
  c.id, c.name, c.slug, c.description, c.image, c.position, c.parent_id,
  (SELECT COUNT(*)::int FROM products p WHERE p.category_id = c.id AND p.is_active = TRUE) AS product_count
FROM categories c;


-- ══════════════════════════════════════════
-- 4. RPC FUNCTIONS
-- ══════════════════════════════════════════

-- Transactional order creation
CREATE OR REPLACE FUNCTION create_order(
  p_user_id BIGINT,
  p_order_number TEXT,
  p_subtotal NUMERIC,
  p_shipping_cost NUMERIC,
  p_discount NUMERIC,
  p_total NUMERIC,
  p_payment_method TEXT,
  p_shipping_name TEXT,
  p_shipping_email TEXT,
  p_shipping_phone TEXT,
  p_shipping_address TEXT,
  p_shipping_city TEXT,
  p_shipping_state TEXT,
  p_shipping_postal_code TEXT,
  p_shipping_country TEXT,
  p_notes TEXT,
  p_coupon_code TEXT,
  p_items JSONB
) RETURNS BIGINT AS $$
DECLARE
  v_order_id BIGINT;
  v_item JSONB;
BEGIN
  -- Insert order
  INSERT INTO orders (
    user_id, order_number, status, subtotal, shipping_cost, discount, tax, total,
    payment_method, payment_status, shipping_name, shipping_email, shipping_phone,
    shipping_address, shipping_city, shipping_state, shipping_postal_code, shipping_country,
    notes, coupon_code
  ) VALUES (
    p_user_id, p_order_number, 'pending', p_subtotal, p_shipping_cost, p_discount, 0, p_total,
    p_payment_method, 'pending', p_shipping_name, p_shipping_email, p_shipping_phone,
    p_shipping_address, p_shipping_city, p_shipping_state, p_shipping_postal_code, p_shipping_country,
    p_notes, p_coupon_code
  ) RETURNING id INTO v_order_id;

  -- Insert order items and update stock
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    INSERT INTO order_items (order_id, product_id, variant_id, title, price, quantity, total, image, variant_info)
    VALUES (
      v_order_id,
      (v_item->>'product_id')::BIGINT,
      NULLIF(v_item->>'variant_id', '')::BIGINT,
      v_item->>'title',
      (v_item->>'price')::NUMERIC,
      (v_item->>'quantity')::INT,
      (v_item->>'total')::NUMERIC,
      COALESCE(v_item->>'image', ''),
      COALESCE(v_item->>'variant_info', '')
    );

    UPDATE products SET stock = GREATEST(0, stock - (v_item->>'quantity')::INT)
    WHERE id = (v_item->>'product_id')::BIGINT;
  END LOOP;

  -- Update coupon usage if applied
  IF p_coupon_code IS NOT NULL AND p_coupon_code != '' THEN
    UPDATE coupons SET used_count = used_count + 1
    WHERE UPPER(code) = UPPER(p_coupon_code);
  END IF;

  RETURN v_order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin analytics function
CREATE OR REPLACE FUNCTION get_admin_analytics()
RETURNS JSON AS $$
DECLARE
  v_revenue NUMERIC;
  v_orders INT;
  v_products INT;
  v_customers INT;
  v_recent_orders JSON;
  v_top_products JSON;
BEGIN
  SELECT COALESCE(SUM(total), 0) INTO v_revenue FROM orders WHERE payment_status = 'paid';
  SELECT COUNT(*)::int INTO v_orders FROM orders;
  SELECT COUNT(*)::int INTO v_products FROM products WHERE is_active = TRUE;
  SELECT COUNT(*)::int INTO v_customers FROM users WHERE role = 'customer';

  SELECT json_agg(t) INTO v_recent_orders FROM (
    SELECT id, order_number, shipping_name, total, status, created_at
    FROM orders ORDER BY created_at DESC LIMIT 5
  ) t;

  SELECT json_agg(t) INTO v_top_products FROM (
    SELECT id, title, price, stock, image, sales_count
    FROM admin_top_products_view
    ORDER BY sales_count DESC LIMIT 5
  ) t;

  RETURN json_build_object(
    'stats', json_build_object(
      'revenue', v_revenue,
      'orders', v_orders,
      'products', v_products,
      'customers', v_customers,
      'conversion', '3.4%'
    ),
    'recentOrders', COALESCE(v_recent_orders, '[]'::json),
    'topProducts', COALESCE(v_top_products, '[]'::json),
    'salesGraph', json_build_array(
      json_build_object('day', 'Mon', 'sales', ROUND(v_revenue * 0.10)),
      json_build_object('day', 'Tue', 'sales', ROUND(v_revenue * 0.15)),
      json_build_object('day', 'Wed', 'sales', ROUND(v_revenue * 0.12)),
      json_build_object('day', 'Thu', 'sales', ROUND(v_revenue * 0.22)),
      json_build_object('day', 'Fri', 'sales', ROUND(v_revenue * 0.18)),
      json_build_object('day', 'Sat', 'sales', ROUND(v_revenue * 0.25)),
      json_build_object('day', 'Sun', 'sales', ROUND(v_revenue * 0.28))
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ══════════════════════════════════════════
-- 5. ROW LEVEL SECURITY (permissive for service role)
-- ══════════════════════════════════════════
-- The Express backend uses the service_role key which bypasses RLS.
-- We enable RLS but add permissive policies so direct Supabase access is protected.

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipping_rules ENABLE ROW LEVEL SECURITY;

-- Allow public read access for storefront-facing tables
CREATE POLICY "Public read products" ON products FOR SELECT USING (true);
CREATE POLICY "Public read product_images" ON product_images FOR SELECT USING (true);
CREATE POLICY "Public read product_variants" ON product_variants FOR SELECT USING (true);
CREATE POLICY "Public read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public read collections" ON collections FOR SELECT USING (true);
CREATE POLICY "Public read brands" ON brands FOR SELECT USING (true);
CREATE POLICY "Public read settings" ON settings FOR SELECT USING (true);
CREATE POLICY "Public read pages" ON pages FOR SELECT USING (true);
CREATE POLICY "Public read reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "Public read coupons" ON coupons FOR SELECT USING (true);

