import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..', '..');

const dbPath = path.join(projectRoot, 'database', 'shop.db');
const storageProductsDir = path.join(projectRoot, 'storage', 'products');
const clientPublicStorageDir = path.join(projectRoot, 'client', 'public', 'storage', 'products');
const fallbackProductsPath = path.join(projectRoot, 'client', 'src', 'utils', 'fallbackProducts.json');

// Ensure target directories exist
if (!fs.existsSync(storageProductsDir)) {
  fs.mkdirSync(storageProductsDir, { recursive: true });
}
if (!fs.existsSync(clientPublicStorageDir)) {
  fs.mkdirSync(clientPublicStorageDir, { recursive: true });
}

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

// HTTP fetch helper
function fetchText(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    }).on('error', reject);
  });
}

// Image download helper
function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        res.resume();
        return downloadFile(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        res.resume();
        return reject(new Error(`HTTP ${res.statusCode}`));
      }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\-_]+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

// Clean HTML entities & tags
function decodeEntities(str) {
  return (str || '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/<[^>]+>/g, '')
    .trim();
}

// Configured Pinterest boards mapped to target categories
const BOARD_CONFIG = [
  {
    board: 'freepeople/dresses',
    categoryId: 6,
    categoryName: 'Dresses',
    categorySlug: 'dresses',
    collectionId: 1, // Summer 2026
    defaultPriceRange: [2499, 4499],
    tagPrefix: 'pinterest,dresses,boho,summer,freepeople',
    sizeType: 'clothing'
  },
  {
    board: 'reformation/dresses',
    categoryId: 6,
    categoryName: 'Dresses',
    categorySlug: 'dresses',
    collectionId: 1,
    defaultPriceRange: [2999, 4999],
    tagPrefix: 'pinterest,dresses,sustainable,cocktail,reformation',
    sizeType: 'clothing'
  },
  {
    board: 'freepeople/tops',
    categoryId: 4,
    categoryName: 'Shirts',
    categorySlug: 'shirts',
    collectionId: 3, // Everyday Basics
    defaultPriceRange: [1499, 2799],
    tagPrefix: 'pinterest,shirts,blouse,tops,cotton',
    sizeType: 'clothing'
  },
  {
    board: 'everlane/womens-apparel',
    categoryId: 2,
    categoryName: 'Women',
    categorySlug: 'women',
    collectionId: 3,
    defaultPriceRange: [1899, 3499],
    tagPrefix: 'pinterest,women,everlane,minimalist,casual',
    sizeType: 'clothing'
  },
  {
    board: 'hollister/jeans',
    categoryId: 5,
    categoryName: 'Jeans',
    categorySlug: 'jeans',
    collectionId: 3,
    defaultPriceRange: [2199, 3799],
    tagPrefix: 'pinterest,jeans,denim,vintage,hollister',
    sizeType: 'jeans'
  },
  {
    board: 'pacsun/mens',
    categoryId: 1,
    categoryName: 'Men',
    categorySlug: 'men',
    collectionId: 3,
    defaultPriceRange: [1599, 3299],
    tagPrefix: 'pinterest,men,streetwear,pacsun,casual',
    sizeType: 'clothing'
  },
  {
    board: 'pacsun/graphic-tees',
    categoryId: 3,
    categoryName: 'T-Shirts',
    categorySlug: 't-shirts',
    collectionId: 1,
    defaultPriceRange: [999, 1799],
    tagPrefix: 'pinterest,t-shirts,graphic tee,oversized,streetwear',
    sizeType: 'clothing'
  },
  {
    board: 'gymshark/mens',
    categoryId: 8,
    categoryName: 'Outerwear',
    categorySlug: 'outerwear',
    collectionId: 2, // Winter Essentials
    defaultPriceRange: [2799, 4599],
    tagPrefix: 'pinterest,outerwear,jacket,athletic,gymshark',
    sizeType: 'clothing'
  },
  {
    board: 'freepeople/fp-movement',
    categoryId: 8,
    categoryName: 'Outerwear',
    categorySlug: 'outerwear',
    collectionId: 2,
    defaultPriceRange: [2999, 4999],
    tagPrefix: 'pinterest,outerwear,fleece,puffer,fp movement',
    sizeType: 'clothing'
  },
  {
    board: 'freepeople/accessories',
    categoryId: 7,
    categoryName: 'Accessories',
    categorySlug: 'accessories',
    collectionId: 3,
    defaultPriceRange: [799, 2199],
    tagPrefix: 'pinterest,accessories,jewelry,leather,style',
    sizeType: 'onesize'
  },
  {
    board: 'freepeople/shoes',
    categoryId: 7,
    categoryName: 'Accessories',
    categorySlug: 'accessories',
    collectionId: 3,
    defaultPriceRange: [2499, 4899],
    tagPrefix: 'pinterest,shoes,footwear,boots,sneakers',
    sizeType: 'shoes'
  }
];

// Rich description templates according to category
const DESCRIPTION_TEMPLATES = {
  6: [ // Dresses
    "A stunning Pinterest-curated silhouette featuring a breathable lightweight weave, delicate drape, and effortless styling. Designed with romantic tiering, subtle gathers, and fine seam finishing suitable for weekend brunches, evening soirées, and seaside holidays. 100% premium rayon-linen blend. Machine wash gentle on cold, lay flat to dry.",
    "Breezy, romantic, and endlessly versatile. This dress offers an effortless relaxed fit with a flattering neckline and subtle flutter details. Crafted from soft, breathable modal blend that moves gracefully with every step. Perfect for sun-drenched afternoons and warm-weather vacations. Dry clean or hand wash cold.",
    "The quintessential slip dress inspired by effortless 90s minimalism. Featuring a bias-cut drape that gently grazes curves, adjustable spaghetti straps, and a clean mid-calf hemline. Pair with sneakers for casual daytime wear or elevate with strappy heels for after-hours elegance. 100% sustainable EcoVero viscose."
  ],
  4: [ // Shirts
    "An effortless modern blouse crafted with crisp, breathable organic cotton poplin. Features dropped shoulders, a classic point collar, chest pocket, and relaxed tailored cuffs. Style it buttoned up with wide-leg trousers or unbuttoned over a ribbed tank top for layered perfection. Machine wash cold, tumble dry low.",
    "Timeless tailoring meets effortless relaxation. Featuring mother-of-pearl buttons, a curved shirttail hem, and a light enzyme wash for that lived-in softness from day one. Premium breathable linen-cotton weave that gets softer with every wash.",
    "The perfect everyday button-down shirt with a slightly oversized silhouette. Expertly sewn with French seams and durable stitching for lasting wear. Ideal for tucking into denim or wearing open as an airy light layer."
  ],
  2: [ // Women
    "Chic and contemporary essential designed for the modern capsule wardrobe. Features clean lines, premium woven fabric with subtle stretch for comfort, and precision seam details. Easy to dress up with tailored blazers or keep casual with denim. Machine washable.",
    "A refined feminine staple with an emphasis on craftsmanship and effortless drape. Blended with sustainably sourced fibres for all-day comfort and breathable wear from morning coffee to dinner dates.",
    "Elevated simplicity at its finest. Thoughtfully tailored with a flattering silhouette, premium handfeel, and understated modern elegance that transitions seamlessly across seasons."
  ],
  5: [ // Jeans
    "Authentic vintage-inspired denim featuring a classic high-rise waist, straight-leg cut, and five-pocket styling. Crafted from 99% heavy-ounce cotton with 1% elastane for just the right amount of comfortable stretch without losing structure. Finished with antique copper hardware and reinforced bar-tacks.",
    "Relaxed wide-leg denim silhouette inspired by iconic 90s streetwear. Features authentic fading, whiskering details along the hips, and a raw-edge hem that breaks nicely over sneakers. Made with sustainably washed cotton denim.",
    "The perfect everyday slim-straight jeans with a flattering contoured waistband that prevents gaping. Premium stretch denim maintains its shape from morning to night. Machine wash inside out with dark colors."
  ],
  1: [ // Men
    "Everyday essential crafted with premium heavyweight cotton. Built for daily comfort with clean stitching, relaxed shoulders, and durable ribbed collar. Designed to pair seamlessly with cargos, shorts, or classic denim.",
    "A versatile streetwear staple featuring durable construction and an effortless boxy fit. Garment-dyed for rich color depth and a broken-in vintage feel. Features reinforced seam taping along shoulders.",
    "Classic casual menswear piece with modern proportions. Combines clean minimalism with functional durability. Machine wash cold with like colors."
  ],
  3: [ // T-Shirts
    "Heavyweight 240 GSM organic cotton graphic tee featuring custom retro artwork inspired by vintage Americana. Screen-printed with water-based inks that soften naturally over time. Pre-shrunk boxy cut with drop shoulders and a thick 1-inch ribbed collar.",
    "The ultimate oversized aesthetic graphic t-shirt. Crafted from 100% combed ringspun cotton with a vintage mineral wash. Finished with blind stitching at cuffs and hem for authentic vintage appeal.",
    "Relaxed fit aesthetic tee with subtle distressed edge detailing. Exceptionally soft handfeel that gets better with every cycle in the wash. Perfect for pairing with baggy denim or layered under a flannel."
  ],
  8: [ // Outerwear
    "Designed for warmth, movement, and sleek aesthetics. Features weather-resistant micro-ripstop shell with thermal insulation, zippered side pockets, and storm cuffs. Perfect for chilly morning commutes and outdoor layering.",
    "Plush fleece sherpa jacket featuring high-pile thermal warmth, contrast nylon binding, full front zip, and zippered chest pocket. Cozy and functional outerwear that completes any cold-weather aesthetic.",
    "Modern oversized bomber jacket crafted with a water-repellent shell, ribbed collar and cuffs, and diamond-quilted thermal lining. An iconic outerwear piece designed to elevate everyday streetwear."
  ],
  7: [ // Accessories
    "Handcrafted with genuine full-grain leather and antique brass hardware. Designed with thoughtful compartments to keep your essentials organized in timeless style. Ages beautifully with natural patina.",
    "Minimalist everyday accessory designed to complete any outfit. Features premium materials, durable construction, and understated aesthetic detailing suitable for any casual or elevated look.",
    "Classic contemporary footwear featuring cushioned insoles, durable non-slip rubber outsoles, and premium uppers. Built for all-day comfort without sacrificing timeless aesthetic appeal."
  ]
};

async function main() {
  console.log('✦ Starting Pinterest Real Products Import...');

  // Track existing slugs to avoid collisions
  const existingSlugs = new Set(
    db.prepare('SELECT slug FROM products').all().map(r => r.slug)
  );

  const fallbackList = fs.existsSync(fallbackProductsPath)
    ? JSON.parse(fs.readFileSync(fallbackProductsPath, 'utf-8'))
    : [];

  const upsertProduct = db.prepare(`
    INSERT INTO products (
      title, slug, description, price, compare_at_price, category_id, collection_id,
      sku, stock, low_stock_threshold, is_featured, is_active, tags
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
  `);

  const insertImage = db.prepare(`
    INSERT INTO product_images (product_id, url, alt_text, position, is_primary)
    VALUES (?, ?, ?, ?, ?)
  `);

  const insertVariant = db.prepare(`
    INSERT INTO product_variants (product_id, name, type, value, stock, price_modifier, sku)
    VALUES (?, ?, ?, ?, ?, 0, ?)
  `);

  let totalAdded = 0;
  let productIdCounter = 200; // start custom IDs for fallback

  for (const config of BOARD_CONFIG) {
    console.log(`\n→ Fetching board: ${config.board} (Target: ${config.categoryName})...`);
    let xml = '';
    try {
      const res = await fetchText(`https://www.pinterest.com/${config.board}.rss`);
      if (res.status !== 200 || !res.data) {
        console.warn(`  Failed to fetch board ${config.board}: Status ${res.status}`);
        continue;
      }
      xml = res.data;
    } catch (e) {
      console.error(`  Network error fetching ${config.board}: ${e.message}`);
      continue;
    }

    const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)];
    console.log(`  Found ${items.length} pins in board`);

    // Limit to 6-8 per board so we get a diverse, curated selection of ~60-70 total products
    const limitPerBoard = (config.categorySlug === 'dresses' || config.categorySlug === 'outerwear' || config.categorySlug === 'men') ? 7 : 6;
    let addedFromBoard = 0;

    for (const itemMatch of items) {
      if (addedFromBoard >= limitPerBoard) break;

      const itemContent = itemMatch[1];
      const titleMatch = itemContent.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/) || itemContent.match(/<title>([\s\S]*?)<\/title>/);
      const descMatch = itemContent.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/) || itemContent.match(/<description>([\s\S]*?)<\/description>/);
      const linkMatch = itemContent.match(/<link>([\s\S]*?)<\/link>/);

      const rawTitle = decodeEntities(titleMatch ? titleMatch[1] : '');
      const rawDesc = descMatch ? descMatch[1] : '';

      // Extract image URL: look for i.pinimg.com/...
      const imgMatch = rawDesc.match(/https:\/\/i\.pinimg\.com\/(?:236x|474x|564x|736x)\/([a-f0-9\/]+\.(?:jpg|png|webp))/);
      if (!imgMatch) continue;

      const imageHashPath = imgMatch[1];
      // Build 736x high resolution URL
      const highResUrl = `https://i.pinimg.com/736x/${imageHashPath}`;

      // Clean title
      let cleanTitle = rawTitle.replace(/\s+/g, ' ').trim();
      // Remove generic filler text like "See more", "Pin by", etc.
      if (!cleanTitle || cleanTitle.length < 5 || cleanTitle.toLowerCase().includes('pinterest')) {
        cleanTitle = `${config.categoryName.replace(/s$/, '')} Aesthetic Style`;
      }
      // Capitalize properly
      cleanTitle = cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1);

      // Create unique slug
      let baseSlug = slugify(cleanTitle);
      if (!baseSlug) baseSlug = `pin-${config.categorySlug}-${Date.now()}`;
      let slug = baseSlug;
      let counter = 1;
      while (existingSlugs.has(slug)) {
        slug = `${baseSlug}-${counter++}`;
      }
      existingSlugs.add(slug);

      // Unique file name
      const ext = path.extname(imageHashPath) || '.jpg';
      const safeHash = imageHashPath.replace(/[\/\\]/g, '-').replace(/\.[^.]+$/, '');
      const localFileName = `pin-${config.categorySlug}-${safeHash}${ext}`;
      const localDestPath = path.join(storageProductsDir, localFileName);
      const publicDestPath = path.join(clientPublicStorageDir, localFileName);

      // Download image
      console.log(`    Downloading: ${cleanTitle.slice(0, 40)}...`);
      try {
        if (!fs.existsSync(localDestPath)) {
          await downloadFile(highResUrl, localDestPath);
        }
        // Copy to client public folder as well
        fs.copyFileSync(localDestPath, publicDestPath);
      } catch (err) {
        console.warn(`    Failed to download image ${highResUrl}: ${err.message}`);
        continue;
      }

      const localImageUrl = `/storage/products/${localFileName}`;

      // Pick rich description
      const descList = DESCRIPTION_TEMPLATES[config.categoryId] || DESCRIPTION_TEMPLATES[2];
      const descIndex = addedFromBoard % descList.length;
      const productDescription = descList[descIndex];

      // Calculate price
      const minP = config.defaultPriceRange[0];
      const maxP = config.defaultPriceRange[1];
      const rawPrice = Math.floor(minP + Math.random() * (maxP - minP));
      // Round to 99 ending
      const price = Math.round(rawPrice / 100) * 100 - 1;
      const compare_at_price = Math.round((price * 1.35) / 100) * 100 - 1;

      // Unique SKU
      const sku = `PIN-${config.categorySlug.toUpperCase().slice(0, 3)}-${String(100 + totalAdded).padStart(3, '0')}`;
      const stock = Math.floor(40 + Math.random() * 80);
      const isFeatured = addedFromBoard % 2 === 0 ? 1 : 0;
      const tags = `${config.tagPrefix},real,pinterest,fashion,aesthetic,2026`;

      // Insert into SQLite database
      const result = upsertProduct.run(
        cleanTitle,
        slug,
        productDescription,
        price,
        compare_at_price,
        config.categoryId,
        config.collectionId,
        sku,
        stock,
        5,
        isFeatured,
        tags
      );
      const dbProductId = result.lastInsertRowid;

      // Insert primary product image
      insertImage.run(dbProductId, localImageUrl, cleanTitle, 0, 1);

      // Generate variants
      const variantsData = [];
      if (config.sizeType === 'clothing') {
        const sizes = ['XS', 'S', 'M', 'L', 'XL'];
        sizes.forEach((sz, sIdx) => {
          const vStock = Math.floor(stock / sizes.length);
          insertVariant.run(dbProductId, 'Size', 'size', sz, vStock, `${sku}-${sz}`);
          variantsData.push({
            id: sIdx + 1,
            name: 'Size',
            type: 'size',
            value: sz,
            stock: vStock,
            price_modifier: 0
          });
        });
      } else if (config.sizeType === 'jeans') {
        const waistSizes = ['28', '30', '32', '34', '36'];
        waistSizes.forEach((wz, wIdx) => {
          const vStock = Math.floor(stock / waistSizes.length);
          insertVariant.run(dbProductId, 'Waist Size', 'size', wz, vStock, `${sku}-W${wz}`);
          variantsData.push({
            id: wIdx + 1,
            name: 'Waist Size',
            type: 'size',
            value: wz,
            stock: vStock,
            price_modifier: 0
          });
        });
      } else if (config.sizeType === 'shoes') {
        const shoeSizes = ['UK 6', 'UK 7', 'UK 8', 'UK 9', 'UK 10'];
        shoeSizes.forEach((sz, sIdx) => {
          const vStock = Math.floor(stock / shoeSizes.length);
          insertVariant.run(dbProductId, 'Shoe Size', 'size', sz, vStock, `${sku}-S${sz}`);
          variantsData.push({
            id: sIdx + 1,
            name: 'Shoe Size',
            type: 'size',
            value: sz,
            stock: vStock,
            price_modifier: 0
          });
        });
      } else {
        insertVariant.run(dbProductId, 'One Size', 'size', 'Free Size', stock, `${sku}-OS`);
        variantsData.push({
          id: 1,
          name: 'Size',
          type: 'size',
          value: 'Free Size',
          stock: stock,
          price_modifier: 0
        });
      }

      // Prepare fallback JSON entry
      productIdCounter++;
      const fallbackEntry = {
        id: productIdCounter,
        title: cleanTitle,
        slug: slug,
        description: productDescription,
        price: price,
        compare_at_price: compare_at_price,
        category_id: config.categoryId,
        category_name: config.categoryName,
        category_slug: config.categorySlug,
        collection_id: config.collectionId,
        collection_name: config.collectionId === 1 ? 'Summer 2026' : (config.collectionId === 2 ? 'Winter Essentials' : 'Everyday Basics'),
        collection_slug: config.collectionId === 1 ? 'summer-2026' : (config.collectionId === 2 ? 'winter-essentials' : 'everyday-basics'),
        sku: sku,
        stock: stock,
        is_featured: isFeatured,
        is_active: 1,
        tags: tags,
        primary_image: localImageUrl,
        secondary_image: localImageUrl,
        avg_rating: Number((4.3 + Math.random() * 0.6).toFixed(1)),
        review_count: Math.floor(18 + Math.random() * 120),
        images: [
          {
            id: 1,
            url: localImageUrl,
            alt_text: cleanTitle,
            is_primary: true
          }
        ],
        variants: variantsData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      fallbackList.push(fallbackEntry);
      addedFromBoard++;
      totalAdded++;
      console.log(`    [✓] Added #${totalAdded}: "${cleanTitle}" (₹${price})`);
    }
  }

  // Save updated fallbackProducts.json
  fs.writeFileSync(fallbackProductsPath, JSON.stringify(fallbackList, null, 2), 'utf-8');
  console.log(`\nUpdated ${fallbackProductsPath} with ${fallbackList.length} total products.`);

  // Final database counts
  const finalCount = db.prepare('SELECT count(*) as count FROM products').get();
  const imageCount = db.prepare('SELECT count(*) as count FROM product_images').get();
  const variantCount = db.prepare('SELECT count(*) as count FROM product_variants').get();

  console.log('\n===========================================');
  console.log(`🎉 SUCCESS! Added ${totalAdded} real Pinterest products!`);
  console.log(`📊 SQLite Database Totals:`);
  console.log(`   - Total Products: ${finalCount.count}`);
  console.log(`   - Total Product Images: ${imageCount.count}`);
  console.log(`   - Total Product Variants: ${variantCount.count}`);
  console.log(`📁 Local Storage Directory: ${storageProductsDir}`);
  console.log(`📁 Client Public Directory: ${clientPublicStorageDir}`);
  console.log('===========================================\n');
}

main().catch(err => {
  console.error('Fatal error during import:', err);
  process.exit(1);
});

