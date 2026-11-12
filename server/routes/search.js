import { Router } from 'express';
import { supabase } from '../config/supabase.js';

const router = Router();

// GET /api/search — Instant search
router.get('/', async (req, res) => {
  try {
    const { q, limit = 6 } = req.query;

    if (!q || q.trim().length < 2) {
      return res.json({ products: [], suggestions: [] });
    }

    const searchTerm = `%${q.trim()}%`;

    const { data: products, error } = await supabase
      .from('product_list_view')
      .select('id, title, slug, price, compare_at_price, category_name, primary_image')
      .eq('is_active', true)
      .or(`title.ilike.${searchTerm},tags.ilike.${searchTerm},category_name.ilike.${searchTerm}`)
      .order('is_featured', { ascending: false })
      .limit(parseInt(limit));

    if (error) throw error;

    // Log the search (fire and forget)
    const sessionId = req.query.session_id || '';
    supabase
      .from('search_logs')
      .insert({ query: q.trim(), session_id: sessionId, results_count: (products || []).length })
      .then();

    res.json({ products: products || [] });
  } catch (err) {
    console.error('[Search] Error:', err.message);
    res.status(500).json({ error: 'Search failed' });
  }
});

// GET /api/search/popular — Popular search terms
router.get('/popular', async (req, res) => {
  try {
    const { limit = 6 } = req.query;

    // Get recent search logs and deduplicate by query
    const { data: logs, error } = await supabase
      .from('search_logs')
      .select('query')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .limit(200);

    if (error) throw error;

    // Count occurrences and get top N
    const counts = {};
    for (const log of (logs || [])) {
      const q = log.query.toLowerCase();
      counts[q] = (counts[q] || 0) + 1;
    }

    const popular = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, parseInt(limit))
      .map(([query]) => query);

    res.json({ popular });
  } catch (err) {
    console.error('[Search] Popular error:', err.message);
    res.status(500).json({ error: 'Failed to fetch popular searches' });
  }
});

// GET /api/search/suggestions — Search suggestions based on product titles
router.get('/suggestions', async (req, res) => {
  try {
    const { q, limit = 5 } = req.query;

    if (!q || q.trim().length < 1) {
      return res.json({ suggestions: [] });
    }

    const { data: products, error } = await supabase
      .from('products')
      .select('title')
      .eq('is_active', true)
      .ilike('title', `%${q.trim()}%`)
      .order('is_featured', { ascending: false })
      .limit(parseInt(limit));

    if (error) throw error;

    const suggestions = [...new Set((products || []).map(p => p.title))];

    res.json({ suggestions });
  } catch (err) {
    console.error('[Search] Suggestions error:', err.message);
    res.status(500).json({ error: 'Failed to fetch suggestions' });
  }
});

export default router;
