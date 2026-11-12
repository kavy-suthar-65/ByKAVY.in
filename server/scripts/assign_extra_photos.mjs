/**
 * assign_extra_photos.mjs
 * 
 * Assigns 4 extra images to each product that has fewer than 5 images.
 * Uses already-downloaded local images by cross-assigning within the same category.
 * No network requests needed — all images are already on disk.
 */

import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.resolve(__dirname, '../../database/shop.db');

const db = new Database(DB_PATH);

// Get all active products with image count
const products = db.prepare(`
  SELECT p.id, p.title, p.category_id,
         COUNT(pi.id) as image_count
  FROM products p
  LEFT JOIN product_images pi ON pi.product_id = p.id
  WHERE p.is_active = 1
  GROUP BY p.id
  ORDER BY p.category_id, p.id
`).all();

console.log(`\nTotal products: ${products.length}`);
const needsMore = products.filter(p => p.image_count < 5);
console.log(`Products needing more images: ${needsMore.length}`);

if (needsMore.length === 0) {
  console.log('All products already have 5+ images!');
  db.close();
  process.exit(0);
}

// Build a pool of all local images, grouped by category
const categoryPools = {};

for (const p of products) {
  const catId = p.category_id || 2;
  if (!categoryPools[catId]) categoryPools[catId] = [];
  
  const imgs = db.prepare(`
    SELECT url FROM product_images 
    WHERE product_id = ? 
    ORDER BY is_primary DESC, position ASC
  `).all(p.id);
  
  imgs.forEach(img => {
    categoryPools[catId].push({ fromProductId: p.id, url: img.url });
  });
}

// Also build a global fallback pool
const globalPool = db.prepare(`
  SELECT url FROM product_images 
  WHERE url LIKE '/storage/products/%'
  ORDER BY RANDOM()
`).all().map(r => r.url);

console.log('\nCategory pools:');
for (const [cat, imgs] of Object.entries(categoryPools)) {
  console.log(`  Cat ${cat}: ${imgs.length} images`);
}
console.log(`  Global pool: ${globalPool.length} images`);

// Round-robin pointers per category
const catPointers = {};

let totalAdded = 0;

const insertImg = db.prepare(`
  INSERT INTO product_images (product_id, url, alt_text, position, is_primary)
  VALUES (?, ?, ?, ?, 0)
`);

for (const product of needsMore) {
  const catId = product.category_id || 2;
  const pool = categoryPools[catId] || [];
  if (!catPointers[catId]) catPointers[catId] = 0;

  const needed = 5 - product.image_count;
  let nextPos = product.image_count;

  // Track URLs already assigned to this product
  const ownUrls = new Set(
    db.prepare('SELECT url FROM product_images WHERE product_id = ?')
      .all(product.id).map(r => r.url)
  );

  const shortTitle = product.title.substring(0, 45);
  process.stdout.write(`Product #${product.id} (${shortTitle}): `);

  for (let i = 0; i < needed; i++) {
    let chosenUrl = null;

    // Try category pool first (cross-product assignment)
    for (let attempt = 0; attempt < pool.length * 2; attempt++) {
      const entry = pool[catPointers[catId] % pool.length];
      catPointers[catId]++;
      if (entry && entry.fromProductId !== product.id && !ownUrls.has(entry.url)) {
        chosenUrl = entry.url;
        break;
      }
    }

    // Fallback: global pool
    if (!chosenUrl) {
      for (const url of globalPool) {
        if (!ownUrls.has(url)) {
          chosenUrl = url;
          break;
        }
      }
    }

    if (!chosenUrl) {
      process.stdout.write(`⚠(no img) `);
      continue;
    }

    insertImg.run(
      product.id,
      chosenUrl,
      `${product.title} - View ${nextPos + 1}`,
      nextPos
    );
    ownUrls.add(chosenUrl);
    process.stdout.write(`✓ `);
    totalAdded++;
    nextPos++;
  }
  console.log(`(had ${product.image_count}, now ${nextPos})`);
}

db.close();

console.log(`\n${'='.repeat(60)}`);
console.log(`Done! Added ${totalAdded} image records.`);
console.log(`${'='.repeat(60)}`);

