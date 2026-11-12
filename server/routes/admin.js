import { Router } from 'express';
import { requireAdmin } from '../middleware/auth.js';
import { supabase } from '../config/supabase.js';

const router = Router();

// Protect ALL admin routes with requireAdmin middleware
router.use(requireAdmin);

// ─── 1. Dashboard Analytics ──────────────────────────────────
router.get('/analytics', async (req, res) => {
  try {
    const { data, error } = await supabase.rpc('get_admin_analytics');

    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error('[Admin] Analytics error:', err.message);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// ─── 2. Product Management (CRUD + Bulk) ────────────────────
router.get('/products', async (req, res) => {
  try {
    const { data: products, error } = await supabase
      .from('admin_product_view')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ products: products || [] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

router.get('/products/:id', async (req, res) => {
  try {
    const { data: product, error: productError } = await supabase
      .from('admin_product_view')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (productError || !product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const { data: images } = await supabase
      .from('product_images')
      .select('url')
      .eq('product_id', product.id)
      .order('position', { ascending: true });

    const { data: variants } = await supabase
      .from('product_variants')
      .select('*')
      .eq('product_id', product.id);

    res.json({
      product: {
        ...product,
        images: (images || []).map(i => i.url),
        variants: variants || [],
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

router.post('/products', async (req, res) => {
  try {
    const { title, slug, description, price, compare_at_price, category_id, sku, stock, is_featured, images = [], variants = [] } = req.body;

    const slugValue = slug || title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-');

    const { data: product, error } = await supabase
      .from('products')
      .insert({
        title,
        slug: slugValue,
        description: description || '',
        price,
        compare_at_price: compare_at_price || null,
        category_id: category_id || null,
        sku: sku || '',
        stock: stock || 0,
        is_featured: !!is_featured,
      })
      .select('id')
      .single();

    if (error) throw error;

    const productId = product.id;

    // Add images
    if (images.length > 0) {
      const imageRows = images.map((imgUrl, i) => ({
        product_id: productId,
        url: imgUrl,
        is_primary: i === 0,
        position: i,
      }));
      await supabase.from('product_images').insert(imageRows);
    }

    // Add variants
    if (variants.length > 0) {
      const variantRows = variants.map(v => ({
        product_id: productId,
        name: v.name || v.value,
        type: v.type || 'size',
        value: v.value,
        stock: v.stock || 10,
      }));
      await supabase.from('product_variants').insert(variantRows);
    }

    res.json({ message: 'Product created successfully', productId });
  } catch (err) {
    console.error('[Admin] Create product error:', err.message);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

router.put('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, price, compare_at_price, category_id, sku, stock, is_featured, is_active, description } = req.body;

    const { error } = await supabase
      .from('products')
      .update({
        title,
        price,
        compare_at_price: compare_at_price || null,
        category_id: category_id || null,
        sku: sku || '',
        stock: stock || 0,
        is_featured: !!is_featured,
        is_active: is_active !== undefined ? !!is_active : true,
        description: description || '',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) throw error;

    res.json({ message: 'Product updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update product' });
  }
});

router.delete('/products/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;

    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

router.post('/products/bulk-delete', async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) return res.status(400).json({ error: 'Product IDs required' });

    const { error } = await supabase
      .from('products')
      .delete()
      .in('id', ids);

    if (error) throw error;

    res.json({ message: `${ids.length} products deleted` });
  } catch (err) {
    res.status(500).json({ error: 'Bulk delete failed' });
  }
});

// ─── 3. Order Management ────────────────────────────────────
router.get('/orders', async (req, res) => {
  try {
    const { data: orders, error } = await supabase
      .from('order_list_view')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ orders: orders || [] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

router.get('/orders/:id', async (req, res) => {
  try {
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (orderError || !order) return res.status(404).json({ error: 'Order not found' });

    const { data: items } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', order.id);

    res.json({ order: { ...order, items: items || [] } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch order details' });
  }
});

router.put('/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      status,
      payment_status,
      courier_tracking,
      shipping_name,
      shipping_email,
      shipping_phone,
      shipping_address,
      shipping_city,
      shipping_state,
      shipping_postal_code,
      notes,
    } = req.body;

    // Build update object with only provided fields
    const updates = { updated_at: new Date().toISOString() };
    if (status !== undefined) updates.status = status;
    if (payment_status !== undefined) updates.payment_status = payment_status;
    if (courier_tracking !== undefined) updates.courier_tracking = courier_tracking;
    if (shipping_name !== undefined) updates.shipping_name = shipping_name;
    if (shipping_email !== undefined) updates.shipping_email = shipping_email;
    if (shipping_phone !== undefined) updates.shipping_phone = shipping_phone;
    if (shipping_address !== undefined) updates.shipping_address = shipping_address;
    if (shipping_city !== undefined) updates.shipping_city = shipping_city;
    if (shipping_state !== undefined) updates.shipping_state = shipping_state;
    if (shipping_postal_code !== undefined) updates.shipping_postal_code = shipping_postal_code;
    if (notes !== undefined) updates.notes = notes;

    const { error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', id);

    if (error) throw error;

    res.json({ message: 'Order updated successfully' });
  } catch (err) {
    console.error('[Admin] Update order error:', err.message);
    res.status(500).json({ error: 'Failed to update order' });
  }
});

router.put('/orders/:id/status', async (req, res) => {
  try {
    const { status, courier_tracking } = req.body;

    const allowedStatuses = ['pending','confirmed','packed','shipped','out_for_delivery','delivered','cancelled','returned','refunded'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid order status' });
    }

    const updates = { status, updated_at: new Date().toISOString() };
    if (courier_tracking) updates.courier_tracking = courier_tracking;

    const { error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', req.params.id);

    if (error) throw error;

    res.json({ message: `Order status updated to ${status}` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// ─── 4. Customer Management ────────────────────────────────
router.get('/customers', async (req, res) => {
  try {
    const { data: customers, error } = await supabase
      .from('customer_list_view')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ customers: customers || [] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

router.put('/customers/:id/block', async (req, res) => {
  try {
    const { is_blocked } = req.body;

    const { error } = await supabase
      .from('users')
      .update({ is_blocked: !!is_blocked })
      .eq('id', req.params.id);

    if (error) throw error;

    res.json({ message: `Customer ${is_blocked ? 'blocked' : 'unblocked'}` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update customer status' });
  }
});

// ─── 5. Settings & Theme Customization ──────────────────────
router.get('/settings', async (req, res) => {
  try {
    const { data: settings, error } = await supabase
      .from('settings')
      .select('key, value, group_name');

    if (error) throw error;

    res.json({ settings: settings || [] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

router.post('/settings', async (req, res) => {
  try {
    const { settings } = req.body; // array of { key, value, group_name }

    // Upsert settings one by one (Supabase upsert)
    const rows = settings.map(s => ({
      key: s.key,
      value: s.value || '',
      group_name: s.group_name || 'general',
    }));

    const { error } = await supabase
      .from('settings')
      .upsert(rows, { onConflict: 'key' });

    if (error) throw error;

    res.json({ message: 'Settings saved successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save settings' });
  }
});

// ─── 6. CMS Pages Management ────────────────────────────────
router.get('/pages', async (req, res) => {
  try {
    const { data: pages, error } = await supabase
      .from('pages')
      .select('*')
      .order('title', { ascending: true });

    if (error) throw error;

    res.json({ pages: pages || [] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch CMS pages' });
  }
});

router.put('/pages/:id', async (req, res) => {
  try {
    const { content, meta_title, meta_description, is_published } = req.body;

    const { error } = await supabase
      .from('pages')
      .update({
        content: content || '',
        meta_title: meta_title || '',
        meta_description: meta_description || '',
        is_published: !!is_published,
        updated_at: new Date().toISOString(),
      })
      .eq('id', req.params.id);

    if (error) throw error;

    res.json({ message: 'CMS page updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update CMS page' });
  }
});

// ─── 7. Database Backups (Managed by Supabase) ──────────────
router.post('/backups', (req, res) => {
  res.json({
    message: 'Database backups are now managed by Supabase. Visit your Supabase Dashboard → Database → Backups.',
    info: 'Supabase automatically creates daily backups on Pro plans and above.',
  });
});

router.get('/backups', (req, res) => {
  res.json({
    backups: [],
    message: 'Backups are managed by Supabase. Visit Dashboard → Database → Backups.',
  });
});

export default router;
