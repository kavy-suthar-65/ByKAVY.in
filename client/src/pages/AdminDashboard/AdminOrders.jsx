import { useState, useEffect, useMemo } from 'react';
import { api, formatPrice, formatDate } from '../../utils/api';
import { useToast } from '../../components/Toast/Toast';
import Skeleton from '../../components/Skeleton/Skeleton';
import './AdminOrders.css';

const STATUSES = [
  'all',
  'pending',
  'confirmed',
  'packed',
  'shipped',
  'out_for_delivery',
  'delivered',
  'cancelled',
  'returned',
  'refunded',
];

const EDITABLE_STATUSES = [
  'pending',
  'confirmed',
  'packed',
  'shipped',
  'out_for_delivery',
  'delivered',
  'cancelled',
  'returned',
  'refunded',
];

const PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'refunded'];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Detail & Edit Modal State
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form Fields for Editing Order
  const [editStatus, setEditStatus] = useState('');
  const [editPaymentStatus, setEditPaymentStatus] = useState('');
  const [editTracking, setEditTracking] = useState('');
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editState, setEditState] = useState('');
  const [editPostalCode, setEditPostalCode] = useState('');
  const [editNotes, setEditNotes] = useState('');

  const toast = useToast();

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    setLoading(true);
    try {
      const res = await api.get('/admin/orders');
      setOrders(Array.isArray(res?.orders) ? res.orders : []);
    } catch (err) {
      console.error('Failed to load orders:', err);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  }

  const filteredOrders = useMemo(() => {
    return orders.filter((ord) => {
      const status = String(ord.status || 'pending').toLowerCase();
      if (selectedFilter !== 'all' && status !== selectedFilter) {
        return false;
      }

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();

      const orderNumber = String(ord.order_number || ord.orderNumber || ord.id || '').toLowerCase();
      const name = String(ord.shipping_name || ord.customer?.name || '').toLowerCase();
      const phone = String(ord.shipping_phone || ord.customer?.phone || '').toLowerCase();
      const email = String(ord.shipping_email || ord.customer?.email || '').toLowerCase();

      return (
        orderNumber.includes(q) ||
        name.includes(q) ||
        phone.includes(q) ||
        email.includes(q)
      );
    });
  }, [orders, selectedFilter, searchQuery]);

  const handleOpenOrderDetail = async (orderId) => {
    setLoadingDetail(true);
    try {
      const res = await api.get(`/admin/orders/${orderId}`);
      const ord = res?.order || orders.find((o) => o.id === orderId || o.order_number === orderId);
      if (!ord) throw new Error('Order not found');

      setSelectedOrder(ord);

      // Populate form state with fallbacks
      setEditStatus(ord.status || 'pending');
      setEditPaymentStatus(ord.payment_status || (ord.payment_method === 'cod' ? 'pending' : 'paid'));
      setEditTracking(ord.courier_tracking || '');
      setEditName(ord.shipping_name || ord.customer?.name || '');
      setEditEmail(ord.shipping_email || ord.customer?.email || '');
      setEditPhone(ord.shipping_phone || ord.customer?.phone || '');
      setEditAddress(
        ord.shipping_address ||
        (ord.shippingAddress ? [ord.shippingAddress.address_line1, ord.shippingAddress.address_line2].filter(Boolean).join(', ') : '')
      );
      setEditCity(ord.shipping_city || ord.shippingAddress?.city || '');
      setEditState(ord.shipping_state || ord.shippingAddress?.state || '');
      setEditPostalCode(ord.shipping_postal_code || ord.shippingAddress?.postal_code || '');
      setEditNotes(ord.notes || '');
    } catch (err) {
      console.error('Failed to load order details:', err);
      toast.error('Failed to load order details');
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;

    setSaving(true);
    try {
      await api.put(`/admin/orders/${selectedOrder.id || selectedOrder.order_number}`, {
        status: editStatus,
        payment_status: editPaymentStatus,
        courier_tracking: editTracking,
        shipping_name: editName,
        shipping_email: editEmail,
        shipping_phone: editPhone,
        shipping_address: editAddress,
        shipping_city: editCity,
        shipping_state: editState,
        shipping_postal_code: editPostalCode,
        notes: editNotes,
      });

      toast.success('Order details updated successfully!');
      setSelectedOrder(null);
      loadOrders();
    } catch (err) {
      console.error('Failed to update order:', err);
      toast.error('Failed to update order');
    } finally {
      setSaving(false);
    }
  };

  // Ultra-Detailed Printable Invoice Generator
  const handlePrintUltraInvoice = (ord) => {
    if (!ord) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Please allow popups to print invoices');
      return;
    }

    const items = Array.isArray(ord.items) ? ord.items : [];
    const itemsRows = items
      .map(
        (item) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #E5E5E5; display: flex; align-items: center; gap: 12px;">
          <img src="${item.image || '/storage/products/tee-crew-front.jpg'}" alt="${item.title || 'Product'}" style="width: 48px; height: 60px; object-fit: cover; border-radius: 4px; border: 1px solid #eee;" />
          <div>
            <strong style="display: block; font-size: 14px;">${item.title || 'Product'}</strong>
            ${item.variant_info ? `<span style="font-size: 12px; color: #666;">Variant: ${item.variant_info}</span>` : ''}
          </div>
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #E5E5E5; text-align: center;">${item.quantity || 1}</td>
        <td style="padding: 12px; border-bottom: 1px solid #E5E5E5; text-align: right;">₹${item.price || 0}</td>
        <td style="padding: 12px; border-bottom: 1px solid #E5E5E5; text-align: right; font-weight: 600;">₹${item.total || 0}</td>
      </tr>
    `
      )
      .join('');

    const orderNumber = ord.order_number || ord.orderNumber || ord.id || 'N/A';
    const paymentMethod = String(ord.payment_method || ord.paymentMethod || 'COD').toUpperCase();
    const paymentStatus = String(ord.payment_status || 'PENDING').toUpperCase();
    const orderStatus = String(ord.status || 'PENDING').toUpperCase();

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice #${orderNumber} — ByKAVY.in</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { font-family: 'Poppins', sans-serif; padding: 40px; color: #111; background: #FFF; }
            .invoice-header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 24px; border-bottom: 2px solid #111; margin-bottom: 24px; }
            .logo { font-size: 28px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; }
            .inv-title { font-size: 24px; font-weight: 600; text-align: right; color: #333; }
            .inv-meta { text-align: right; font-size: 13px; color: #666; margin-top: 4px; }
            .address-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-bottom: 32px; font-size: 14px; }
            .address-box h3 { font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; color: #666; margin-bottom: 8px; }
            .items-table { width: 100%; border-collapse: collapse; margin-bottom: 32px; }
            .items-table th { background: #FAFAFA; padding: 10px 12px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #555; text-align: left; border-bottom: 2px solid #DDD; }
            .totals-table { width: 320px; margin-left: auto; font-size: 14px; }
            .totals-table td { padding: 6px 0; }
            .grand-total { font-size: 18px; font-weight: 700; border-top: 2px solid #111; padding-top: 10px !important; margin-top: 6px; }
            .invoice-footer { margin-top: 48px; padding-top: 20px; border-top: 1px solid #DDD; text-align: center; font-size: 12px; color: #777; }
            @media print { body { padding: 20px; } }
          </style>
        </head>
        <body>
          <div class="invoice-header">
            <div>
              <div class="logo">ByKAVY.in</div>
              <p style="font-size: 13px; color: #555; margin-top: 4px;">Premium Clothing & Lifestyle</p>
              <p style="font-size: 12px; color: #777;">GSTIN: 24AAAFK0000A1Z5</p>
            </div>
            <div>
              <div class="inv-title">TAX INVOICE</div>
              <div class="inv-meta">
                <p>Invoice #: <strong>${orderNumber}</strong></p>
                <p>Date: ${formatDate(ord.created_at)}</p>
                <p>Status: <strong>${orderStatus}</strong></p>
              </div>
            </div>
          </div>

          <div class="address-grid">
            <div class="address-box">
              <h3>Billed & Shipped To</h3>
              <p style="font-weight: 600;">${ord.shipping_name || ord.customer?.name || 'Customer'}</p>
              <p>${ord.shipping_address || 'Address on file'}</p>
              <p>${[ord.shipping_city, ord.shipping_state, ord.shipping_postal_code].filter(Boolean).join(', ')}</p>
              <p>Email: ${ord.shipping_email || ord.customer?.email || '—'}</p>
              <p>Phone: ${ord.shipping_phone || ord.customer?.phone || '—'}</p>
            </div>
            <div class="address-box">
              <h3>Payment & Courier Info</h3>
              <p>Method: <strong>${paymentMethod}</strong></p>
              <p>Payment Status: <strong>${paymentStatus}</strong></p>
              ${ord.courier_tracking ? `<p>AWB Tracking #: <strong>${ord.courier_tracking}</strong></p>` : ''}
              ${ord.payment_id ? `<p>Payment Txn ID: <code>${ord.payment_id}</code></p>` : ''}
            </div>
          </div>

          <table class="items-table">
            <thead>
              <tr>
                <th>Item Description</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Unit Price</th>
                <th style="text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${itemsRows}
            </tbody>
          </table>

          <table class="totals-table">
            <tr>
              <td>Subtotal:</td>
              <td style="text-align: right;">₹${ord.subtotal || 0}</td>
            </tr>
            <tr>
              <td>Shipping Fee:</td>
              <td style="text-align: right;">${Number(ord.shipping_cost || 0) === 0 ? 'FREE' : `₹${ord.shipping_cost}`}</td>
            </tr>
            ${Number(ord.discount || 0) > 0 ? `
              <tr style="color: #065F46;">
                <td>Discount (${ord.coupon_code || 'Applied'}):</td>
                <td style="text-align: right;">-₹${ord.discount}</td>
              </tr>
            ` : ''}
            <tr class="grand-total">
              <td>Grand Total:</td>
              <td style="text-align: right;">₹${ord.total || 0}</td>
            </tr>
          </table>

          <div class="invoice-footer">
            <p>Thank you for shopping with ByKAVY.in! For customer support, email support@bykavy.in</p>
            <p style="margin-top: 4px;">This is a computer-generated invoice and requires no physical signature.</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 500);
  };

  return (
    <div className="admin-orders animate-fade-in">
      <div className="admin-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
        <div>
          <h1 className="text-h1">Order Management</h1>
          <p className="text-secondary">
            Manage customer orders, track fulfillment status, update shipping details, and generate tax invoices.
          </p>
        </div>
        <button
          type="button"
          className="btn btn--outline btn--sm"
          onClick={loadOrders}
          disabled={loading}
        >
          {loading ? 'Refreshing...' : '🔄 Refresh Orders'}
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="admin-orders__toolbar">
        <div className="admin-orders__search-wrap">
          <svg className="admin-orders__search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            className="admin-orders__search-input"
            placeholder="Search by Order #, Customer, Phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="admin-orders__filters">
          {STATUSES.map((st) => (
            <button
              key={st}
              type="button"
              className={`admin-filter-pill ${selectedFilter === st ? 'admin-filter-pill--active' : ''}`}
              onClick={() => setSelectedFilter(st)}
            >
              {st.replace(/_/g, ' ').toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <Skeleton variant="page" />
      ) : filteredOrders.length === 0 ? (
        <div className="admin-card admin-orders__empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: '0 auto', opacity: 0.4 }}>
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 style={{ marginTop: 'var(--space-sm)' }}>No orders found</h3>
          <p>
            {searchQuery || selectedFilter !== 'all'
              ? 'Try changing your search term or status filter.'
              : 'New orders will appear here as customers place them.'}
          </p>
        </div>
      ) : (
        <div className="admin-card" style={{ overflowX: 'auto' }}>
          <table className="admin-table admin-table--interactive">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Tracking</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((ord) => {
                const orderNum = ord.order_number || ord.orderNumber || ord.id || 'N/A';
                const customerName = ord.shipping_name || ord.customer?.name || 'Customer';
                const customerPhone = ord.shipping_phone || ord.customer?.phone || '—';
                const paymentMethod = String(ord.payment_method || ord.paymentMethod || 'cod').toUpperCase();
                const statusStr = String(ord.status || 'pending');

                return (
                  <tr
                    key={ord.id || orderNum}
                    onClick={() => handleOpenOrderDetail(ord.id || orderNum)}
                    title="Click to view & edit order details"
                  >
                    <td><strong>#{orderNum}</strong></td>
                    <td>
                      <div>
                        <span>{customerName}</span>
                        <br />
                        <small className="text-secondary">{customerPhone}</small>
                      </div>
                    </td>
                    <td>{formatDate(ord.created_at)}</td>
                    <td><strong>{formatPrice(ord.total || 0)}</strong></td>
                    <td>
                      <span className="badge badge--new">
                        {paymentMethod}
                      </span>
                    </td>
                    <td>
                      <code>{ord.courier_tracking || 'No Tracking'}</code>
                    </td>
                    <td>
                      <span className={`badge badge--status badge--${statusStr}`}>
                        {statusStr.replace(/_/g, ' ').toUpperCase()}
                      </span>
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          type="button"
                          className="btn btn--outline btn--sm"
                          onClick={() => handleOpenOrderDetail(ord.id || orderNum)}
                        >
                          View / Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn--ghost btn--sm"
                          title="Print Invoice"
                          onClick={() => handlePrintUltraInvoice(ord)}
                        >
                          📄
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ULTRA-DETAILED VIEW & EDIT ORDER MODAL */}
      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal-content modal-content--lg animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>Order #{selectedOrder.order_number || selectedOrder.orderNumber || selectedOrder.id} Details</h2>
                <span className="text-secondary" style={{ fontSize: 'var(--text-xs)' }}>
                  Placed on {formatDate(selectedOrder.created_at)}
                </span>
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-xs)' }}>
                <button
                  type="button"
                  className="btn btn--outline btn--sm"
                  onClick={() => handlePrintUltraInvoice(selectedOrder)}
                >
                  📄 Download Tax Invoice
                </button>
                <button
                  type="button"
                  className="admin-modal-close"
                  onClick={() => setSelectedOrder(null)}
                >
                  ✕
                </button>
              </div>
            </div>

            {loadingDetail ? (
              <Skeleton variant="page" />
            ) : (
              <form onSubmit={handleSaveChanges} className="order-edit-form">
                {/* 1. Status & Tracking Bar */}
                <div className="admin-form-card">
                  <h3>Order & Payment Status</h3>
                  <div className="admin-form-grid-3">
                    <div className="input-group">
                      <label className="input-label">Order Timeline Status</label>
                      <select
                        className="input"
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value)}
                      >
                        {EDITABLE_STATUSES.map((st) => (
                          <option key={st} value={st}>
                            {st.replace(/_/g, ' ').toUpperCase()}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="input-group">
                      <label className="input-label">Payment Status</label>
                      <select
                        className="input"
                        value={editPaymentStatus}
                        onChange={(e) => setEditPaymentStatus(e.target.value)}
                      >
                        {PAYMENT_STATUSES.map((pst) => (
                          <option key={pst} value={pst}>
                            {pst.toUpperCase()}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="input-group">
                      <label className="input-label">Courier Tracking / AWB #</label>
                      <input
                        type="text"
                        className="input"
                        placeholder="e.g. AWB987654321"
                        value={editTracking}
                        onChange={(e) => setEditTracking(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Customer Contact & Address Info (Editable) */}
                <div className="admin-form-card">
                  <h3>Customer & Shipping Information</h3>
                  <div className="admin-form-grid-2">
                    <div className="input-group">
                      <label className="input-label">Customer Name</label>
                      <input
                        type="text"
                        className="input"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        required
                      />
                    </div>

                    <div className="input-group">
                      <label className="input-label">Customer Email</label>
                      <input
                        type="email"
                        className="input"
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                      />
                    </div>

                    <div className="input-group">
                      <label className="input-label">Customer Phone</label>
                      <input
                        type="tel"
                        className="input"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                      />
                    </div>

                    <div className="input-group">
                      <label className="input-label">PIN Code</label>
                      <input
                        type="text"
                        className="input"
                        value={editPostalCode}
                        onChange={(e) => setEditPostalCode(e.target.value)}
                      />
                    </div>

                    <div className="input-group full-width">
                      <label className="input-label">Shipping Address Line</label>
                      <input
                        type="text"
                        className="input"
                        value={editAddress}
                        onChange={(e) => setEditAddress(e.target.value)}
                      />
                    </div>

                    <div className="input-group">
                      <label className="input-label">City</label>
                      <input
                        type="text"
                        className="input"
                        value={editCity}
                        onChange={(e) => setEditCity(e.target.value)}
                      />
                    </div>

                    <div className="input-group">
                      <label className="input-label">State</label>
                      <input
                        type="text"
                        className="input"
                        value={editState}
                        onChange={(e) => setEditState(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Ordered Products Table */}
                <div className="admin-form-card">
                  <h3>Purchased Products ({selectedOrder.items?.length || 0} items)</h3>
                  <div className="admin-order-items-list">
                    {(selectedOrder.items || []).map((item, idx) => (
                      <div key={item.id || idx} className="admin-order-item-row">
                        <img
                          src={item.image || '/storage/products/tee-crew-front.jpg'}
                          alt={item.title || 'Product'}
                          className="admin-order-item-img"
                        />
                        <div className="admin-order-item-info">
                          <strong style={{ fontSize: 'var(--text-small)' }}>{item.title || 'Product'}</strong>
                          {item.variant_info && (
                            <span className="text-secondary" style={{ fontSize: 'var(--text-xs)' }}>
                              Variant: {item.variant_info}
                            </span>
                          )}
                          <span className="text-secondary" style={{ fontSize: 'var(--text-xs)' }}>
                            Unit Price: {formatPrice(item.price || 0)} | Qty: {item.quantity || 1}
                          </span>
                        </div>
                        <span className="admin-order-item-total">{formatPrice(item.total || 0)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. Financial Breakdown */}
                <div className="admin-form-card admin-financials-summary">
                  <div className="financial-row">
                    <span>Subtotal:</span>
                    <span>{formatPrice(selectedOrder.subtotal || 0)}</span>
                  </div>
                  <div className="financial-row">
                    <span>Shipping Fee:</span>
                    <span>{Number(selectedOrder.shipping_cost || 0) === 0 ? 'FREE' : formatPrice(selectedOrder.shipping_cost)}</span>
                  </div>
                  {Number(selectedOrder.discount || 0) > 0 && (
                    <div className="financial-row text-success">
                      <span>Discount ({selectedOrder.coupon_code || 'Coupon'}):</span>
                      <span>-{formatPrice(selectedOrder.discount)}</span>
                    </div>
                  )}
                  <div className="divider" style={{ margin: 'var(--space-xs) 0' }} />
                  <div className="financial-row total-row">
                    <span>Grand Total:</span>
                    <span>{formatPrice(selectedOrder.total || 0)}</span>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn btn--outline"
                    onClick={() => setSelectedOrder(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn--primary"
                    disabled={saving}
                  >
                    {saving ? 'Saving Changes...' : 'Save Order Changes'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
