import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { adminService } from '../services/api';

export default function InventoryManagement({ onBack }) {
  const [data, setData] = useState({ products: [], transactions: [] });
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [adjustType, setAdjustType] = useState('IN');
  const [adjustQty, setAdjustQty] = useState('');
  const [adjustReason, setAdjustReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [toastType, setToastType] = useState('success');

  const showToast = (msg, type = 'success') => {
    setToast(msg);
    setToastType(type);
    setTimeout(() => setToast(''), 3500);
  };

  const loadInventory = async () => {
    try {
      setLoading(true);
      const res = await adminService.getInventory();
      if (res.success) {
        setData({ products: res.products || [], transactions: res.transactions || [] });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const handleAdjustSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProduct || !adjustQty) return;
    setSaving(true);
    try {
      const res = await adminService.adjustStock({
        product_id: selectedProduct.id,
        adjustment_type: adjustType,
        quantity: parseInt(adjustQty, 10),
        reason: adjustReason
      });
      if (res.success) {
        showToast(res.message);
        setSelectedProduct(null);
        setAdjustQty('');
        setAdjustReason('');
        loadInventory();
      }
    } catch (err) {
      showToast(err.response?.data?.message || err.message || 'Failed to adjust stock', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {toast && (
        <div style={{ position: 'fixed', top: '84px', right: '28px', background: toastType === 'error' ? 'rgba(239,68,68,0.95)' : 'linear-gradient(135deg, #f6dda0, #d4af37)', color: toastType === 'error' ? '#fff' : '#1a0418', padding: '12px 22px', borderRadius: '999px', fontWeight: 600, fontSize: '14px', zIndex: 9999, border: toastType === 'error' ? '1px solid #fca5a5' : 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
          {toastType === 'error' ? '⚠ ' : '✓ '} {toast}
        </div>
      )}

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
            Inventory &amp; Stock Management
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--cream)', opacity: 0.75, margin: '4px 0 0' }}>
            Monitor stock availability, low-stock warnings, and historical stock adjustments.
          </p>
        </div>
      </div>

      {/* Stock Overview Table */}
      <div style={{ background: '#1c0418', border: '1px solid var(--line)', borderRadius: '16px', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between' }}>
          <h3 style={{ fontSize: '16px', color: 'var(--gold2)', fontWeight: 500 }}>
            Live Stock Level Overview
          </h3>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: 'rgba(229,189,114,0.08)', borderBottom: '1px solid var(--line)', color: 'var(--gold)' }}>
              <th style={{ padding: '12px 16px' }}>Product</th>
              <th style={{ padding: '12px 16px' }}>Collection</th>
              <th style={{ padding: '12px 16px' }}>SKU</th>
              <th style={{ padding: '12px 16px' }}>Current Stock</th>
              <th style={{ padding: '12px 16px' }}>Status</th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>Stock Adjustment</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" style={{ padding: '30px', textAlign: 'center', opacity: 0.7 }}>
                  Loading inventory...
                </td>
              </tr>
            ) : data.products.map((p) => (
              <tr key={p.id} style={{ borderBottom: '1px solid rgba(229,189,114,0.1)' }}>
                <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--cream)' }}>
                  {p.name}
                </td>
                <td style={{ padding: '12px 16px', opacity: 0.8 }}>
                  {p.category?.name || '—'}
                </td>
                <td style={{ padding: '12px 16px', color: 'var(--gold)', fontFamily: 'monospace' }}>
                  {p.sku || '—'}
                </td>
                <td style={{ padding: '12px 16px', fontWeight: 600, color: p.stock <= 5 ? '#fca5a5' : 'var(--gold2)' }}>
                  {p.stock} units
                </td>
                <td style={{ padding: '12px 16px' }}>
                  {p.stock === 0 ? (
                    <span style={{ color: '#f87171', fontSize: '12px' }}>● Out of Stock</span>
                  ) : p.stock <= 5 ? (
                    <span style={{ color: '#f59e0b', fontSize: '12px' }}>⚠ Low Stock Alert</span>
                  ) : (
                    <span style={{ color: '#4ade80', fontSize: '12px' }}>✓ Healthy</span>
                  )}
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                  <button
                    onClick={() => setSelectedProduct(p)}
                    style={{ background: 'rgba(229,189,114,0.12)', border: '1px solid var(--gold)', color: 'var(--gold2)', padding: '5px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}
                  >
                    Adjust Stock ±
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Adjust Stock Modal */}
      {selectedProduct && (
        <div className="ov on" onClick={(e) => e.target.classList.contains('ov') && setSelectedProduct(null)}>
          <div className="box" style={{ maxWidth: '480px', padding: '32px' }}>
            <button className="x" aria-label="Close" onClick={() => setSelectedProduct(null)}>
              ×
            </button>
            <h3 style={{ fontSize: '20px', color: 'var(--gold2)', marginBottom: '6px' }}>
              Adjust Inventory: {selectedProduct.name}
            </h3>
            <p style={{ fontSize: '13px', opacity: 0.8, marginBottom: '20px' }}>
              Current stock on record: <b>{selectedProduct.stock}</b>
            </p>

            <form onSubmit={handleAdjustSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--gold)', display: 'block', marginBottom: '6px' }}>
                  Adjustment Type
                </label>
                <select
                  value={adjustType}
                  onChange={(e) => setAdjustType(e.target.value)}
                  style={{ width: '100%', background: '#24061d', border: '1px solid var(--line)', padding: '10px 14px', borderRadius: '8px', color: '#fff' }}
                >
                  <option value="IN">+ Add Stock (Stock In / Replenishment)</option>
                  <option value="OUT">- Deduct Stock (Damage / Manual Sale)</option>
                  <option value="ADJUSTMENT">= Set Exact Quantity</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--gold)', display: 'block', marginBottom: '6px' }}>
                  Quantity
                </label>
                <input
                  required
                  type="number"
                  min="1"
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(e.target.value)}
                  placeholder="e.g. 5"
                  style={{ width: '100%', background: 'rgba(255,240,208,0.06)', border: '1px solid var(--line)', padding: '10px 14px', borderRadius: '8px', color: '#fff' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--gold)', display: 'block', marginBottom: '6px' }}>
                  Reason for Adjustment
                </label>
                <input
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="e.g. Received new bridal batch from artisans"
                  style={{ width: '100%', background: 'rgba(255,240,208,0.06)', border: '1px solid var(--line)', padding: '10px 14px', borderRadius: '8px', color: '#fff' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setSelectedProduct(null)} style={{ padding: '10px 20px', borderRadius: '999px', border: '1px solid var(--line)', background: 'none', color: '#fff', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" className="gbtn" disabled={saving}>
                  {saving ? 'Updating...' : 'Confirm Adjustment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock Transaction History */}
      <div style={{ background: '#1c0418', border: '1px solid var(--line)', borderRadius: '16px', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)' }}>
          <h3 style={{ fontSize: '16px', color: 'var(--gold2)', fontWeight: 500 }}>
            Recent Inventory Movement History
          </h3>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: 'rgba(229,189,114,0.08)', borderBottom: '1px solid var(--line)', color: 'var(--gold)' }}>
              <th style={{ padding: '10px 16px' }}>Date</th>
              <th style={{ padding: '10px 16px' }}>Product</th>
              <th style={{ padding: '10px 16px' }}>Type</th>
              <th style={{ padding: '10px 16px' }}>Quantity</th>
              <th style={{ padding: '10px 16px' }}>Reason</th>
              <th style={{ padding: '10px 16px' }}>Logged By</th>
            </tr>
          </thead>
          <tbody>
            {data.transactions.length > 0 ? (
              data.transactions.map((tr) => (
                <tr key={tr.id} style={{ borderBottom: '1px solid rgba(229,189,114,0.1)' }}>
                  <td style={{ padding: '10px 16px', opacity: 0.75 }}>
                    {new Date(tr.createdAt).toLocaleString()}
                  </td>
                  <td style={{ padding: '10px 16px', color: 'var(--cream)', fontWeight: 500 }}>
                    {tr.Product?.name || '—'}
                  </td>
                  <td style={{ padding: '10px 16px' }}>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 700,
                        background: tr.type === 'IN' ? 'rgba(74,222,128,0.2)' : 'rgba(239,68,68,0.2)',
                        color: tr.type === 'IN' ? '#4ade80' : '#fca5a5'
                      }}
                    >
                      {tr.type}
                    </span>
                  </td>
                  <td style={{ padding: '10px 16px', fontWeight: 600, color: 'var(--gold2)' }}>
                    {tr.quantity}
                  </td>
                  <td style={{ padding: '10px 16px', opacity: 0.8 }}>
                    {tr.reason || '—'}
                  </td>
                  <td style={{ padding: '10px 16px', opacity: 0.65 }}>
                    {tr.created_by}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ padding: '24px', textAlign: 'center', opacity: 0.6 }}>
                  No stock transactions logged yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

