import { Router } from 'express';
import { supabase } from '../config/supabase.js';

const router = Router();

// GET /api/products — List products with filtering, sorting, pagination
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      collection,
      search,
      sort = 'newest',
      min_price,
      max_price,
      size,
      color,
      availability,
      tag,
      featured,
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    let query = supabase
      .from('product_list_view')
      .select('id, title, slug, description, price, compare_at_price, sku, stock, is_featured, tags, created_at, category_name, category_slug, collection_name, primary_image, secondary_image, avg_rating, review_count', { count: 'exact' })
      .eq('is_active', true);

    if (category) {
      query = query.eq('category_slug', category);
    }

    if (collection) {
      query = query.eq('collection_slug', collection);
    }

    if (search) {
      const term = `%${search}%`;
      query = query.or(`title.ilike.${term},description.ilike.${term},tags.ilike.${term}`);
    }

    if (min_price) {
      query = query.gte('price', parseFloat(min_price));
    }

    if (max_price) {
      query = query.lte('price', parseFloat(max_price));
    }

    if (availability === 'in_stock') {
      query = query.gt('stock', 0);
    } else if (availability === 'out_of_stock') {
      query = query.eq('stock', 0);
    }

    if (tag) {
      query = query.ilike('tags', `%${tag}%`);
    }

    if (featured === '1' || featured === 'true') {
      query = query.eq('is_featured', true);
    }

    // Handle hide_when_out_of_stock
    query = query.or('stock.gt.0,hide_when_out_of_stock.eq.false');

    // Sorting
    switch (sort) {
      case 'price_asc':
        query = query.order('price', { ascending: true });
        break;
      case 'price_desc':
        query = query.order('price', { ascending: false });
        break;
      case 'name_asc':
        query = query.order('title', { ascending: true });
        break;
      case 'name_desc':
        query = query.order('title', { ascending: false });
        break;
      case 'oldest':
        query = query.order('created_at', { ascending: true });
        break;
      case 'bestseller':
        query = query.order('is_featured', { ascending: false }).order('created_at', { ascending: false });
        break;
      default:
        query = query.order('created_at', { ascending: false });
    }

    // Pagination
    query = query.range(offset, offset + limitNum - 1);

    const { data: products, count: total, error } = await query;

    if (error) throw error;

    res.json({
      products: products || [],
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: total || 0,
        pages: Math.ceil((total || 0) / limitNum),
      },
    });
  } catch (err) {
    console.error('[Products] List error:', err.message);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// GET /api/products/featured — Featured products for homepage
router.get('/featured', async (req, res) => {
  try {
    const { limit = 8 } = req.query;

    const { data: products, error } = await supabase
      .from('product_list_view')
      .select('id, title, slug, price, compare_at_price, stock, is_featured, tags, category_name, category_slug, primary_image, secondary_image, avg_rating, review_count')
      .eq('is_active', true)
      .eq('is_featured', true)
      .order('created_at', { ascending: false })
      .limit(parseInt(limit));

    if (error) throw error;

    res.json({ products: products || [] });
  } catch (err) {
    console.error('[Products] Featured error:', err.message);
    res.status(500).json({ error: 'Failed to fetch featured products' });
  }
});

// GET /api/products/new-arrivals — Latest products
router.get('/new-arrivals', async (req, res) => {
  try {
    const { limit = 8 } = req.query;

    const { data: products, error } = await supabase
      .from('product_list_view')
      .select('id, title, slug, price, compare_at_price, stock, tags, category_name, category_slug, primary_image, secondary_image, avg_rating, review_count')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(parseInt(limit));

    if (error) throw error;

    res.json({ products: products || [] });
  } catch (err) {
    console.error('[Products] New arrivals error:', err.message);
    res.status(500).json({ error: 'Failed to fetch new arrivals' });
  }
});

// GET /api/products/best-sellers — Best sellers (highest reviewed + featured)
router.get('/best-sellers', async (req, res) => {
  try {
    const { limit = 8 } = req.query;

    const { data: products, error } = await supabase
      .from('product_list_view')
      .select('id, title, slug, price, compare_at_price, stock, tags, category_name, category_slug, primary_image, secondary_image, avg_rating, review_count')
      .eq('is_active', true)
      .order('review_count', { ascending: false })
      .order('is_featured', { ascending: false })
      .limit(parseInt(limit));

    if (error) throw error;

    res.json({ products: products || [] });
  } catch (err) {
    console.error('[Products] Best sellers error:', err.message);
    res.status(500).json({ error: 'Failed to fetch best sellers' });
  }
});

// GET /api/products/:slug — Single product with full detail
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    // Get product from view
    const { data: product, error: productError } = await supabase
      .from('product_list_view')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (productError || !product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Get images
    const { data: images } = await supabase
      .from('product_images')
      .select('id, url, alt_text, position, is_primary')
      .eq('product_id', product.id)
      .order('position', { ascending: true });

    // Get variants
    const { data: variants } = await supabase
      .from('product_variants')
      .select('id, name, type, value, price_modifier, stock, sku')
      .eq('product_id', product.id)
      .order('type', { ascending: true })
      .order('name', { ascending: true });

    // Get reviews
    const { data: reviews } = await supabase
      .from('reviews')
      .select('id, user_name, rating, comment, created_at')
      .eq('product_id', product.id)
      .eq('is_approved', true)
      .order('created_at', { ascending: false })
      .limit(10);

    // Get related products (same category)
    const { data: related } = await supabase
      .from('product_list_view')
      .select('id, title, slug, price, compare_at_price, stock, primary_image, secondary_image, avg_rating, review_count')
      .eq('category_id', product.category_id)
      .neq('id', product.id)
      .eq('is_active', true)
      .limit(4);

    res.json({
      product: {
        ...product,
        images: images || [],
        variants: variants || [],
        reviews: reviews || [],
      },
      related: related || [],
    });
  } catch (err) {
    console.error('[Products] Detail error:', err.message);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

export default router;
