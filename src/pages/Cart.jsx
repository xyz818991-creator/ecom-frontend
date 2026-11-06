import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useStore } from '../context/StoreContext';
import { couponService } from '../services/api';
import { Trash2, ArrowRight, ArrowLeft, Tag, ShoppingBag, ShieldCheck, Globe, Settings } from 'lucide-react';
import '../EthnicEdit.css';

const inr = (n) => '₹' + Number(n).toLocaleString('en-IN');

export default function Cart() {
  const { cartItems, cartSubtotal, updateQuantity, clearCart, applyCouponCode } = useCart();
  const { isAuthenticated } = useAuth();
  const { lang, setLang, t, isTamil } = useLanguage();
  const { storeSettings, storeName } = useStore();
  const navigate = useNavigate();

  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    setCouponError('');
    const code = couponCode.trim().toUpperCase();
    if (!code) return;

    try {
      const res = await applyCouponCode(code);
      if (res.success) {
        setCouponDiscount(res.discount || 0);
        setAppliedCoupon(code);
        setCouponError('');
      } else {
        setCouponError(res.message || 'Invalid or expired coupon code.');
      }
    } catch (err) {
      setCouponError(err.response?.data?.message || err.message || 'Coupon code could not be verified.');
    }
  };

  const finalTotal = Math.max(0, cartSubtotal - couponDiscount);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)', color: 'var(--cream)' }}>
      {/* Header */}
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
          <span style={{ color: 'var(--gold2)', fontWeight: 600 }}>{t('bag', 'Bag')}</span>
          {isAuthenticated && <Link to="/orders">{t('myOrders', 'My Orders')}</Link>}
          {isAuthenticated && <Link to="/settings">{t('settings', 'Settings')}</Link>}
        </nav>
        <div className="tools" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {isAuthenticated && (
            <Link to="/settings" title={t('settings', 'Settings')} style={{ color: 'var(--gold)', display: 'flex', alignItems: 'center' }}>
              <Settings size={18} />
            </Link>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main style={{ flex: 1, maxWidth: '1100px', width: '100%', margin: '0 auto', padding: '36px 20px' }}>
        <div style={{ marginBottom: '28px' }}>
          <Link to="/shop" style={{ color: 'var(--gold)', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none', marginBottom: '8px' }}>
            <ArrowLeft size={14} /> {t('adminBack', 'Back')}
          </Link>
          <h1 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '36px', color: 'var(--gold2)', margin: 0 }}>
            {t('shoppingBag', 'Your Shopping Bag')}
          </h1>
        </div>

        {cartItems.length === 0 ? (
          <div style={{ background: 'linear-gradient(160deg, #320726, #200318)', border: '1px solid var(--line)', borderRadius: '24px', padding: '60px 24px', textAlign: 'center' }}>
            <ShoppingBag size={54} style={{ color: 'var(--gold)', opacity: 0.5, marginBottom: '16px' }} />
            <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '26px', color: 'var(--gold2)', marginBottom: '8px' }}>
              Your bag is currently empty
            </h2>
            <p style={{ opacity: 0.8, maxWidth: '420px', margin: '0 auto 28px', fontSize: '14px' }}>
              Explore our curated South Indian temple jewellery, heirloom chokers, and handcrafted bridal pieces.
            </p>
            <Link to="/shop" className="gbtn">
              {t('startShopping', 'Explore Collections')} <ArrowRight size={14} style={{ marginLeft: '4px' }} />
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px', alignItems: 'start' }}>
            {/* Items List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {cartItems.map((item) => {
                const img = item.image_url;
                const isCss = img && img.startsWith('var(');
                const bg = isCss ? img : img ? `url("${encodeURI(img)}")` : 'var(--i-neck)';

                return (
                  <div
                    key={item.id}
                    style={{
                      background: 'linear-gradient(160deg, #320726, #200318)',
                      border: '1px solid var(--line)',
                      borderRadius: '18px',
                      padding: '20px',
                      display: 'flex',
                      gap: '16px',
                      alignItems: 'center'
                    }}
                  >
                    <div
                      style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '12px',
                        backgroundImage: bg,
                        backgroundColor: '#24061d',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        flexShrink: 0,
                        border: '1px solid var(--line)'
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: '0 0 4px', fontSize: '16px', fontFamily: '"Cormorant Garamond", serif', color: 'var(--gold2)' }}>
                        {item.name}
                      </h3>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff', marginBottom: '10px' }}>
                        {inr(item.price)}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', background: 'rgba(255,240,208,0.06)', border: '1px solid var(--line)', borderRadius: '8px' }}>
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            style={{ padding: '4px 10px', background: 'transparent', border: 0, color: 'var(--gold)', cursor: 'pointer', fontSize: '15px' }}
                          >
                            −
                          </button>
                          <span style={{ padding: '0 8px', fontSize: '13px', fontWeight: 600 }}>{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            style={{ padding: '4px 10px', background: 'transparent', border: 0, color: 'var(--gold)', cursor: 'pointer', fontSize: '15px' }}
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => updateQuantity(item.id, -item.quantity)}
                          style={{ background: 'transparent', border: 0, color: '#f87171', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}
                        >
                          <Trash2 size={14} /> Remove
                        </button>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', fontWeight: 600, fontSize: '16px', color: 'var(--gold2)' }}>
                      {inr(item.price * item.quantity)}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary Box */}
            <div style={{ background: 'linear-gradient(160deg, #3a0b2d, #230419)', border: '1px solid var(--line)', borderRadius: '20px', padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '22px', color: 'var(--gold2)', margin: 0 }}>
                Order Summary
              </h2>

              {/* Coupon Form */}
              <form onSubmit={handleApplyCoupon} style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="Coupon code (e.g. WELCOME10)"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  style={{ flex: 1, padding: '10px 14px', borderRadius: '10px', background: 'rgba(255,240,208,0.06)', border: '1px solid var(--line)', color: '#fff', fontSize: '13px', textTransform: 'uppercase' }}
                />
                <button type="submit" className="gbtn" style={{ padding: '10px 16px', fontSize: '13px' }}>
                  Apply
                </button>
              </form>

              {appliedCoupon && (
                <div style={{ fontSize: '12px', color: '#4ade80', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Tag size={13} /> Coupon <b>{appliedCoupon}</b> applied successfully!
                </div>
              )}
              {couponError && (
                <div style={{ fontSize: '12px', color: '#f87171' }}>
                  {couponError}
                </div>
              )}

              {/* Line items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', borderTop: '1px solid var(--line)', paddingTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ opacity: 0.8 }}>Subtotal</span>
                  <span>{inr(cartSubtotal)}</span>
                </div>
                {couponDiscount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4ade80' }}>
                    <span>Coupon Discount</span>
                    <span>- {inr(couponDiscount)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ opacity: 0.8 }}>Shipping &amp; Insurance</span>
                  <span style={{ color: '#4ade80' }}>Complimentary (Free)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--line)', paddingTop: '14px', fontSize: '18px', fontWeight: 600, color: 'var(--gold2)' }}>
                  <span>Total Amount</span>
                  <span>{inr(finalTotal)}</span>
                </div>
              </div>

              <button
                className="gbtn"
                style={{ justifyContent: 'center', padding: '14px 20px', fontSize: '15px' }}
                onClick={() => navigate('/checkout', { state: { couponDiscount, appliedCoupon } })}
              >
                {t('proceedToCheckout', 'Proceed to Checkout')} →
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', opacity: 0.7, justifyContent: 'center' }}>
                <ShieldCheck size={15} style={{ color: 'var(--gold)' }} />
                <span>100% Genuine Certified Jewellery &amp; Insured Shipping</span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{ marginTop: 'auto', borderTop: '1px solid var(--line)', padding: '24px', background: 'var(--panel)', fontSize: '13px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <span>© {new Date().getFullYear()} {storeName}. All rights reserved.</span>
          <span>
            Powered by{' '}
            <a href="https://www.aminoid.in/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--gold2)', textDecoration: 'underline', fontWeight: 500 }}>
              Aminoid
            </a>
          </span>
          
        </div>
      </footer>
    </div>
  );
}
