import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { adminService } from '../services/api';

const inr = (n) => '₹' + Number(n).toLocaleString('en-IN');

export default function CustomerManagement({ onBack }) {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState('');
  const [toastType, setToastType] = useState('success');

  const showToast = (msg, type = 'success') => {
    setToast(msg);
    setToastType(type);
    setTimeout(() => setToast(''), 3500);
  };

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const res = await adminService.getCustomers({ search });
      if (res.success) setCustomers(res.customers);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleToggle = async (id, name, currentActive) => {
    try {
      const res = await adminService.toggleCustomerStatus(id);
      if (res.success) {
        setCustomers((prev) =>
          prev.map((c) => (c.id === id ? { ...c, is_active: res.is_active } : c))
        );
        showToast(`Customer ${name} is now ${res.is_active ? 'active' : 'blocked'}.`);
      }
    } catch (err) {
      showToast(err.response?.data?.message || err.message || 'Failed to update customer status', 'error');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
            Customer Accounts &amp; Profiles
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--cream)', opacity: 0.75, margin: '4px 0 0' }}>
            Registered customers, purchase totals, and account access permissions.
          </p>
        </div>
      </div>

      {/* Search */}
      <form onSubmit={(e) => { e.preventDefault(); loadCustomers(); }} style={{ display: 'flex', gap: '8px', maxWidth: '400px' }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by customer name or email..."
          style={{ flex: 1, background: 'rgba(255,240,208,0.06)', border: '1px solid var(--line)', padding: '10px 14px', borderRadius: '8px', color: '#fff', fontSize: '13px' }}
        />
        <button type="submit" style={{ background: 'var(--gold)', color: 'var(--ink)', border: 0, padding: '10px 18px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '13px' }}>
          Search
        </button>
      </form>

      <div style={{ background: '#1c0418', border: '1px solid var(--line)', borderRadius: '16px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: 'rgba(229,189,114,0.08)', borderBottom: '1px solid var(--line)', color: 'var(--gold)' }}>
              <th style={{ padding: '12px 16px' }}>Customer</th>
              <th style={{ padding: '12px 16px' }}>Phone</th>
              <th style={{ padding: '12px 16px' }}>Saved Address</th>
              <th style={{ padding: '12px 16px' }}>Total Orders</th>
              <th style={{ padding: '12px 16px' }}>Total Spent</th>
              <th style={{ padding: '12px 16px' }}>Status</th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={{ padding: '30px', textAlign: 'center', opacity: 0.7 }}>
                  Loading customers...
                </td>
              </tr>
            ) : customers.length > 0 ? (
              customers.map((c) => (
                <tr key={c.id} style={{ borderBottom: '1px solid rgba(229,189,114,0.1)' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <b style={{ color: 'var(--cream)', fontSize: '14px', display: 'block' }}>{c.name}</b>
                    <small style={{ color: 'var(--gold)', opacity: 0.75 }}>{c.email}</small>
                  </td>
                  <td style={{ padding: '12px 16px', opacity: 0.85 }}>
                    {c.phone || '—'}
                  </td>
                  <td style={{ padding: '12px 16px', maxWidth: '240px', color: 'var(--cream)', opacity: 0.75 }}>
                    {c.address || '—'}
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--gold2)' }}>
                    {c.orders_count || 0} orders
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--gold2)' }}>
                    {inr(c.total_spent || 0)}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ color: c.is_active ? '#4ade80' : '#f87171' }}>
                      {c.is_active ? '● Active' : '✕ Blocked'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <button
                      onClick={() => handleToggle(c.id, c.name, c.is_active)}
                      style={{
                        background: 'none',
                        border: 0,
                        color: c.is_active ? '#f87171' : '#4ade80',
                        cursor: 'pointer',
                        fontSize: '12px',
                        textDecoration: 'underline'
                      }}
                    >
                      {c.is_active ? 'Block Account' : 'Unblock Account'}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" style={{ padding: '30px', textAlign: 'center', opacity: 0.7 }}>
                  No customer accounts found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

