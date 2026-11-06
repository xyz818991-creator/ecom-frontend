import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { couponService } from '../services/api';

const inr = (n) => '₹' + Number(n).toLocaleString('en-IN');

export default function CouponManagement({ onBack }) {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage',
    value: '',
    min_order_value: 0,
    max_discount: '',
    usage_limit: 100,
    expiry_date: '',
    is_active: true
  });
  const [toast, setToast] = useState('');
  const [toastType, setToastType] = useState('success');
  const [search, setSearch] = useState('');

  const showToast = (msg, type = 'success') => {
    setToast(msg);
    setToastType(type);
    setTimeout(() => setToast(''), 3500);
  };

  const loadCoupons = async () => {
    try {
      setLoading(true);
      const res = await couponService.adminGetCoupons();
      if (res.success) setCoupons(res.coupons);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const res = await couponService.createCoupon(formData);
      if (res.success) {
        showToast(`Coupon "${res.coupon.code}" created.`);
        setModalOpen(false);
        loadCoupons();
      }
    } catch (err) {
      showToast(err.response?.data?.message || err.message || 'Failed to create coupon', 'error');
    }
  };

  const handleToggle = async (id) => {
    try {
      const res = await couponService.toggleCoupon(id);
      if (res.success) {
        setCoupons((prev) =>
          prev.map((c) => (c.id === id ? { ...c, is_active: res.is_active } : c))
        );
        showToast(res.message);
      }
    } catch (err) {
      showToast(err.response?.data?.message || err.message || 'Failed to toggle coupon', 'error');
    }
  };

  const handleDelete = async (id, code) => {
    if (!window.confirm(`Delete coupon "${code}"?`)) return;
    try {
      await couponService.deleteCoupon(id);
      setCoupons((prev) => prev.filter((c) => c.id !== id));
      showToast(`Coupon "${code}" deleted.`);
    } catch (err) {
      showToast(err.response?.data?.message || err.message || 'Failed to delete coupon', 'error');
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
              Coupons &amp; Promotional Offers
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--cream)', opacity: 0.75, margin: '4px 0 0' }}>
              Create discount codes applied during cart checkout.
            </p>
          </div>
        </div>

        <button className="gbtn" onClick={() => setModalOpen(true)}>
          + Create Coupon
        </button>
      </div>

      {/* Search Bar */}
      <div style={{ display: 'flex', gap: '10px', maxWidth: '420px' }}>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search coupon code or discount value..."
          style={{
            flex: 1,
            background: 'rgba(255,240,208,0.06)',
            border: '1px solid var(--line)',
            borderRadius: '999px',
            padding: '9px 18px',
            color: 'var(--cream)',
            fontSize: '13px',
            outline: 'none'
          }}
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            style={{
              background: 'rgba(255,240,208,0.08)',
              border: '1px solid var(--line)',
              color: 'var(--gold2)',
              borderRadius: '999px',
              padding: '0 16px',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            Clear
          </button>
        )}
      </div>

      <div style={{ background: '#1c0418', border: '1px solid var(--line)', borderRadius: '16px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: 'rgba(229,189,114,0.08)', borderBottom: '1px solid var(--line)', color: 'var(--gold)' }}>
              <th style={{ padding: '12px 16px' }}>Coupon Code</th>
              <th style={{ padding: '12px 16px' }}>Discount Value</th>
              <th style={{ padding: '12px 16px' }}>Min Order</th>
              <th style={{ padding: '12px 16px' }}>Usage / Limit</th>
              <th style={{ padding: '12px 16px' }}>Status</th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" style={{ padding: '30px', textAlign: 'center', opacity: 0.7 }}>
                  Loading coupons...
                </td>
              </tr>
            ) : coupons.filter((c) => {
                if (!search.trim()) return true;
                const q = search.toLowerCase();
                return (
                  (c.code && c.code.toLowerCase().includes(q)) ||
                  String(c.value).includes(q)
                );
              }).length > 0 ? (
              coupons
                .filter((c) => {
                  if (!search.trim()) return true;
                  const q = search.toLowerCase();
                  return (
                    (c.code && c.code.toLowerCase().includes(q)) ||
                    String(c.value).includes(q)
                  );
                })
                .map((c) => (
                <tr key={c.id} style={{ borderBottom: '1px solid rgba(229,189,114,0.1)' }}>
                  <td style={{ padding: '12px 16px', color: 'var(--gold2)', fontWeight: 700, letterSpacing: '0.08em' }}>
                    {c.code}
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--cream)' }}>
                    {c.type === 'percentage' ? `${c.value}% OFF` : `₹${c.value} FLAT OFF`}
                    {c.max_discount && ` (up to ${inr(c.max_discount)})`}
                  </td>
                  <td style={{ padding: '12px 16px', opacity: 0.85 }}>
                    {c.min_order_value > 0 ? inr(c.min_order_value) : 'No Minimum'}
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--gold)' }}>
                    {c.usage_count} / {c.usage_limit || '∞'}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <button
                      onClick={() => handleToggle(c.id)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '999px',
                        border: 0,
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 600,
                        background: c.is_active ? 'rgba(74, 222, 128, 0.2)' : 'rgba(156, 163, 175, 0.2)',
                        color: c.is_active ? '#4ade80' : '#9ca3af'
                      }}
                    >
                      {c.is_active ? '● Active' : '○ Disabled'}
                    </button>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <button
                      onClick={() => handleDelete(c.id, c.code)}
                      style={{ background: 'none', border: 0, color: '#f87171', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ padding: '30px', textAlign: 'center', opacity: 0.7 }}>
                  No coupons created yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="ov on" onClick={(e) => e.target.classList.contains('ov') && setModalOpen(false)}>
          <div className="box" style={{ maxWidth: '520px', padding: '32px' }}>
            <button className="x" aria-label="Close" onClick={() => setModalOpen(false)}>
              ×
            </button>
            <h3 style={{ fontSize: '22px', color: 'var(--gold2)', marginBottom: '16px' }}>
              Create New Promo Coupon
            </h3>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--gold)', display: 'block', marginBottom: '6px' }}>
                  Coupon Code *
                </label>
                <input
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. BRIDAL20"
                  style={{ width: '100%', background: 'rgba(255,240,208,0.06)', border: '1px solid var(--line)', padding: '10px 14px', borderRadius: '8px', color: '#fff', textTransform: 'uppercase', fontWeight: 600 }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--gold)', display: 'block', marginBottom: '6px' }}>
                    Discount Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    style={{ width: '100%', background: '#24061d', border: '1px solid var(--line)', padding: '10px 14px', borderRadius: '8px', color: '#fff' }}
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--gold)', display: 'block', marginBottom: '6px' }}>
                    Discount Value *
                  </label>
                  <input
                    required
                    type="number"
                    min="1"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    placeholder={formData.type === 'percentage' ? '15' : '1000'}
                    style={{ width: '100%', background: 'rgba(255,240,208,0.06)', border: '1px solid var(--line)', padding: '10px 14px', borderRadius: '8px', color: '#fff' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--gold)', display: 'block', marginBottom: '6px' }}>
                    Minimum Order (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.min_order_value}
                    onChange={(e) => setFormData({ ...formData, min_order_value: e.target.value })}
                    placeholder="0"
                    style={{ width: '100%', background: 'rgba(255,240,208,0.06)', border: '1px solid var(--line)', padding: '10px 14px', borderRadius: '8px', color: '#fff' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--gold)', display: 'block', marginBottom: '6px' }}>
                    Max Discount (₹ Cap)
                  </label>
                  <input
                    type="number"
                    value={formData.max_discount}
                    onChange={(e) => setFormData({ ...formData, max_discount: e.target.value })}
                    placeholder="e.g. 5000"
                    style={{ width: '100%', background: 'rgba(255,240,208,0.06)', border: '1px solid var(--line)', padding: '10px 14px', borderRadius: '8px', color: '#fff' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button type="button" onClick={() => setModalOpen(false)} style={{ padding: '10px 20px', borderRadius: '999px', border: '1px solid var(--line)', background: 'none', color: '#fff', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" className="gbtn">
                  Save Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

