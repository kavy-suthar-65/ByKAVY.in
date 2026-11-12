// check_images.mjs
import Database from 'better-sqlite3';
const db = new Database('database/shop.db');

const local = db.prepare("SELECT COUNT(*) as n FROM product_images WHERE url LIKE '/storage/%'").get();
const remote = db.prepare("SELECT COUNT(*) as n FROM product_images WHERE url LIKE 'http%'").get();
console.log('Local images:', local.n);
console.log('Remote images:', remote.n);

const cats = db.prepare(`
  SELECT p.category_id, COUNT(pi.id) as n 
  FROM product_images pi 
  JOIN products p ON p.id=pi.product_id 
  WHERE p.is_active=1 
  GROUP BY p.category_id
`).all();
cats.forEach(c => console.log(`Cat ${c.category_id}: ${c.n} images`));

const sample = db.prepare("SELECT url FROM product_images LIMIT 5").all();
console.log('\nSample URLs:');
sample.forEach(s => console.log(' ', s.url.substring(0, 80)));

db.close();

