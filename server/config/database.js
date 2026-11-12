import bcrypt from 'bcrypt';
import { supabase } from './supabase.js';

/**
 * Seeds the Supabase database with initial data.
 * Only runs if the users table is empty.
 * Call this once after running the SQL migration.
 */
export async function seedDatabase() {
  try {
    // Check if data already exists
    const { count } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    if (count > 0) {
      console.log('  → Database already has data, skipping seed.');
      return;
    }

    console.log('  → Seeding Supabase database with initial data...');

    // ── Admin User ──────────────────────────────
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@kavy.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'ChangeMe@123';
    const adminHash = await bcrypt.hash(adminPassword, 12);

    await supabase.from('users').insert({
      email: adminEmail,
      password_hash: adminHash,
      first_name: 'Admin',
      last_name: 'User',
      role: 'admin',
    });

    // ── Categories ──────────────────────────────
    const categories = [
      { name: 'Men', slug: 'men', description: 'Premium menswear collection', image: '/storage/products/cat-men.jpg', position: 1 },
      { name: 'Women', slug: 'women', description: 'Elegant womenswear collection', image: '/storage/products/cat-women.jpg', position: 2 },
      { name: 'T-Shirts', slug: 't-shirts', description: 'Casual & graphic tees', image: '/storage/products/cat-tshirts.jpg', position: 3 },
      { name: 'Shirts', slug: 'shirts', description: 'Formal & casual shirts', image: '/storage/products/cat-shirts.jpg', position: 4 },
      { name: 'Jeans', slug: 'jeans', description: 'Denim & jeans collection', image: '/storage/products/cat-jeans.jpg', position: 5 },
      { name: 'Dresses', slug: 'dresses', description: 'Stunning dresses for every occasion', image: '/storage/products/cat-dresses.jpg', position: 6 },
      { name: 'Accessories', slug: 'accessories', description: 'Complete your look', image: '/storage/products/cat-accessories.jpg', position: 7 },
      { name: 'Outerwear', slug: 'outerwear', description: 'Jackets, coats & more', image: '/storage/products/cat-outerwear.jpg', position: 8 },
    ];

    const { data: insertedCategories } = await supabase.from('categories').insert(categories).select('id, slug');
    const catMap = {};
    for (const c of insertedCategories) catMap[c.slug] = c.id;

    // ── Collections ──────────────────────────────
    const collections = [
      { name: 'Summer 2026', slug: 'summer-2026', description: 'Our latest summer collection' },
      { name: 'Winter Essentials', slug: 'winter-essentials', description: 'Stay warm in style' },
      { name: 'Everyday Basics', slug: 'everyday-basics', description: 'Wardrobe staples for every day' },
    ];

    const { data: insertedCollections } = await supabase.from('collections').insert(collections).select('id, slug');
    const colMap = {};
    for (const c of insertedCollections) colMap[c.slug] = c.id;

    // ── Products ──────────────────────────────
    const products = [
      {
        title: 'Essential Cotton Crew Tee', slug: 'essential-cotton-crew-tee',
        description: 'Crafted from 100% premium organic cotton, this crew neck tee offers unmatched softness and a relaxed fit.',
        price: 1299, compare_at_price: 1799, category_id: catMap['t-shirts'], collection_id: colMap['everyday-basics'],
        sku: 'TEE-001', stock: 150, is_featured: true, tags: 'cotton,casual,everyday,bestseller',
        images: [
          { url: '/storage/products/tee-crew-front.jpg', alt_text: 'White cotton crew tee front', position: 0, is_primary: true },
          { url: '/storage/products/tee-crew-back.jpg', alt_text: 'White cotton crew tee back', position: 1, is_primary: false },
        ],
        variants: [{ name: 'S', type: 'size', value: 'S', stock: 30 }, { name: 'M', type: 'size', value: 'M', stock: 40 }, { name: 'L', type: 'size', value: 'L', stock: 40 }, { name: 'XL', type: 'size', value: 'XL', stock: 25 }, { name: 'XXL', type: 'size', value: 'XXL', stock: 15 }],
      },
      {
        title: 'Midnight Black Slim Jeans', slug: 'midnight-black-slim-jeans',
        description: 'Slim-fit jeans in deep midnight black feature premium stretch denim.',
        price: 2499, compare_at_price: 3299, category_id: catMap['jeans'], collection_id: colMap['everyday-basics'],
        sku: 'JNS-001', stock: 85, is_featured: true, tags: 'denim,slim-fit,black,bestseller',
        images: [
          { url: '/storage/products/jeans-black-front.jpg', alt_text: 'Black slim jeans', position: 0, is_primary: true },
          { url: '/storage/products/jeans-black-detail.jpg', alt_text: 'Black slim jeans detail', position: 1, is_primary: false },
        ],
        variants: [{ name: '28', type: 'size', value: '28', stock: 15 }, { name: '30', type: 'size', value: '30', stock: 20 }, { name: '32', type: 'size', value: '32', stock: 20 }, { name: '34', type: 'size', value: '34', stock: 15 }, { name: '36', type: 'size', value: '36', stock: 15 }],
      },
      {
        title: 'Oxford Button-Down Shirt', slug: 'oxford-button-down-shirt',
        description: 'A timeless oxford cloth button-down in crisp white.',
        price: 1999, compare_at_price: null, category_id: catMap['shirts'], collection_id: colMap['everyday-basics'],
        sku: 'SHT-001', stock: 70, is_featured: true, tags: 'formal,oxford,white,classic',
        images: [
          { url: '/storage/products/shirt-oxford-front.jpg', alt_text: 'White oxford shirt', position: 0, is_primary: true },
          { url: '/storage/products/shirt-oxford-detail.jpg', alt_text: 'White oxford shirt collar detail', position: 1, is_primary: false },
        ],
        variants: [{ name: 'S', type: 'size', value: 'S', stock: 15 }, { name: 'M', type: 'size', value: 'M', stock: 20 }, { name: 'L', type: 'size', value: 'L', stock: 20 }, { name: 'XL', type: 'size', value: 'XL', stock: 10 }, { name: 'XXL', type: 'size', value: 'XXL', stock: 5 }],
      },
      {
        title: 'Relaxed Linen Dress', slug: 'relaxed-linen-dress',
        description: 'Effortlessly elegant, this relaxed-fit linen dress is your go-to for warm-weather style.',
        price: 3499, compare_at_price: 4299, category_id: catMap['dresses'], collection_id: colMap['summer-2026'],
        sku: 'DRS-001', stock: 45, is_featured: true, tags: 'linen,summer,dress,elegant',
        images: [
          { url: '/storage/products/dress-linen-front.jpg', alt_text: 'Linen dress', position: 0, is_primary: true },
          { url: '/storage/products/dress-linen-side.jpg', alt_text: 'Linen dress side view', position: 1, is_primary: false },
        ],
        variants: [{ name: 'XS', type: 'size', value: 'XS', stock: 8 }, { name: 'S', type: 'size', value: 'S', stock: 12 }, { name: 'M', type: 'size', value: 'M', stock: 12 }, { name: 'L', type: 'size', value: 'L', stock: 8 }, { name: 'XL', type: 'size', value: 'XL', stock: 5 }],
      },
      {
        title: 'Oversized Graphic Tee — Wave', slug: 'oversized-graphic-tee-wave',
        description: 'Make a statement with our oversized graphic tee featuring an original wave print.',
        price: 1599, compare_at_price: 2199, category_id: catMap['t-shirts'], collection_id: colMap['summer-2026'],
        sku: 'TEE-002', stock: 100, is_featured: false, tags: 'graphic,oversized,streetwear,summer',
        images: [
          { url: '/storage/products/tee-graphic-front.jpg', alt_text: 'Oversized graphic tee', position: 0, is_primary: true },
          { url: '/storage/products/tee-graphic-back.jpg', alt_text: 'Graphic tee back view', position: 1, is_primary: false },
        ],
        variants: [{ name: 'M', type: 'size', value: 'M', stock: 25 }, { name: 'L', type: 'size', value: 'L', stock: 35 }, { name: 'XL', type: 'size', value: 'XL', stock: 25 }, { name: 'XXL', type: 'size', value: 'XXL', stock: 15 }],
      },
      {
        title: 'Tailored Chino Trousers', slug: 'tailored-chino-trousers',
        description: 'Versatile tailored chinos in a refined slim-tapered fit.',
        price: 2199, compare_at_price: 2799, category_id: catMap['jeans'], collection_id: colMap['everyday-basics'],
        sku: 'CHN-001', stock: 60, is_featured: false, tags: 'chino,tailored,smart-casual',
        images: [
          { url: '/storage/products/chino-front.jpg', alt_text: 'Tailored chinos', position: 0, is_primary: true },
          { url: '/storage/products/chino-detail.jpg', alt_text: 'Chinos detail', position: 1, is_primary: false },
        ],
        variants: [{ name: '28', type: 'size', value: '28', stock: 10 }, { name: '30', type: 'size', value: '30', stock: 15 }, { name: '32', type: 'size', value: '32', stock: 15 }, { name: '34', type: 'size', value: '34', stock: 10 }, { name: '36', type: 'size', value: '36', stock: 10 }],
      },
      {
        title: 'Quilted Bomber Jacket', slug: 'quilted-bomber-jacket',
        description: 'A modern take on the classic bomber. Features diamond quilting and satin-finish shell.',
        price: 4999, compare_at_price: 6499, category_id: catMap['outerwear'], collection_id: colMap['winter-essentials'],
        sku: 'JKT-001', stock: 30, is_featured: true, tags: 'bomber,jacket,winter,premium',
        images: [
          { url: '/storage/products/jacket-bomber-front.jpg', alt_text: 'Quilted bomber jacket', position: 0, is_primary: true },
          { url: '/storage/products/jacket-bomber-back.jpg', alt_text: 'Bomber jacket back', position: 1, is_primary: false },
        ],
        variants: [{ name: 'S', type: 'size', value: 'S', stock: 5 }, { name: 'M', type: 'size', value: 'M', stock: 10 }, { name: 'L', type: 'size', value: 'L', stock: 8 }, { name: 'XL', type: 'size', value: 'XL', stock: 5 }, { name: 'XXL', type: 'size', value: 'XXL', stock: 2 }],
      },
      {
        title: 'Classic Leather Watch', slug: 'classic-leather-watch',
        description: 'Minimalist analog watch with a genuine leather strap.',
        price: 3999, compare_at_price: 5499, category_id: catMap['accessories'], collection_id: null,
        sku: 'ACC-001', stock: 25, is_featured: false, tags: 'watch,leather,accessory,minimal',
        images: [
          { url: '/storage/products/watch-leather-front.jpg', alt_text: 'Leather watch', position: 0, is_primary: true },
          { url: '/storage/products/watch-leather-detail.jpg', alt_text: 'Watch detail', position: 1, is_primary: false },
        ],
        variants: [],
      },
      {
        title: 'Floral Wrap Blouse', slug: 'floral-wrap-blouse',
        description: 'A romantic floral print on lightweight viscose fabric.',
        price: 1799, compare_at_price: null, category_id: catMap['shirts'], collection_id: colMap['summer-2026'],
        sku: 'BLS-001', stock: 55, is_featured: false, tags: 'floral,blouse,women,summer',
        images: [
          { url: '/storage/products/blouse-floral-front.jpg', alt_text: 'Floral wrap blouse', position: 0, is_primary: true },
          { url: '/storage/products/blouse-floral-style.jpg', alt_text: 'Blouse styling', position: 1, is_primary: false },
        ],
        variants: [{ name: 'XS', type: 'size', value: 'XS', stock: 10 }, { name: 'S', type: 'size', value: 'S', stock: 15 }, { name: 'M', type: 'size', value: 'M', stock: 15 }, { name: 'L', type: 'size', value: 'L', stock: 10 }, { name: 'XL', type: 'size', value: 'XL', stock: 5 }],
      },
      {
        title: 'Minimal Canvas Sneakers', slug: 'minimal-canvas-sneakers',
        description: 'Clean, minimal canvas sneakers in off-white.',
        price: 2799, compare_at_price: 3499, category_id: catMap['accessories'], collection_id: colMap['everyday-basics'],
        sku: 'ACC-002', stock: 40, is_featured: true, tags: 'sneakers,minimal,canvas,everyday',
        images: [
          { url: '/storage/products/sneakers-canvas-front.jpg', alt_text: 'Canvas sneakers', position: 0, is_primary: true },
          { url: '/storage/products/sneakers-canvas-side.jpg', alt_text: 'Sneakers side view', position: 1, is_primary: false },
        ],
        variants: [{ name: '7', type: 'size', value: '7', stock: 5 }, { name: '8', type: 'size', value: '8', stock: 8 }, { name: '9', type: 'size', value: '9', stock: 10 }, { name: '10', type: 'size', value: '10', stock: 10 }, { name: '11', type: 'size', value: '11', stock: 5 }, { name: '12', type: 'size', value: '12', stock: 2 }],
      },
      {
        title: 'Merino Wool Pullover', slug: 'merino-wool-pullover',
        description: 'Ultra-fine merino wool pullover in charcoal grey.',
        price: 3299, compare_at_price: 4199, category_id: catMap['outerwear'], collection_id: colMap['winter-essentials'],
        sku: 'KNT-001', stock: 35, is_featured: false, tags: 'merino,wool,winter,premium',
        images: [
          { url: '/storage/products/pullover-merino-front.jpg', alt_text: 'Merino pullover', position: 0, is_primary: true },
          { url: '/storage/products/pullover-merino-detail.jpg', alt_text: 'Pullover texture', position: 1, is_primary: false },
        ],
        variants: [{ name: 'S', type: 'size', value: 'S', stock: 7 }, { name: 'M', type: 'size', value: 'M', stock: 10 }, { name: 'L', type: 'size', value: 'L', stock: 10 }, { name: 'XL', type: 'size', value: 'XL', stock: 5 }, { name: 'XXL', type: 'size', value: 'XXL', stock: 3 }],
      },
      {
        title: 'High-Rise Wide Leg Trousers', slug: 'high-rise-wide-leg-trousers',
        description: 'Elevated wide-leg trousers with a high-rise waist.',
        price: 2699, compare_at_price: null, category_id: catMap['jeans'], collection_id: colMap['summer-2026'],
        sku: 'TRS-001', stock: 40, is_featured: false, tags: 'wide-leg,trousers,women,elegant',
        images: [
          { url: '/storage/products/trousers-wide-front.jpg', alt_text: 'Wide leg trousers', position: 0, is_primary: true },
          { url: '/storage/products/trousers-wide-style.jpg', alt_text: 'Trousers styling', position: 1, is_primary: false },
        ],
        variants: [{ name: 'XS', type: 'size', value: 'XS', stock: 6 }, { name: 'S', type: 'size', value: 'S', stock: 10 }, { name: 'M', type: 'size', value: 'M', stock: 12 }, { name: 'L', type: 'size', value: 'L', stock: 8 }, { name: 'XL', type: 'size', value: 'XL', stock: 4 }],
      },
    ];

    for (const p of products) {
      const { images, variants, ...productData } = p;

      const { data: inserted, error: insertError } = await supabase
        .from('products')
        .insert(productData)
        .select('id')
        .single();

      if (insertError) {
        console.error(`  ✖ Failed to insert product "${p.title}":`, insertError.message);
        continue;
      }

      const productId = inserted.id;

      if (images.length > 0) {
        const imageRows = images.map(img => ({ ...img, product_id: productId }));
        await supabase.from('product_images').insert(imageRows);
      }

      if (variants.length > 0) {
        const variantRows = variants.map(v => ({ ...v, product_id: productId }));
        await supabase.from('product_variants').insert(variantRows);
      }
    }

    // ── Default Settings ──────────────────────────
    const defaultSettings = [
      { key: 'site_name', value: 'KAVY', group_name: 'general' },
      { key: 'site_subtitle', value: 'Premium Clothing', group_name: 'general' },
      { key: 'contact_email', value: 'contact@example.com', group_name: 'general' },
      { key: 'contact_phone', value: '+1 555 000 0000', group_name: 'general' },
      { key: 'address', value: '123 Main St, City, Country', group_name: 'general' },
      { key: 'currency', value: 'INR', group_name: 'general' },
      { key: 'currency_symbol', value: '₹', group_name: 'general' },
      { key: 'facebook_url', value: 'https://facebook.com/example', group_name: 'social' },
      { key: 'instagram_url', value: 'https://instagram.com/example', group_name: 'social' },
      { key: 'twitter_url', value: 'https://twitter.com/example', group_name: 'social' },
      { key: 'youtube_url', value: '', group_name: 'social' },
      { key: 'pinterest_url', value: '', group_name: 'social' },
      { key: 'meta_title', value: 'KAVY — Premium Clothing', group_name: 'seo' },
      { key: 'meta_description', value: 'Shop premium quality clothing at KAVY.', group_name: 'seo' },
      { key: 'analytics_code', value: '', group_name: 'seo' },
      { key: 'theme_preset', value: 'black-white', group_name: 'theme' },
      { key: 'color_background', value: '#FFFFFF', group_name: 'theme' },
      { key: 'color_text', value: '#111111', group_name: 'theme' },
      { key: 'color_primary', value: '#000000', group_name: 'theme' },
      { key: 'color_secondary', value: '#4A4A4A', group_name: 'theme' },
      { key: 'color_accent', value: '#000000', group_name: 'theme' },
      { key: 'color_button', value: '#000000', group_name: 'theme' },
      { key: 'color_border', value: '#E5E5E5', group_name: 'theme' },
      { key: 'color_surface', value: '#F8F8F8', group_name: 'theme' },
      { key: 'color_surface_hover', value: '#EEEEEE', group_name: 'theme' },
      { key: 'color_overlay', value: 'rgba(0, 0, 0, 0.5)', group_name: 'theme' },
      { key: 'color_success', value: '#111111', group_name: 'theme' },
      { key: 'color_warning', value: '#111111', group_name: 'theme' },
      { key: 'color_danger', value: '#C1121F', group_name: 'theme' },
      { key: 'maintenance_mode', value: '0', group_name: 'general' },
      { key: 'free_shipping_threshold', value: '2000', group_name: 'shipping' },
      { key: 'default_shipping_cost', value: '99', group_name: 'shipping' },
      { key: 'razorpay_enabled', value: '0', group_name: 'payment' },
      { key: 'cashfree_enabled', value: '0', group_name: 'payment' },
      { key: 'phonepe_enabled', value: '0', group_name: 'payment' },
      { key: 'cod_enabled', value: '1', group_name: 'payment' },
      { key: 'cod_min_order', value: '0', group_name: 'payment' },
      { key: 'cod_max_order', value: '10000', group_name: 'payment' },
      { key: 'cod_charge', value: '0', group_name: 'payment' },
    ];

    await supabase.from('settings').upsert(defaultSettings, { onConflict: 'key' });

    // ── Default Static Pages ──────────────────────
    const pages = [
      { title: 'About Us', slug: 'about', content: '<h2>About KAVY</h2><p>We believe in premium quality clothing that does not compromise on style or sustainability.</p>', is_published: true },
      { title: 'Contact Us', slug: 'contact', content: '<h2>Get In Touch</h2><p>We\'d love to hear from you. Reach out via email or phone.</p>', is_published: true },
      { title: 'Shipping Policy', slug: 'shipping-policy', content: '<h2>Shipping Policy</h2><p>Free shipping on orders over ₹2,000. Standard delivery: 5-7 business days.</p>', is_published: true },
      { title: 'Return Policy', slug: 'return-policy', content: '<h2>Return Policy</h2><p>Easy returns within 14 days of delivery.</p>', is_published: true },
      { title: 'Privacy Policy', slug: 'privacy-policy', content: '<h2>Privacy Policy</h2><p>Your privacy is important to us.</p>', is_published: true },
      { title: 'Terms of Service', slug: 'terms-of-service', content: '<h2>Terms of Service</h2><p>By using our website you agree to these terms.</p>', is_published: true },
    ];

    await supabase.from('pages').upsert(pages, { onConflict: 'slug' });

    console.log('  ✓ Database seeded successfully!');
  } catch (err) {
    console.error('  ✖ Seed error:', err.message);
  }
}
