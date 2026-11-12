/**
 * add_extra_photos.js  (ESM version)
 * 
 * For each product that has fewer than 5 images, fetch additional
 * Pinterest photos (by category) and add them to SQLite + local storage.
 */

import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── Paths ───────────────────────────────────────────────────────────────────
const DB_PATH = path.resolve(__dirname, '../../database/shop.db');
const STORAGE_DIR = path.resolve(__dirname, '../../storage/products');
const PUBLIC_STORAGE_DIR = path.resolve(__dirname, '../../client/public/storage/products');

// ─── Category → Pinterest RSS board mapping ──────────────────────────────────
const CATEGORY_BOARDS = {
  1: ['pacsun/mens', 'gymshark/mens'],
  2: ['everlane/womens-apparel', 'freepeople/tops'],
  3: ['pacsun/graphic-tees', 'pacsun/mens'],
  4: ['freepeople/tops', 'everlane/womens-apparel'],
  5: ['hollister/jeans', 'pacsun/mens'],
  6: ['reformation/dresses', 'freepeople/dresses'],
  7: ['freepeople/accessories', 'freepeople/shoes'],
  8: ['freepeople/fp-movement', 'gymshark/mens'],
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    const req = mod.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      timeout: 15000,
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchUrl(res.headers.location).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    const req = mod.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      timeout: 20000,
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadFile(res.headers.location, destPath).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode}`));
      }
      const file = fs.createWriteStream(destPath);
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(destPath); });
      file.on('error', (err) => { try { fs.unlinkSync(destPath); } catch {} reject(err); });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('download timeout')); });
  });
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function extractPinUrls(xml) {
  const urls = [];
  const imgRegex = /src="(https:\/\/i\.pinimg\.com\/[^"]+\.(?:jpg|jpeg|png|webp))"/gi;
  let m;
  while ((m = imgRegex.exec(xml)) !== null) {
    const url = m[1].replace('/236x/', '/736x/').replace('/474x/', '/736x/');
    if (!urls.includes(url)) urls.push(url);
  }
  return urls;
}

async function fetchBoardImages(boardPath) {
  const rssUrl = `https://www.pinterest.com/${boardPath}.rss`;
  console.log(`  Fetching RSS: ${rssUrl}`);
  try {
    const res = await fetchUrl(rssUrl);
    if (res.status !== 200) {
      console.log(`  RSS returned ${res.status}, skipping`);
      return [];
    }
    const urls = extractPinUrls(res.body);
    console.log(`  Found ${urls.length} images from ${boardPath}`);
    return urls;
  } catch (err) {
    console.log(`  Error fetching ${boardPath}: ${err.message}`);
    return [];
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const Database = require('better-sqlite3');
  const db = new Database(DB_PATH);

  fs.mkdirSync(STORAGE_DIR, { recursive: true });
  fs.mkdirSync(PUBLIC_STORAGE_DIR, { recursive: true });

  const products = db.prepare(`
    SELECT p.id, p.title, p.slug, p.category_id,
           COUNT(pi.id) as image_count
    FROM products p
    LEFT JOIN product_images pi ON pi.product_id = p.id
    WHERE p.is_active = 1
    GROUP BY p.id
    ORDER BY p.id
  `).all();

  console.log(`\nTotal active products: ${products.length}`);
  const needsMore = products.filter(p => p.image_count < 5);
  console.log(`Products needing extra images (< 5): ${needsMore.length}\n`);

  if (needsMore.length === 0) {
    console.log('All products already have 5+ images!');
    db.close();
    return;
  }

  // Build image pool per category
  const categoryImagePool = {};
  const allCategoryIds = [...new Set(needsMore.map(p => p.category_id).filter(Boolean))];

  for (const catId of allCategoryIds) {
    const boards = CATEGORY_BOARDS[catId] || CATEGORY_BOARDS[2];
    categoryImagePool[catId] = [];
    for (const board of boards) {
      await sleep(600);
      const urls = await fetchBoardImages(board);
      categoryImagePool[catId].push(...urls);
    }
    console.log(`Category ${catId}: ${categoryImagePool[catId].length} images in pool\n`);
  }

  const existingImages = db.prepare('SELECT url FROM product_images').all().map(r => r.url);
  const usedUrls = new Set(existingImages);
  const poolPointer = {};

  let addedCount = 0;
  let failedCount = 0;

  for (const product of needsMore) {
    const catId = product.category_id || 2;
    const pool = categoryImagePool[catId] || [];
    if (!poolPointer[catId]) poolPointer[catId] = 0;

    const needed = 5 - product.image_count;
    console.log(`\nProduct #${product.id}: "${product.title.substring(0, 50)}" — needs ${needed} more image(s)`);

    let nextPosition = product.image_count;

    for (let i = 0; i < needed; i++) {
      // Find next unused pool URL
      let url = null;
      let attempts = 0;
      while (attempts < pool.length * 2) {
        const idx = poolPointer[catId] % pool.length;
        const candidate = pool[idx];
        poolPointer[catId]++;
        if (candidate && !usedUrls.has(candidate)) {
          url = candidate;
          usedUrls.add(url);
          break;
        }
        attempts++;
      }

      if (!url) {
        console.log(`  ⚠ No more unique images for category ${catId}`);
        break;
      }

      const ext = '.jpg';
      const filename = `prod_${String(product.id).padStart(4, '0')}_extra_${nextPosition}${ext}`;
      const destPath = path.join(STORAGE_DIR, filename);
      const publicDestPath = path.join(PUBLIC_STORAGE_DIR, filename);
      const localUrl = `/storage/products/${filename}`;

      try {
        await sleep(250);
        await downloadFile(url, destPath);
        fs.copyFileSync(destPath, publicDestPath);

        db.prepare(`
          INSERT INTO product_images (product_id, url, alt_text, position, is_primary)
          VALUES (?, ?, ?, ?, 0)
        `).run(product.id, localUrl, `${product.title} - View ${nextPosition + 1}`, nextPosition);

        console.log(`  ✓ Added image ${nextPosition + 1}: ${filename}`);
        addedCount++;
        nextPosition++;
      } catch (err) {
        console.log(`  ✗ Failed: ${err.message}`);
        failedCount++;
      }
    }
  }

  db.close();

  console.log(`\n${'='.repeat(55)}`);
  console.log(`Done! Added ${addedCount} images (${failedCount} failed).`);
  console.log(`${'='.repeat(55)}\n`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
