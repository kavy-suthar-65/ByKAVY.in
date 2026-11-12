import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

const dbPath = path.join(projectRoot, 'database', 'shop.db');
const storageDir = path.join(projectRoot, 'storage', 'products');
const clientPublicDir = path.join(projectRoot, 'client', 'public', 'storage', 'products');

// 1. Copy images to client public directory
const featuredImages = [
  'featured-everlane-storm-jacket.jpg',
  'featured-reformation-silk-dress.jpg',
  'featured-catalan-oversized-shirt.jpg',
  'featured-fp-sherpa-fleece.jpg'
];

for (const img of featuredImages) {
  const src = path.join(storageDir, img);
  const dst = path.join(clientPublicDir, img);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dst);
    console.log(`Copied ${img} to client public`);
  }
}

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

// 2. Turn off is_featured on the T-shirts so they don't appear in Featured Collection
db.prepare(`
  UPDATE products SET is_featured = 0 WHERE slug IN (
    'madewell-whisper-cotton-vintage-crew-tee',
    'pacsun-sunset-graphic-oversized-tee',
    'madewell-breton-striped-pocket-tee',
    'pacsun-night-rider-heavyweight-graphic-tee'
  )
`).run();

// Also turn off is_featured on old products so only the 4 curated Featured products are returned
db.prepare('UPDATE products SET is_featured = 0 WHERE is_featured = 1').run();

// 3. Define the 4 Featured Collection products
const featuredProducts = [
  {
    title: 'Everlane ReNew Weatherproof Storm Jacket',
    slug: 'everlane-renew-weatherproof-storm-jacket',
    description: 'Technical minimalist outerwear engineered from 100% recycled high-density polyester with sealed seams and storm flap. Modern architectural silhouette designed for trans-seasonal layering.',
    price: 3899,
    compare_at_price: 5199,
    category_id: 8, // Outerwear
    collection_id: 2, // Winter Essentials
    image: '/storage/products/featured-everlane-storm-jacket.jpg',
    tags: 'pinterest,featured,outerwear,jacket,minimalist,sustainable',
    created_at: '2026-11-11 12:00:00',
    sizes: ['S', 'M', 'L', 'XL']
  },
  {
    title: 'Reformation Kourtney Backless Silk Dress',
    slug: 'reformation-kourtney-backless-silk-dress',
    description: 'Breathtaking midi dress featuring a romantic sweetheart neckline, delicate smocked back bodice, and graceful thigh-high slit. Tailored from lightweight sustainable modal-viscose drape.',
    price: 3499,
    compare_at_price: 4699,
    category_id: 6, // Dresses
    collection_id: 1, // Summer 2026
    image: '/storage/products/featured-reformation-silk-dress.jpg',
    tags: 'pinterest,featured,dresses,silk,cocktail,reformation',
    created_at: '2026-11-11 11:59:00',
    sizes: ['XS', 'S', 'M', 'L']
  },
  {
    title: 'David Catalan Oversized Structured Poplin Shirt',
    slug: 'david-catalan-oversized-structured-poplin-shirt',
    description: 'Runway-inspired oversized tailored button-down crafted from crisp 100% Italian cotton poplin. Features dropped shoulder seams, exaggerated French cuffs, and curved shirttail hem.',
    price: 2499,
    compare_at_price: 3299,
    category_id: 4, // Shirts
    collection_id: 3, // Everyday Basics
    image: '/storage/products/featured-catalan-oversized-shirt.jpg',
    tags: 'pinterest,featured,shirts,poplin,oversized,designer',
    created_at: '2026-11-11 11:58:00',
    sizes: ['S', 'M', 'L', 'XL']
  },
  {
    title: 'FP Movement Hit The Slopes Sherpa Fleece Jacket',
    slug: 'fp-movement-hit-the-slopes-sherpa-fleece-jacket',
    description: 'Ultra-plush textured fleece jacket with snap-button front, contrast woven nylon zippered pockets, and elasticated trim. Warm, effortless, and endlessly versatile.',
    price: 3999,
    compare_at_price: 5499,
    category_id: 8, // Outerwear
    collection_id: 2, // Winter Essentials
    image: '/storage/products/featured-fp-sherpa-fleece.jpg',
    tags: 'pinterest,featured,outerwear,fleece,sherpa,cozy',
    created_at: '2026-11-11 11:57:00',
    sizes: ['XS', 'S', 'M', 'L']
  }
];

const findProductBySlug = db.prepare('SELECT id FROM products WHERE slug = ?');
const deleteImagesForProduct = db.prepare('DELETE FROM product_images WHERE product_id = ?');
const insertImage = db.prepare(`
  INSERT INTO product_images (product_id, url, alt_text, position, is_primary)
  VALUES (?, ?, ?, ?, ?)
`);
const deleteVariantsForProduct = db.prepare('DELETE FROM product_variants WHERE product_id = ?');
const insertVariant = db.prepare(`
  INSERT INTO product_variants (product_id, name, type, value, stock, price_modifier, sku)
  VALUES (?, ?, ?, ?, ?, 0, ?)
`);

for (const p of featuredProducts) {
  const existing = findProductBySlug.get(p.slug);
  let productId;

  if (existing) {
    productId = existing.id;
    console.log(`Updating featured product [${productId}] ${p.title}`);
    db.prepare(`
      UPDATE products SET
        title = ?,
        description = ?,
        price = ?,
        compare_at_price = ?,
        category_id = ?,
        collection_id = ?,
        is_featured = 1,
        is_active = 1,
        tags = ?,
        created_at = ?
      WHERE id = ?
    `).run(
      p.title,
      p.description,
      p.price,
      p.compare_at_price,
      p.category_id,
      p.collection_id,
      p.tags,
      p.created_at,
      productId
    );
  } else {
    const sku = 'KP-FEAT-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    const res = db.prepare(`
      INSERT INTO products (
        title, slug, description, price, compare_at_price, category_id, collection_id,
        sku, stock, low_stock_threshold, is_featured, is_active, tags, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 40, 5, 1, 1, ?, ?)
    `).run(
      p.title,
      p.slug,
      p.description,
      p.price,
      p.compare_at_price,
      p.category_id,
      p.collection_id,
      sku,
      p.tags,
      p.created_at
    );
    productId = res.lastInsertRowid;
    console.log(`Created featured product [${productId}] ${p.title}`);
  }

  deleteImagesForProduct.run(productId);
  insertImage.run(productId, p.image, p.title, 0, 1);

  deleteVariantsForProduct.run(productId);
  p.sizes.forEach((sz) => {
    insertVariant.run(productId, 'Size', 'size', sz, 10, `KP-${productId}-${sz}`);
  });
}

// Ensure Shoe products have newest timestamps so they stay top in New Arrivals
db.prepare(`UPDATE products SET created_at = '2026-11-11 14:00:00' WHERE slug = 'onitsuka-tiger-vintage-court-sneaker'`).run();
db.prepare(`UPDATE products SET created_at = '2026-11-11 13:59:00' WHERE slug = 'free-people-feud-addison-military-boot'`).run();
db.prepare(`UPDATE products SET created_at = '2026-11-11 13:58:00' WHERE slug = 'free-people-dover-genuine-suede-clog'`).run();
db.prepare(`UPDATE products SET created_at = '2026-11-11 13:57:00' WHERE slug = 'jeffrey-campbell-lilianna-leather-loafer-flat'`).run();

console.log('\n================ VERIFICATION ================');

console.log('\n--- 1. FEATURED COLLECTION ---');
const featured = db.prepare(`
  SELECT p.id, p.title, c.name as category,
         (SELECT url FROM product_images WHERE product_id = p.id AND is_primary = 1) as img
  FROM products p
  LEFT JOIN categories c ON p.category_id = c.id
  WHERE p.is_active = 1 AND p.is_featured = 1
  ORDER BY p.created_at DESC
  LIMIT 4
`).all();
console.log(JSON.stringify(featured, null, 2));

console.log('\n--- 2. NEW ARRIVALS (Shoes) ---');
const newArrivals = db.prepare(`
  SELECT p.id, p.title, c.name as category,
         (SELECT url FROM product_images WHERE product_id = p.id AND is_primary = 1) as img
  FROM products p
  LEFT JOIN categories c ON p.category_id = c.id
  WHERE p.is_active = 1
  ORDER BY p.created_at DESC
  LIMIT 4
`).all();
console.log(JSON.stringify(newArrivals, null, 2));

console.log('\n--- 3. BEST SELLERS (T-Shirts) ---');
const bestSellers = db.prepare(`
  SELECT p.id, p.title, c.name as category,
         (SELECT url FROM product_images WHERE product_id = p.id AND is_primary = 1) as img,
         (SELECT COUNT(*) FROM reviews WHERE product_id = p.id AND is_approved = 1) as review_count
  FROM products p
  LEFT JOIN categories c ON p.category_id = c.id
  WHERE p.is_active = 1
  ORDER BY (SELECT COUNT(*) FROM reviews WHERE product_id = p.id AND is_approved = 1) DESC, p.is_featured DESC
  LIMIT 4
`).all();
console.log(JSON.stringify(bestSellers, null, 2));

db.close();
console.log('\nAll 3 sections updated with completely separate, unique Pinterest photos!');

