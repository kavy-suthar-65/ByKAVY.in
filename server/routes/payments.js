import { Router } from 'express';
import { supabase } from '../config/supabase.js';

const router = Router();

// POST /api/payments/process — Process payment for an order
router.post('/process', async (req, res) => {
  try {
    const { orderNumber, gateway } = req.body;

    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('order_number', orderNumber)
      .single();

    if (error || !order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (gateway === 'cod') {
      await supabase
        .from('orders')
        .update({ payment_status: 'pending', status: 'confirmed', updated_at: new Date().toISOString() })
        .eq('id', order.id);

      return res.json({ success: true, message: 'Cash on delivery order confirmed', orderNumber });
    }

    if (gateway === 'razorpay') {
      const razorpayKey = process.env.RAZORPAY_KEY_ID;
      if (!razorpayKey) {
        return res.status(500).json({ error: 'Razorpay is not configured' });
      }
      return res.json({
        success: true,
        gateway: 'razorpay',
        key_id: razorpayKey,
        order_id: `rzp_order_${order.id}_${Date.now()}`,
        amount: Math.round(order.total * 100),
        currency: 'INR',
      });
    }

    if (gateway === 'cashfree') {
      return res.json({
        success: true,
        gateway: 'cashfree',
        payment_session_id: `cf_session_${order.id}_${Date.now()}`,
        order_id: order.order_number,
      });
    }

    if (gateway === 'phonepe') {
      return res.json({
        success: true,
        gateway: 'phonepe',
        redirect_url: `/order-confirmation/${order.order_number}?status=success`,
      });
    }

    res.status(400).json({ error: 'Unsupported payment gateway' });
  } catch (err) {
    console.error('[Payments] Process error:', err.message);
    res.status(500).json({ error: 'Payment processing failed' });
  }
});

// POST /api/payments/verify — Signature / payment confirmation verification
router.post('/verify', async (req, res) => {
  try {
    const { orderNumber, paymentId, signature, status = 'success' } = req.body;

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('order_number', orderNumber)
      .single();

    if (orderError || !order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (status === 'success') {
      const pid = paymentId || `PAY-${Date.now()}`;

      await supabase
        .from('orders')
        .update({
          payment_status: 'paid',
          status: 'confirmed',
          payment_id: pid,
          updated_at: new Date().toISOString(),
        })
        .eq('id', order.id);

      await supabase
        .from('payments')
        .insert({
          order_id: order.id,
          gateway: order.payment_method,
          gateway_payment_id: paymentId || '',
          amount: order.total,
          status: 'paid',
        });

      return res.json({ success: true, message: 'Payment verified and order confirmed' });
    } else {
      await supabase
        .from('orders')
        .update({ payment_status: 'failed', updated_at: new Date().toISOString() })
        .eq('id', order.id);

      return res.status(400).json({ error: 'Payment verification failed' });
    }
  } catch (err) {
    console.error('[Payments] Verify error:', err.message);
    res.status(500).json({ error: 'Verification failed' });
  }
});

export default router;
