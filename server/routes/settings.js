import { Router } from 'express';
import { supabase } from '../config/supabase.js';

const router = Router();

// GET /api/settings & /api/settings/public — Public settings (no auth required)
const getPublicSettings = async (req, res) => {
  try {
    const { data: settings, error } = await supabase
      .from('settings')
      .select('key, value, group_name')
      .in('group_name', ['general', 'social', 'seo', 'theme', 'shipping', 'announcement']);

    if (error) throw error;

    // Transform into grouped object
    const grouped = {};
    for (const s of (settings || [])) {
      if (!grouped[s.group_name]) grouped[s.group_name] = {};
      grouped[s.group_name][s.key] = s.value;
    }

    res.json({ settings: grouped });
  } catch (err) {
    console.error('[Settings] Public error:', err.message);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
};

router.get('/', getPublicSettings);
router.get('/public', getPublicSettings);

// GET /api/settings/reviews — Approved reviews for homepage
router.get('/reviews', async (req, res) => {
  try {
    const { limit = 8 } = req.query;

    const { data: reviews, error } = await supabase
      .from('approved_reviews_view')
      .select('*')
      .order('rating', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(parseInt(limit));

    if (error) throw error;

    res.json({ reviews: reviews || [] });
  } catch (err) {
    console.error('[Settings] Reviews error:', err.message);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// GET /api/settings/page/:slug — Get CMS page by slug
router.get('/page/:slug', async (req, res) => {
  try {
    const { data: page, error } = await supabase
      .from('pages')
      .select('id, title, slug, content, meta_title, meta_description')
      .eq('slug', req.params.slug)
      .eq('is_published', true)
      .single();

    if (error || !page) {
      return res.status(404).json({ error: 'Page not found' });
    }

    res.json({ page });
  } catch (err) {
    console.error('[Settings] Page error:', err.message);
    res.status(500).json({ error: 'Failed to fetch page' });
  }
});

export default router;
