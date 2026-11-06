import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { orderService } from '../services/api';

const inr = (n) => '₹' + Number(n).toLocaleString('en-IN');
const STATUS_OPTIONS = ['Pending', 'Confirmed', 'Processing', 'Packed', 'Shipped', 'Out for delivery', 'Delivered', 'Cancelled'];

export default function OrderManagement({ onBack }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editStatus, setEditStatus] = useState('');
  const [editTracking, setEditTracking] = useState('');
  const [editPaymentStatus, setEditPaymentStatus] = useState('');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [toastType, setToastType] = useState('success');

  const showToast = (msg, type = 'success') => {
    setToast(msg);
    setToastType(type);
    setTimeout(() => setToast(''), 3500);
  };

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await orderService.adminGetOrders({ search, status: statusFilter });
      if (res.success) setOrders(res.orders);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  const openDetails = (ord) => {
    setSelectedOrder(ord);
    setEditStatus(ord.order_status);
    setEditTracking(ord.tracking_number || '');
    setEditPaymentStatus(ord.payment_status || 'pending');
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setSaving(true);
    try {
      const res = await orderService.adminUpdateStatus(selectedOrder.id, {
        order_status: editStatus,
        tracking_number: editTracking,
        payment_status: editPaymentStatus
      });
      if (res.success) {
        showToast(`Order #${selectedOrder.order_number} updated.`);
        setSelectedOrder(res.order);
        setOrders((prev) => prev.map((o) => (o.id === res.order.id ? res.order : o)));
      }
    } catch (err) {
      showToast(err.response?.data?.message || err.message || 'Failed to update order.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {toast && (
        <div style={{ position: 'fixed', top: '84px', right: '28px', background: toastType === 'error' ? 'rgba(239,68,68,0.95)' : 'linear-gradient(135deg, #f6dda0, #d4af37)', color: toastType === 'error' ? '#fff' : '#1a0418', padding: '12px 22px', borderRadius: '999px', fontWeight: 600, fontSize: '14px', zIndex: 9999, border: toastType === 'error' ? '1px solid #fca5a5' : 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
          {toastType === 'error' ? '⚠ ' : '✓ '} {toast}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            onClick={() => (onBack ? onBack() : window.history.back())}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(212,175,55,0.1)',
              border: '1px solid var(--gold)',
              color: 'var(--gold2)',
              padding: '8px 16px',
              borderRadius: '999px',
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            title="Go Back"
          >
            <ArrowLeft size={16} /> Back
          </button>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 500, color: 'var(--gold2)', margin: 0 }}>
              Customer Orders &amp; Fulfillment
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--cream)', opacity: 0.75, margin: '4px 0 0' }}>
              Update dispatch status, courier tracking numbers, and view customer order invoices.
            </p>
          </div>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', background: '#1c0418', padding: '16px', borderRadius: '12px', border: '1px solid var(--line)' }}>
        <form onSubmit={(e) => { e.preventDefault(); loadOrders(); }} style={{ display: 'flex', gap: '8px', flex: 1, minWidth: '240px' }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order #, customer name, email..."
            style={{ flex: 1, background: 'rgba(255,240,208,0.06)', border: '1px solid var(--line)', padding: '10px 14px', borderRadius: '8px', color: '#fff', fontSize: '13px' }}
          />
          <button type="submit" style={{ background: 'var(--gold)', color: 'var(--ink)', border: 0, padding: '10px 18px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '13px' }}>
            Search
          </button>
        </form>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ background: '#24061d', border: '1px solid var(--line)', padding: '10px 14px', borderRadius: '8px', color: 'var(--cream)', fontSize: '13px' }}
        >
          <option value="All">All Statuses</option>
          {STATUS_OPTIONS.map((st) => (
            <option key={st} value={st}>
              {st}
            </option>
          ))}
        </select>
      </div>

      {/* Orders Table */}
      <div style={{ background: '#1c0418', border: '1px solid var(--line)', borderRadius: '16px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: 'rgba(229,189,114,0.08)', borderBottom: '1px solid var(--line)', color: 'var(--gold)' }}>
              <th style={{ padding: '12px 16px' }}>Order Number</th>
              <th style={{ padding: '12px 16px' }}>Date</th>
              <th style={{ padding: '12px 16px' }}>Customer Details</th>
              <th style={{ padding: '12px 16px' }}>Payment</th>
              <th style={{ padding: '12px 16px' }}>Total</th>
              <th style={{ padding: '12px 16px' }}>Fulfillment Status</th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={{ padding: '30px', textAlign: 'center', opacity: 0.7 }}>
                  Loading orders...
                </td>
              </tr>
            ) : orders.length > 0 ? (
              orders.map((ord) => (
                <tr key={ord.id} style={{ borderBottom: '1px solid rgba(229,189,114,0.1)' }}>
                  <td style={{ padding: '12px 16px', color: 'var(--gold2)', fontWeight: 600 }}>
                    #{ord.order_number}
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--cream)', opacity: 0.8 }}>
                    {new Date(ord.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 500, color: 'var(--cream)' }}>{ord.customer_name}</div>
                    <small style={{ color: 'var(--gold)', opacity: 0.7 }}>{ord.customer_email}</small>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ color: ord.payment_status === 'paid' ? '#4ade80' : '#fca5a5', textTransform: 'uppercase', fontSize: '11px', fontWeight: 600 }}>
                      {ord.payment_status} ({ord.payment_method})
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--gold2)', fontWeight: 600 }}>
                    {inr(ord.total_amount)}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span
                      style={{
                        padding: '3px 10px',
                        borderRadius: '999px',
                        fontSize: '11px',
                        fontWeight: 600,
                        background:
                          ord.order_status === 'Delivered'
                            ? 'rgba(74,222,128,0.2)'
                            : ord.order_status === 'Cancelled'
                            ? 'rgba(239,68,68,0.2)'
                            : 'rgba(212,175,55,0.2)',
                        color:
                          ord.order_status === 'Delivered'
                            ? '#4ade80'
                            : ord.order_status === 'Cancelled'
                            ? '#f87171'
                            : 'var(--gold2)'
                      }}
                    >
                      {ord.order_status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <button
                      onClick={() => openDetails(ord)}
                      style={{ background: 'none', border: 0, color: 'var(--gold)', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      Manage Order →
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" style={{ padding: '30px', textAlign: 'center', opacity: 0.7 }}>
                  No customer orders match the criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Order Details & Status Update Modal */}
      {selectedOrder && (
        <div className="ov on" onClick={(e) => e.target.classList.contains('ov') && setSelectedOrder(null)}>
          <div className="box" style={{ maxWidth: '720px', padding: '32px' }}>
            <button className="x" aria-label="Close" onClick={() => setSelectedOrder(null)}>
              ×
            </button>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '24px', color: 'var(--gold2)' }}>
                  Order #{selectedOrder.order_number}
                </h3>
                <small style={{ color: 'var(--cream)', opacity: 0.7 }}>
                  Placed on {new Date(selectedOrder.createdAt).toLocaleString()}
                </small>
              </div>
              <button
                type="button"
                onClick={() => window.print()}
                style={{ background: 'rgba(229,189,114,0.15)', border: '1px solid var(--gold)', color: 'var(--gold2)', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' }}
              >
                🖨️ Print Invoice
              </button>
            </div>

            {/* Customer & Shipping Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', background: 'rgba(255,240,208,0.04)', padding: '16px', borderRadius: '12px', border: '1px solid var(--line)', marginBottom: '20px' }}>
              <div>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--gold)' }}>Customer</span>
                <div style={{ fontWeight: 600, color: '#fff' }}>{selectedOrder.customer_name}</div>
                <div style={{ fontSize: '13px', opacity: 0.8 }}>{selectedOrder.customer_email}</div>
                <div style={{ fontSize: '13px', opacity: 0.8 }}>{selectedOrder.customer_phone}</div>
              </div>
              <div>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--gold)' }}>Delivery Address</span>
                <div style={{ fontSize: '13px', color: 'var(--cream)', lineHeight: 1.4 }}>
                  {selectedOrder.shipping_address}
                </div>
              </div>
            </div>

            {/* Items */}
            <h4 style={{ fontSize: '13px', textTransform: 'uppercase', color: 'var(--gold)', letterSpacing: '0.1em', marginBottom: '10px' }}>
              Items in Order
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderBottom: '1px solid var(--line)', paddingBottom: '14px', marginBottom: '16px' }}>
              {selectedOrder.items && selectedOrder.items.map((it) => (
                <div key={it.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span>
                    {it.product_name} {it.variant_name ? `(${it.variant_name})` : ''} × <b>{it.quantity}</b>
                  </span>
                  <span style={{ color: 'var(--gold2)' }}>{inr(it.price * it.quantity)}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', fontWeight: 600, fontSize: '15px' }}>
                <span>Total Amount:</span>
                <span style={{ color: 'var(--gold2)' }}>{inr(selectedOrder.total_amount)}</span>
              </div>
            </div>

            {/* Update Form */}
            <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '14px', background: 'rgba(20,2,16,0.6)', padding: '16px', borderRadius: '12px', border: '1px solid var(--line)' }}>
              <h4 style={{ fontSize: '13px', textTransform: 'uppercase', color: 'var(--gold)', letterSpacing: '0.1em' }}>
                Update Fulfillment & Tracking
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--cream)', display: 'block', marginBottom: '4px' }}>
                    Order Status
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    style={{ width: '100%', background: '#24061d', border: '1px solid var(--line)', padding: '8px 12px', borderRadius: '8px', color: '#fff', fontSize: '13px' }}
                  >
                    {STATUS_OPTIONS.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12px', color: 'var(--cream)', display: 'block', marginBottom: '4px' }}>
                    Payment Status
                  </label>
                  <select
                    value={editPaymentStatus}
                    onChange={(e) => setEditPaymentStatus(e.target.value)}
                    style={{ width: '100%', background: '#24061d', border: '1px solid var(--line)', padding: '8px 12px', borderRadius: '8px', color: '#fff', fontSize: '13px' }}
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="failed">Failed</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12px', color: 'var(--cream)', display: 'block', marginBottom: '4px' }}>
                    Tracking Number (AWB)
                  </label>
                  <input
                    value={editTracking}
                    onChange={(e) => setEditTracking(e.target.value)}
                    placeholder="e.g. BLUEDART-9823746"
                    style={{ width: '100%', background: 'rgba(255,240,208,0.06)', border: '1px solid var(--line)', padding: '8px 12px', borderRadius: '8px', color: '#fff', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
                <button type="submit" className="gbtn" disabled={saving}>
                  {saving ? 'Updating...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

