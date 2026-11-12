import { Router } from 'express';
import { supabase } from '../config/supabase.js';

const router = Router();

// GET /api/categories — All categories
router.get('/', async (req, res) => {
  try {
    const { data: categories, error } = await supabase
      .from('category_list_view')
      .select('*')
      .order('position', { ascending: true });

    if (error) throw error;

    res.json({ categories: categories || [] });
  } catch (err) {
    console.error('[Categories] List error:', err.message);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// GET /api/categories/:slug — Single category with product count
router.get('/:slug', async (req, res) => {
  try {
    const { data: category, error } = await supabase
      .from('category_list_view')
      .select('id, name, slug, description, image, product_count')
      .eq('slug', req.params.slug)
      .single();

    if (error || !category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json({ category });
  } catch (err) {
    console.error('[Categories] Detail error:', err.message);
    res.status(500).json({ error: 'Failed to fetch category' });
  }
});

export default router;
