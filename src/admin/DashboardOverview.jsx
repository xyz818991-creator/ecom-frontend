import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { adminService } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

const inr = (n) => '₹' + Number(n).toLocaleString('en-IN');
const COLORS = ['#d4af37', '#e5bd72', '#9e1b50', '#184a3e', '#721037', '#ffdf79'];

export default function DashboardOverview({ onNavigate, onBack }) {
  const { t, isTamil } = useLanguage();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadStats = async () => {
    try {
      setLoading(true);
      const res = await adminService.getDashboardStats();
      if (res.success) {
        setData(res);
      }
    } catch (err) {
      setError(err.message || 'Failed to load analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px', color: 'var(--gold)' }}>
        Loading live store metrics...
      </div>
    );
  }

  const stats = data?.stats || {
    total_revenue: 0,
    total_orders: 0,
    pending_orders: 0,
    total_products: 0,
    low_stock_count: 0,
    total_customers: 0
  };
  const recent_orders = data?.recent_orders || [];
  const best_sellers = data?.best_sellers || [];
  const category_distribution = data?.category_distribution || [];
  const monthly_chart = data?.monthly_chart || [];

  const statCards = [
    { label: t('adminTotalRevenue', 'Total Revenue'), value: inr(stats.total_revenue || 0), icon: '💰', sub: 'All non-cancelled orders' },
    { label: t('adminTotalOrders', 'Total Orders'), value: stats.total_orders || 0, icon: '📦', sub: `${stats.pending_orders} pending fulfillment` },
    { label: t('adminTotalProducts', 'Active Products'), value: stats.total_products || 0, icon: '💎', sub: `${stats.low_stock_count} low in stock` },
    { label: t('adminActiveCustomers', 'Registered Customers'), value: stats.total_customers || 0, icon: '👥', sub: 'Verified buyers' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {error && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', padding: '12px 18px', borderRadius: '12px', fontSize: '13px' }}>
          <span>⚠️ {error}</span>
          <button onClick={loadStats} style={{ background: 'var(--gold)', color: '#1a0418', border: 'none', padding: '6px 14px', borderRadius: '999px', fontWeight: 600, fontSize: '12px', cursor: 'pointer' }}>
            Retry
          </button>
        </div>
      )}
      {/* Top Header with Back Button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
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
            <ArrowLeft size={16} /> {t('adminBack', 'Back')}
          </button>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 500, color: 'var(--gold2)', margin: 0 }}>
              Store Overview &amp; Analytics
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--cream)', opacity: 0.75, margin: '4px 0 0' }}>
              Real-time sales, order volume, and catalogue performance.
            </p>
          </div>
        </div>
      </div>
      {/* Metric Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        {statCards.map((card, idx) => (
          <div
            key={idx}
            style={{
              background: 'linear-gradient(145deg, #270620, #1b0316)',
              border: '1px solid var(--line)',
              borderRadius: '16px',
              padding: '22px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.3)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                {card.label}
              </span>
              <span style={{ fontSize: '20px' }}>{card.icon}</span>
            </div>
            <div style={{ fontSize: '26px', fontWeight: 600, color: 'var(--gold2)' }}>
              {card.value}
            </div>
            <small style={{ fontSize: '12px', color: 'var(--cream)', opacity: 0.65 }}>
              {card.sub}
            </small>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
        {/* Revenue Trend Area Chart */}
        <div style={{ background: '#1c0418', border: '1px solid var(--line)', borderRadius: '16px', padding: '24px' }}>
          <h3 style={{ fontSize: '16px', color: 'var(--gold2)', marginBottom: '16px', fontWeight: 500 }}>
            📈 Revenue Performance (Monthly)
          </h3>
          <div style={{ width: '100%', height: '240px' }}>
            <ResponsiveContainer>
              <AreaChart data={monthly_chart}>
                <defs>
                  <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d4af37" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#d4af37" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#331027" />
                <XAxis dataKey="month" stroke="#e5bd72" fontSize={12} />
                <YAxis stroke="#e5bd72" fontSize={12} tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#24061d', borderColor: '#d4af37', color: '#fff' }}
                  formatter={(val) => inr(val)}
                />
                <Area type="monotone" dataKey="revenue" stroke="#f6dda0" fillOpacity={1} fill="url(#goldGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution Chart */}
        <div style={{ background: '#1c0418', border: '1px solid var(--line)', borderRadius: '16px', padding: '24px' }}>
          <h3 style={{ fontSize: '16px', color: 'var(--gold2)', marginBottom: '16px', fontWeight: 500 }}>
            🏷️ Products by Collection
          </h3>
          <div style={{ width: '100%', height: '240px', display: 'flex', alignItems: 'center' }}>
            {category_distribution.filter((c) => Number(c.value) > 0).length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={category_distribution.filter((c) => Number(c.value) > 0)}
                    dataKey="value"
                    nameKey="name"
                    cx="38%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={75}
                    paddingAngle={3}
                  >
                    {category_distribution
                      .filter((c) => Number(c.value) > 0)
                      .map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1c0418',
                      borderColor: '#d4af37',
                      color: '#fff',
                      borderRadius: '8px',
                      fontSize: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                    }}
                    formatter={(value, name) => [`${value} piece${value > 1 ? 's' : ''}`, name]}
                  />
                  <Legend
                    layout="vertical"
                    align="right"
                    verticalAlign="middle"
                    wrapperStyle={{
                      fontSize: '11px',
                      lineHeight: '20px',
                      maxHeight: '190px',
                      overflowY: 'auto',
                      paddingLeft: '10px'
                    }}
                    formatter={(value, entry) => (
                      <span style={{ color: 'var(--cream)', opacity: 0.9 }}>
                        {value} ({entry.payload?.value || 0})
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ width: '100%', textAlign: 'center', opacity: 0.6, color: 'var(--cream)', fontSize: '13px' }}>
                No active collection pieces yet
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Orders & Best Sellers Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
        {/* Recent Orders Table */}
        <div style={{ background: '#1c0418', border: '1px solid var(--line)', borderRadius: '16px', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', color: 'var(--gold2)', fontWeight: 500 }}>
              Recent Customer Orders
            </h3>
            <button
              onClick={() => onNavigate && onNavigate('orders')}
              style={{ background: 'none', border: 0, color: 'var(--gold)', fontSize: '13px', cursor: 'pointer', textDecoration: 'underline' }}
            >
              View All Orders →
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--line)', color: 'var(--gold)', opacity: 0.8 }}>
                  <th style={{ padding: '8px' }}>Order #</th>
                  <th style={{ padding: '8px' }}>Customer</th>
                  <th style={{ padding: '8px' }}>Amount</th>
                  <th style={{ padding: '8px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {recent_orders.length > 0 ? (
                  recent_orders.map((ord) => (
                    <tr key={ord.id} style={{ borderBottom: '1px solid rgba(229,189,114,0.1)' }}>
                      <td style={{ padding: '10px 8px', color: 'var(--gold2)', fontWeight: 500 }}>
                        {ord.order_number}
                      </td>
                      <td style={{ padding: '10px 8px' }}>{ord.customer_name}</td>
                      <td style={{ padding: '10px 8px', color: 'var(--gold2)' }}>
                        {inr(ord.total_amount)}
                      </td>
                      <td style={{ padding: '10px 8px' }}>
                        <span
                          style={{
                            padding: '3px 8px',
                            borderRadius: '999px',
                            fontSize: '11px',
                            background:
                              ord.order_status === 'Delivered'
                                ? 'rgba(74, 222, 128, 0.2)'
                                : ord.order_status === 'Cancelled'
                                ? 'rgba(239, 68, 68, 0.2)'
                                : 'rgba(212, 175, 55, 0.2)',
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
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" style={{ padding: '20px', textAlign: 'center', opacity: 0.6 }}>
                      No recent orders recorded.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Product Performance */}
        <div style={{ background: '#1c0418', border: '1px solid var(--line)', borderRadius: '16px', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', color: 'var(--gold2)', fontWeight: 500 }}>
              Top Selling Pieces
            </h3>
            <button
              onClick={() => onNavigate && onNavigate('products')}
              style={{ background: 'none', border: 0, color: 'var(--gold)', fontSize: '13px', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Catalogue →
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {best_sellers.length > 0 ? (
              best_sellers.map((p, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    background: 'rgba(255,240,208,0.04)',
                    border: '1px solid rgba(229,189,114,0.1)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ color: 'var(--gold)', fontWeight: 700, fontSize: '14px' }}>#{idx + 1}</span>
                    <span style={{ fontSize: '14px', color: 'var(--cream)' }}>{p.product_name}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '13px', color: 'var(--gold2)', fontWeight: 600 }}>
                      {inr(p.total_revenue || 0)}
                    </span>
                    <small style={{ display: 'block', fontSize: '11px', opacity: 0.6 }}>
                      {p.total_sold} units sold
                    </small>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: '20px', textAlign: 'center', opacity: 0.6 }}>
                Best sellers will appear as orders are placed.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
