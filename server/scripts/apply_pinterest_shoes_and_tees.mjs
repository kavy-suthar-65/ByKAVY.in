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

if (!fs.existsSync(clientPublicDir)) {
  fs.mkdirSync(clientPublicDir, { recursive: true });
}

// 1. Copy downloaded images to client/public/storage/products
const imagesToSync = [
  'shoe-onitsuka-court.jpg',
  'shoe-feud-addison.jpg',
  'shoe-dover-clog.jpg',
  'shoe-jeffrey-flat.jpg',
  'pin-tee-madewell-vintage-crew.jpg',
  'pin-tee-pacsun-graphic-retro.jpg',
  'pin-tee-madewell-striped-pocket.jpg',
  'pin-tee-pacsun-streetwear-black.jpg',
  'pin-shoe-vans-old-skool.jpg',
  'pin-shoe-vans-sk8-hi.jpg',
  'pin-shoe-vans-checkerboard.jpg',
  'pin-shoe-vans-authentic-blue.jpg'
];

for (const img of imagesToSync) {
  const src = path.join(storageDir, img);
  const dst = path.join(clientPublicDir, img);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dst);
    console.log(`Synced: ${img} to client public`);
  } else {
    console.warn(`Source not found: ${src}`);
  }
}

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

// 2. Prepare statements
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
const insertReview = db.prepare(`
  INSERT INTO reviews (product_id, user_name, rating, comment, is_approved, created_at)
  VALUES (?, ?, ?, ?, 1, ?)
`);

// 3. Define Shoe Products (For Left Section: New Arrivals)
const shoeProducts = [
  {
    title: 'Onitsuka Tiger Vintage Court Sneaker',
    slug: 'onitsuka-tiger-vintage-court-sneaker',
    description: 'Authentic retro court sneaker featuring soft leather construction, iconic contrast stripes, padded collar, and vintage rubber cupsole. Timeless aesthetic designed for all-day comfort.',
    price: 4099,
    compare_at_price: 5499,
    category_id: 7, // Accessories
    collection_id: 3, // Everyday Basics
    image: '/storage/products/shoe-onitsuka-court.jpg',
    tags: 'pinterest,shoes,sneakers,vintage,court,accessories',
    created_at: '2026-11-11 12:30:00',
    sizes: ['EU 38', 'EU 39', 'EU 40', 'EU 41', 'EU 42']
  },
  {
    title: 'Free People Feud Addison Military Leather Boot',
    slug: 'free-people-feud-addison-military-boot',
    description: 'Rugged yet refined vintage combat boot crafted from rich distressed full-grain leather. Features lace-up front closure, inner side zipper for effortless wear, and stacked heel.',
    price: 4199,
    compare_at_price: 5699,
    category_id: 7,
    collection_id: 2, // Winter Essentials
    image: '/storage/products/shoe-feud-addison.jpg',
    tags: 'pinterest,shoes,boots,military,leather,accessories',
    created_at: '2026-11-11 12:29:00',
    sizes: ['EU 36', 'EU 37', 'EU 38', 'EU 39', 'EU 40']
  },
  {
    title: 'Free People Dover Genuine Suede Clog',
    slug: 'free-people-dover-genuine-suede-clog',
    description: 'Artisanal boho slip-on clog crafted from supple suede with wooden contoured footbed and stud accents. Effortless styling with breezy dresses or wide-leg denim.',
    price: 3299,
    compare_at_price: 4399,
    category_id: 7,
    collection_id: 3,
    image: '/storage/products/shoe-dover-clog.jpg',
    tags: 'pinterest,shoes,clogs,suede,boho,accessories',
    created_at: '2026-11-11 12:28:00',
    sizes: ['EU 36', 'EU 37', 'EU 38', 'EU 39', 'EU 40']
  },
  {
    title: 'Jeffrey Campbell Lilianna Leather Loafer Flat',
    slug: 'jeffrey-campbell-lilianna-leather-loafer-flat',
    description: 'Sleek minimalist slip-on loafer flat featuring ultra-soft genuine calfskin leather, cushioned memory foam insole, and flexible rubber sole. Everyday casual elegance.',
    price: 3099,
    compare_at_price: 4199,
    category_id: 7,
    collection_id: 3,
    image: '/storage/products/shoe-jeffrey-flat.jpg',
    tags: 'pinterest,shoes,loafers,flats,leather,accessories',
    created_at: '2026-11-11 12:27:00',
    sizes: ['EU 36', 'EU 37', 'EU 38', 'EU 39', 'EU 40']
  }
];

// 4. Define T-Shirt Products (For Right Section: Best Sellers)
const tshirtProducts = [
  {
    title: 'Madewell Whisper Cotton Vintage Crew Tee',
    slug: 'madewell-whisper-cotton-vintage-crew-tee',
    description: 'Lightweight and breezy organic cotton crewneck tee with a relaxed broken-in silhouette. Garment-dyed for rich vintage color and pre-washed for irresistible softness.',
    price: 1299,
    compare_at_price: 1799,
    category_id: 3, // T-Shirts
    collection_id: 3,
    image: '/storage/products/pin-tee-madewell-vintage-crew.jpg',
    tags: 'pinterest,t-shirts,cotton,crewneck,vintage,bestseller',
    created_at: '2026-11-11 10:00:00',
    sizes: ['S', 'M', 'L', 'XL'],
    reviews: [
      { name: 'Kavya S.', rating: 5, comment: 'Hands down the softest tee I have ever bought. Flattering relaxed drape!' },
      { name: 'Aarav M.', rating: 5, comment: 'Breathable, lightweight, and perfect color tone. Exactly as pictured from Pinterest!' },
      { name: 'Rohan P.', rating: 5, comment: 'Great quality cotton, no shrinkage after multiple washes.' },
      { name: 'Diya N.', rating: 5, comment: 'Minimalist aesthetic perfection. Wearing this on repeat!' }
    ]
  },
  {
    title: 'PacSun Sunset Graphic Oversized Tee',
    slug: 'pacsun-sunset-graphic-oversized-tee',
    description: 'Heavyweight 240 GSM streetwear graphic t-shirt featuring nostalgic retro California sunset artwork. Oversized relaxed drop-shoulder cut with thick ribbed crew collar.',
    price: 1499,
    compare_at_price: 1999,
    category_id: 3,
    collection_id: 1, // Summer 2026
    image: '/storage/products/pin-tee-pacsun-graphic-retro.jpg',
    tags: 'pinterest,t-shirts,graphic,oversized,streetwear,bestseller',
    created_at: '2026-11-11 09:59:00',
    sizes: ['S', 'M', 'L', 'XL'],
    reviews: [
      { name: 'Varun T.', rating: 5, comment: 'Super sick graphic! The oversized fit is spot on and the print quality is top notch.' },
      { name: 'Meera K.', rating: 5, comment: 'Love the streetwear vibes. Pairs amazingly with baggy jeans or cargos.' },
      { name: 'Sameer J.', rating: 5, comment: 'Heavyweight premium fabric. Totally worth every rupee!' },
      { name: 'Ananya B.', rating: 5, comment: 'Got so many compliments. Beautiful retro colors!' }
    ]
  },
  {
    title: 'Madewell Breton Striped Pocket Tee',
    slug: 'madewell-breton-striped-pocket-tee',
    description: 'French nautical-inspired yarn-dyed horizontal stripe t-shirt with single chest pocket. Breathable 100% combed cotton jersey that maintains its crisp structure.',
    price: 1399,
    compare_at_price: 1899,
    category_id: 3,
    collection_id: 3,
    image: '/storage/products/pin-tee-madewell-striped-pocket.jpg',
    tags: 'pinterest,t-shirts,striped,pocket,nautical,bestseller',
    created_at: '2026-11-11 09:58:00',
    sizes: ['S', 'M', 'L', 'XL'],
    reviews: [
      { name: 'Pooja R.', rating: 5, comment: 'Classic French stripes that never go out of style. Super soft combed cotton!' },
      { name: 'Nikhil C.', rating: 5, comment: 'Pocket detail is clean and sturdy. Fits true to size.' },
      { name: 'Tanvi G.', rating: 5, comment: 'Very chic casual look. Highly recommend!' }
    ]
  },
  {
    title: 'PacSun Night Rider Heavyweight Graphic Tee',
    slug: 'pacsun-night-rider-heavyweight-graphic-tee',
    description: 'Aesthetic acid-wash black streetwear t-shirt with custom typography and monochrome motorcycle graphic. Durable twin-needle stitching at hem and cuffs.',
    price: 1599,
    compare_at_price: 2199,
    category_id: 3,
    collection_id: 1,
    image: '/storage/products/pin-tee-pacsun-streetwear-black.jpg',
    tags: 'pinterest,t-shirts,graphic,heavyweight,black,streetwear,bestseller',
    created_at: '2026-11-11 09:57:00',
    sizes: ['S', 'M', 'L', 'XL'],
    reviews: [
      { name: 'Karan D.', rating: 5, comment: 'The acid wash finish looks legendary. Thick collar that holds its shape!' },
      { name: 'Isha V.', rating: 5, comment: 'Perfect boxy streetwear fit. 10/10 purchase.' },
      { name: 'Aditya S.', rating: 5, comment: 'Looks like authentic Pinterest streetwear. Very impressed.' }
    ]
  }
];

function upsertItem(p, isFeatured = 0) {
  const existing = findProductBySlug.get(p.slug);
  let productId;

  if (existing) {
    productId = existing.id;
    console.log(`Updating existing product [${productId}] ${p.title}`);
    db.prepare(`
      UPDATE products SET
        title = ?,
        description = ?,
        price = ?,
        compare_at_price = ?,
        category_id = ?,
        collection_id = ?,
        is_featured = ?,
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
      isFeatured,
      p.tags,
      p.created_at,
      productId
    );
  } else {
    const sku = 'KP-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    const result = db.prepare(`
      INSERT INTO products (
        title, slug, description, price, compare_at_price, category_id, collection_id,
        sku, stock, low_stock_threshold, is_featured, is_active, tags, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 45, 5, ?, 1, ?, ?)
    `).run(
      p.title,
      p.slug,
      p.description,
      p.price,
      p.compare_at_price,
      p.category_id,
      p.collection_id,
      sku,
      isFeatured,
      p.tags,
      p.created_at
    );
    productId = result.lastInsertRowid;
    console.log(`Created new product [${productId}] ${p.title}`);
  }

  // Set EXCLUSIVE image for this product — ZERO cross-contamination!
  deleteImagesForProduct.run(productId);
  insertImage.run(productId, p.image, p.title, 0, 1);

  // Set variants
  deleteVariantsForProduct.run(productId);
  p.sizes.forEach((sz, idx) => {
    const vsku = `KP-${productId}-${sz}`;
    insertVariant.run(productId, 'Size', 'size', sz, 10, vsku);
  });

  // Reviews if specified
  if (p.reviews && p.reviews.length > 0) {
    // Clear old reviews for this product
    db.prepare('DELETE FROM reviews WHERE product_id = ?').run(productId);
    for (const r of p.reviews) {
      insertReview.run(productId, r.name, r.rating, r.comment, p.created_at);
    }
  }

  return productId;
}

console.log('\n=== Adding / Updating Shoes Products (New Arrivals) ===');
for (const p of shoeProducts) {
  upsertItem(p, 0);
}

console.log('\n=== Adding / Updating T-Shirts Products (Best Sellers) ===');
for (const p of tshirtProducts) {
  upsertItem(p, 1); // is_featured = 1
}

// Clean up: Make sure existing products 1, 2, 3, 4 have fewer reviews than our best seller T-shirts
// (Product 1 and 3 had 2 reviews, which is less than our 4-5 reviews each, so our tees naturally top the list!)

console.log('\n=== Verification ===');
const newArrivals = db.prepare(`
  SELECT p.id, p.title, c.name as category,
         (SELECT url FROM product_images WHERE product_id = p.id AND is_primary = 1) as img,
         (SELECT url FROM product_images WHERE product_id = p.id AND is_primary = 0) as sec_img
  FROM products p
  LEFT JOIN categories c ON p.category_id = c.id
  WHERE p.is_active = 1
  ORDER BY p.created_at DESC
  LIMIT 4
`).all();
console.log('NEW ARRIVALS (Left Section):');
console.log(JSON.stringify(newArrivals, null, 2));

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
console.log('\nBEST SELLERS (Right Section):');
console.log(JSON.stringify(bestSellers, null, 2));

db.close();
console.log('\nDone successfully!');

