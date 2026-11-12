import { Router } from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { authenticateToken } from '../middleware/auth.js';
import { supabase } from '../config/supabase.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

function generateOrderNumber() {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `SNH-${dateStr}-${randomSuffix}`;
}

// POST /api/orders — Create new order (supports Guest Checkout with Auto Account Creation)
router.post('/', async (req, res) => {
  try {
    const {
      customer,
      shippingAddress,
      billingAddress,
      items,
      paymentMethod = 'cod',
      couponCode = '',
      discount = 0,
      notes = '',
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    if (!customer || !customer.email || !customer.name || !customer.phone) {
      return res.status(400).json({ error: 'Customer contact details are required' });
    }

    if (!shippingAddress || !shippingAddress.address_line1 || !shippingAddress.city || !shippingAddress.postal_code) {
      return res.status(400).json({ error: 'Complete shipping address is required' });
    }

    let userId = null;
    let autoCreatedAccount = false;
    let authHeader = req.headers['authorization'];
    let token = (authHeader && authHeader.split(' ')[1]) || req.cookies?.token;

    // Check if user is logged in
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        userId = decoded.id;
      } catch (e) {
        // Token invalid, proceed as guest
      }
    }

    // Guest checkout → auto create account if user doesn't exist
    if (!userId) {
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', customer.email.toLowerCase().trim())
        .single();

      if (existingUser) {
        userId = existingUser.id;
      } else {
        // Auto-create customer account
        const nameParts = customer.name.trim().split(' ');
        const firstName = nameParts[0] || 'Customer';
        const lastName = nameParts.slice(1).join(' ') || '';
        const defaultPassword = customer.password || crypto.randomBytes(16).toString('hex');
        const passwordHash = await bcrypt.hash(defaultPassword, 12);

        const { data: newAccount, error: createError } = await supabase
          .from('users')
          .insert({
            email: customer.email.toLowerCase().trim(),
            password_hash: passwordHash,
            first_name: firstName,
            last_name: lastName,
            phone: customer.phone,
            role: 'customer',
          })
          .select('id')
          .single();

        if (createError) throw createError;

        userId = newAccount.id;
        autoCreatedAccount = true;
      }
    }

    // Validate items and calculate subtotal
    let subtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('id, title, price, stock')
        .eq('id', item.productId)
        .single();

      if (productError || !product) {
        return res.status(400).json({ error: `Product ID ${item.productId} not found` });
      }

      const itemPrice = product.price;
      const itemTotal = itemPrice * item.quantity;
      subtotal += itemTotal;

      validatedItems.push({
        product_id: product.id,
        variant_id: item.variantId ? String(item.variantId) : '',
        title: product.title,
        price: itemPrice,
        quantity: item.quantity,
        total: itemTotal,
        image: item.image || '',
        variant_info: item.variantLabel || '',
      });
    }

    // Shipping Cost
    const { data: freeShippingSetting } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'free_shipping_threshold')
      .single();

    const { data: defaultShippingSetting } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'default_shipping_cost')
      .single();

    const freeShippingThreshold = parseFloat(freeShippingSetting?.value || '2000');
    const defaultShippingCost = parseFloat(defaultShippingSetting?.value || '99');
    const shippingCost = subtotal >= freeShippingThreshold ? 0 : defaultShippingCost;

    const total = Math.max(0, subtotal + shippingCost - discount);
    const orderNumber = generateOrderNumber();

    // Create order via RPC (transactional)
    const { data: orderId, error: orderError } = await supabase.rpc('create_order', {
      p_user_id: userId,
      p_order_number: orderNumber,
      p_subtotal: subtotal,
      p_shipping_cost: shippingCost,
      p_discount: discount,
      p_total: total,
      p_payment_method: paymentMethod,
      p_shipping_name: customer.name,
      p_shipping_email: customer.email,
      p_shipping_phone: customer.phone,
      p_shipping_address: shippingAddress.address_line1 + (shippingAddress.address_line2 ? `, ${shippingAddress.address_line2}` : ''),
      p_shipping_city: shippingAddress.city,
      p_shipping_state: shippingAddress.state || '',
      p_shipping_postal_code: shippingAddress.postal_code,
      p_shipping_country: shippingAddress.country || 'India',
      p_notes: notes,
      p_coupon_code: couponCode,
      p_items: JSON.stringify(validatedItems),
    });

    if (orderError) throw orderError;

    // Issue JWT token if guest account was created
    let userToken = null;
    if (autoCreatedAccount) {
      userToken = jwt.sign(
        { id: userId, email: customer.email, role: 'customer', first_name: customer.name },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      res.cookie('token', userToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
    }

    res.json({
      message: 'Order created successfully',
      orderId,
      orderNumber,
      total,
      paymentMethod,
      autoCreatedAccount,
      token: userToken,
    });
  } catch (err) {
    console.error('[Orders] Create error:', err.message);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// GET /api/orders/my-orders — Get current customer's order history
router.get('/my-orders', authenticateToken, async (req, res) => {
  try {
    const { data: orders, error } = await supabase
      .from('order_list_view')
      .select('id, order_number, status, total, payment_method, payment_status, created_at, item_count')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Get first item image for each order
    const ordersWithImages = await Promise.all((orders || []).map(async (order) => {
      const { data: firstItem } = await supabase
        .from('order_items')
        .select('image')
        .eq('order_id', order.id)
        .limit(1)
        .single();

      return { ...order, first_item_image: firstItem?.image || '' };
    }));

    res.json({ orders: ordersWithImages });
  } catch (err) {
    console.error('[Orders] My orders error:', err.message);
    res.status(500).json({ error: 'Failed to fetch order history' });
  }
});

// GET /api/orders/:orderNumber — Single order detail with items & status timeline
router.get('/:orderNumber', async (req, res) => {
  try {
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('order_number', req.params.orderNumber)
      .single();

    if (orderError || !order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', order.id);

    if (itemsError) throw itemsError;

    // Status Timeline
    const statuses = ['pending', 'confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered'];
    const currentStatusIndex = statuses.indexOf(order.status);

    res.json({
      order: {
        ...order,
        items: items || [],
        timeline: statuses.map((st, i) => ({
          status: st,
          label: st.replace(/_/g, ' ').toUpperCase(),
          completed: i <= currentStatusIndex && currentStatusIndex !== -1,
          current: st === order.status,
        })),
      },
    });
  } catch (err) {
    console.error('[Orders] Detail error:', err.message);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

export default router;
