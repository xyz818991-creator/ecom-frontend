import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { useStore } from '../context/StoreContext';
import { orderService } from '../services/api';
import { User, Package, MapPin, Phone, Mail, LogOut, ArrowRight, ArrowLeft, Clock, CheckCircle, Eye, X, Truck, CreditCard, Settings, Globe } from 'lucide-react';
import '../EthnicEdit.css';

const inr = (n) => '₹' + Number(n).toLocaleString('en-IN');

export default function Account() {
  const { user, isAuthenticated, logout } = useAuth();
  const { cartCount } = useCart();
  const { lang, setLang, t, isTamil } = useLanguage();
  const { storeSettings, storeName } = useStore();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoadingOrders(true);
        const res = await orderService.getUserOrders();
        if (res.success && res.orders) {
          setOrders(res.orders);
        }
      } catch (err) {
        console.warn('Could not fetch user orders:', err.message);
        setOrders([]);
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated, navigate, user]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getStatusBadge = (status) => {
    const s = (status || 'pending').toLowerCase();
    switch (s) {
      case 'delivered':
        return <span style={{ padding: '4px 12px', borderRadius: '999px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', background: 'rgba(34,197,94,0.15)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.3)' }}>Delivered</span>;
      case 'shipped':
        return <span style={{ padding: '4px 12px', borderRadius: '999px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', background: 'rgba(59,130,246,0.15)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.3)' }}>Shipped</span>;
      case 'processing':
      case 'packed':
        return <span style={{ padding: '4px 12px', borderRadius: '999px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', background: 'rgba(234,179,8,0.15)', color: '#facc15', border: '1px solid rgba(234,179,8,0.3)' }}>Processing</span>;
      case 'confirmed':
        return <span style={{ padding: '4px 12px', borderRadius: '999px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', background: 'rgba(34,197,94,0.15)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.3)' }}>Confirmed</span>;
      default:
        return <span style={{ padding: '4px 12px', borderRadius: '999px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', background: 'rgba(212,175,55,0.15)', color: 'var(--gold2)', border: '1px solid var(--line)' }}>{status}</span>;
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)', color: 'var(--cream)' }}>
      {/* Navbar */}
      <header className="nav sc" style={{ position: 'sticky', top: 0, zIndex: 100 }}>
        <Link className="brand" to="/" aria-label={`${storeName} home`}>
          <span className="logo"></span>
          <span>
            <b>{storeName}</b>
            <small>{storeSettings.tagline || t('heroSubtitle', 'Tradition, Beautifully Curated.')}</small>
          </span>
        </Link>
        <nav className="menu open" style={{ display: 'flex', alignItems: 'center' }}>
          <Link to="/">{t('home', 'Home')}</Link>
          <Link to="/shop">{t('catalogue', 'Catalogue')}</Link>
          <Link to="/orders" style={{ color: 'var(--gold2)', fontWeight: 600 }}>{t('myOrders', 'My Orders')}</Link>
          <Link to="/settings">{t('settings', 'Settings')}</Link>
          <Link to="/cart">{t('bag', 'Bag')} ({cartCount})</Link>
        </nav>
        <div className="tools" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Quick Language Toggle */}
          <Link to="/settings" title={t('settings', 'Settings')} style={{ color: 'var(--gold)', display: 'flex', alignItems: 'center' }}>
            <Settings size={18} />
          </Link>

          <button onClick={handleLogout} title={t('signOut', 'Sign Out')} style={{ color: 'var(--gold)', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
            <LogOut size={16} /> {t('signOut', 'Sign Out')}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ flex: 1, maxWidth: '1140px', width: '100%', margin: '0 auto', padding: '36px 20px' }}>
        {/* Back Button */}
        <div style={{ marginBottom: '24px' }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(255,240,208,0.06)',
              border: '1px solid var(--line)',
              color: 'var(--gold2)',
              padding: '8px 16px',
              borderRadius: '999px',
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            <ArrowLeft size={16} /> {t('adminBack', 'Back')}
          </button>
        </div>

        {/* Profile Card */}
        <div style={{ background: 'linear-gradient(160deg, #320726, #200318)', border: '1px solid var(--line)', borderRadius: '24px', padding: '32px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'linear-gradient(135deg, #f6dda0, #d4af37)', display: 'grid', placeItems: 'center', color: '#1a0418', fontSize: '28px', fontWeight: 'bold' }}>
              {user?.name ? user.name.charAt(0).toUpperCase() : 'P'}
            </div>
            <div>
              <div className="kick" style={{ color: 'var(--gold2)', fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '4px' }}>
                {isTamil ? 'சரிபார்க்கப்பட்ட வாடிக்கையாளர்' : 'Verified Patron'}
              </div>
              <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', color: 'var(--gold2)', margin: '0 0 6px' }}>
                {user?.name || (isTamil ? 'வாடிக்கையாளர்' : 'Customer')}
              </h1>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px', opacity: 0.85 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Mail size={13} style={{ color: 'var(--gold)' }} /> {user?.email}
                </span>
                {user?.phone && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Phone size={13} style={{ color: 'var(--gold)' }} /> {user?.phone}
                  </span>
                )}
              </div>
              <Link
                to="/settings"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginTop: '12px',
                  padding: '7px 16px',
                  borderRadius: '999px',
                  border: '1px solid var(--gold)',
                  background: 'rgba(212,175,55,0.12)',
                  color: 'var(--gold2)',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  transition: 'all 0.2s'
                }}
              >
                <Settings size={14} /> {t('settings', 'Settings & Edit Profile')}
              </Link>
            </div>
          </div>

          <div style={{ background: 'rgba(255,240,208,0.03)', border: '1px solid rgba(212,175,55,0.15)', borderRadius: '16px', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--gold2)', fontSize: '14px', fontWeight: 600, marginBottom: '6px' }}>
              <Package size={16} /> Quick Order Tracking
            </div>
            <p style={{ fontSize: '12px', opacity: 0.8, marginBottom: '12px' }}>
              Enter your tracking code or order number to inspect shipment progress:
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const code = e.target.elements.ordNum.value.trim();
                if (code) navigate(`/track-order/${code}`);
              }}
              style={{ display: 'flex', gap: '8px' }}
            >
              <input
                name="ordNum"
                required
                placeholder="e.g. TEE-2026-8821"
                style={{ flex: 1, padding: '10px 14px', borderRadius: '12px', background: 'rgba(255,240,208,0.06)', border: '1px solid var(--line)', color: '#fff', fontSize: '13px' }}
              />
              <button type="submit" className="gbtn" style={{ padding: '10px 18px', fontSize: '13px' }}>
                Track
              </button>
            </form>
          </div>
        </div>

        {/* Orders Section */}
        <div style={{ marginTop: '44px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '28px', color: 'var(--gold2)', margin: 0 }}>
              Order History &amp; Preservations
            </h2>
            <span style={{ fontSize: '13px', opacity: 0.7 }}>
              {orders.length} {orders.length === 1 ? 'Order' : 'Orders'} Placed
            </span>
          </div>

          {loadingOrders ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--gold)', opacity: 0.8 }}>
              Loading your curated orders...
            </div>
          ) : orders.length === 0 ? (
            <div style={{ background: 'linear-gradient(160deg, #320726, #200318)', border: '1px solid var(--line)', borderRadius: '20px', padding: '48px 24px', textAlign: 'center' }}>
              <Package size={44} style={{ color: 'var(--gold)', opacity: 0.6, marginBottom: '14px' }} />
              <h3 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '22px', color: 'var(--gold2)', marginBottom: '8px' }}>
                No Orders Yet
              </h3>
              <p style={{ fontSize: '14px', opacity: 0.8, maxWidth: '440px', margin: '0 auto 24px' }}>
                Your jewellery chest is awaiting its first heirloom piece. Explore our handcrafted collections today.
              </p>
              <Link to="/shop" className="gbtn">
                Shop the Edit →
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {orders.map((ord) => (
                <div
                  key={ord.id}
                  style={{
                    background: 'linear-gradient(160deg, #2f0724, #1c0316)',
                    border: '1px solid var(--line)',
                    borderRadius: '18px',
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid rgba(212,175,55,0.15)', paddingBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 600, color: 'var(--gold2)', fontSize: '15px', letterSpacing: '0.04em' }}>
                        #{ord.order_number}
                      </span>
                      <span style={{ fontSize: '13px', opacity: 0.7, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={14} /> {new Date(ord.createdAt || ord.created_at || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      {getStatusBadge(ord.order_status || ord.status)}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '17px', fontWeight: 600, color: 'var(--gold2)' }}>
                        {inr(ord.total_amount)}
                      </span>
                      <button
                        onClick={() => setSelectedOrder(ord)}
                        style={{
                          padding: '6px 14px',
                          borderRadius: '8px',
                          border: '1px solid var(--gold2)',
                          background: 'rgba(212,175,55,0.12)',
                          color: 'var(--gold2)',
                          fontSize: '12px',
                          fontWeight: 500,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <Eye size={13} /> View Order Details
                      </button>
                      <Link
                        to={`/track-order/${ord.order_number}`}
                        style={{
                          padding: '6px 14px',
                          borderRadius: '8px',
                          border: '1px solid var(--line)',
                          color: 'var(--cream)',
                          fontSize: '12px',
                          textDecoration: 'none',
                          fontWeight: 500,
                          transition: 'all 0.2s'
                        }}
                      >
                        Track Shipment →
                      </Link>
                    </div>
                  </div>

                  {ord.items && ord.items.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {ord.items.map((it, idx) => {
                        const img = it.image_url;
                        const isCss = img && img.startsWith('var(');
                        const bg = isCss ? img : img ? `url("${encodeURI(img)}")` : 'var(--i-neck)';

                        return (
                          <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '14px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div
                                style={{
                                  width: '42px',
                                  height: '42px',
                                  borderRadius: '8px',
                                  backgroundImage: bg,
                                  backgroundColor: '#24061d',
                                  backgroundSize: 'cover',
                                  backgroundPosition: 'center',
                                  border: '1px solid var(--line)'
                                }}
                              />
                              <div>
                                <span style={{ fontWeight: 500 }}>{it.product_name}</span>
                                <span style={{ fontSize: '12px', opacity: 0.7, marginLeft: '8px' }}>
                                  Qty: {it.quantity}
                                </span>
                              </div>
                            </div>
                            <span style={{ fontWeight: 500 }}>{inr((it.price || it.unit_price) * it.quantity)}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(8px)',
            zIndex: 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setSelectedOrder(null)}
        >
          <div
            style={{
              background: 'linear-gradient(160deg, #3a0b2d, #230419)',
              border: '1px solid var(--gold)',
              borderRadius: '24px',
              maxWidth: '680px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '32px',
              boxShadow: '0 24px 64px rgba(0,0,0,0.8)',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedOrder(null)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'rgba(255,255,255,0.1)',
                border: 0,
                color: '#fff',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'grid',
                placeItems: 'center',
                cursor: 'pointer'
              }}
            >
              <X size={18} />
            </button>

            <div className="kick" style={{ color: 'var(--gold2)', fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '6px' }}>
              Order Specifications
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
              <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '28px', color: 'var(--gold2)', margin: 0 }}>
                #{selectedOrder.order_number}
              </h2>
              {getStatusBadge(selectedOrder.order_status || selectedOrder.status)}
            </div>

            {/* Meta details */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', background: 'rgba(255,240,208,0.04)', border: '1px solid var(--line)', borderRadius: '16px', padding: '16px', marginBottom: '24px', fontSize: '13px' }}>
              <div>
                <span style={{ color: 'var(--gold)', display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
                  Recipient
                </span>
                <b>{selectedOrder.customer_name || selectedOrder.recipient_name || user?.name}</b>
                <div style={{ opacity: 0.8, fontSize: '12px' }}>{selectedOrder.customer_phone || selectedOrder.recipient_phone || user?.phone}</div>
              </div>
              <div>
                <span style={{ color: 'var(--gold)', display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
                  Payment Method
                </span>
                <b style={{ textTransform: 'uppercase' }}>{selectedOrder.payment_method || 'COD'}</b>
                <div style={{ opacity: 0.8, fontSize: '12px' }}>Status: Confirmed</div>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <span style={{ color: 'var(--gold)', display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
                  Delivery Address
                </span>
                <span style={{ opacity: 0.9 }}>{selectedOrder.shipping_address}</span>
              </div>
            </div>

            {/* Items list */}
            <h4 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '20px', color: 'var(--gold2)', marginBottom: '12px' }}>
              Purchased Jewellery Pieces
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              {selectedOrder.items?.map((it, idx) => {
                const img = it.image_url;
                const isCss = img && img.startsWith('var(');
                const bg = isCss ? img : img ? `url("${encodeURI(img)}")` : 'var(--i-neck)';

                return (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'rgba(255,240,208,0.02)', border: '1px solid var(--line)', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '10px', backgroundImage: bg, backgroundSize: 'cover', backgroundPosition: 'center', border: '1px solid var(--line)' }} />
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--cream)', fontSize: '14px' }}>{it.product_name}</div>
                        <div style={{ fontSize: '12px', opacity: 0.75 }}>Quantity: {it.quantity} × {inr(it.price || it.unit_price)}</div>
                      </div>
                    </div>
                    <span style={{ fontWeight: 600, color: 'var(--gold2)' }}>
                      {inr((it.price || it.unit_price) * it.quantity)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Price breakdown */}
            <div style={{ borderTop: '1px solid var(--line)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', opacity: 0.85 }}>
                <span>Subtotal</span>
                <span>{inr(selectedOrder.subtotal || selectedOrder.total_amount)}</span>
              </div>
              {parseFloat(selectedOrder.discount || 0) > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4ade80' }}>
                  <span>Festival Discount</span>
                  <span>- {inr(selectedOrder.discount)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', opacity: 0.85 }}>
                <span>Complimentary Insured Delivery</span>
                <span style={{ color: '#4ade80' }}>FREE</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 'bold', color: 'var(--gold2)', borderTop: '1px solid var(--line)', paddingTop: '10px', marginTop: '6px' }}>
                <span>Total Paid</span>
                <span>{inr(selectedOrder.total_amount)}</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <Link
                to={`/track-order/${selectedOrder.order_number}`}
                className="gbtn"
                style={{ flex: 1, textAlign: 'center', justifyContent: 'center' }}
              >
                Track Live Shipment →
              </Link>
              <button
                onClick={() => setSelectedOrder(null)}
                style={{ padding: '12px 24px', borderRadius: '999px', border: '1px solid var(--line)', color: 'var(--cream)', background: 'none', cursor: 'pointer' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Standard Footer with Powered by Aminoid */}
      <footer style={{ marginTop: 'auto', borderTop: '1px solid var(--line)', padding: '24px', background: 'var(--panel)', fontSize: '13px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <span>© {new Date().getFullYear()} {storeName}. All rights reserved.</span>
          <span>
            Powered by{' '}
            <a href="https://www.aminoid.in/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--gold2)', textDecoration: 'underline', fontWeight: 500 }}>
              Aminoid
            </a>
          </span>
          <div style={{ display: 'flex', gap: '16px' }}>
            <Link to="/shop" style={{ color: 'var(--gold)', textDecoration: 'none' }}>Catalogue</Link>
            <Link to="/cart" style={{ color: 'var(--gold)', textDecoration: 'none' }}>Shopping Bag</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
