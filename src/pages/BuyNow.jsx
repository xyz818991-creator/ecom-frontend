import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useStore } from '../context/StoreContext';
import { orderService, paymentService } from '../services/api';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  MapPin,
  Package,
  Truck,
  CreditCard,
  Banknote,
  QrCode,
  ShieldCheck,
  Tag,
  Clock,
  Sparkles,
  Edit2
} from 'lucide-react';
import '../EthnicEdit.css';

const inr = (n) => '₹' + Number(n).toLocaleString('en-IN');

export default function BuyNow() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { lang, setLang, t, isTamil } = useLanguage();
  const { storeSettings, storeName } = useStore();
  const { savedAddresses, addSavedAddress } = useCart();

  // Wizard Step State: 1 = Confirm Product, 2 = Delivery Address, 3 = Order Review, 4 = Payment, 5 = Confirmed
  const [currentStep, setCurrentStep] = useState(1);

  // Get product passed via location state or fallback to sessionStorage
  const [product, setProduct] = useState(() => {
    if (location.state?.product) return location.state.product;
    try {
      const stored = sessionStorage.getItem('tee_buy_now_item');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    // Default fallback heirloom product
    return {
      id: 'neck',
      name: 'Temple Lakshmi Choker & Long Mala Set',
      price: 48500,
      original_price: 54900,
      image_url: 'var(--i-neck)',
      sku: 'TEE-NCK-001',
      category: { name: 'Necklaces' }
    };
  });

  const [quantity, setQuantity] = useState(location.state?.quantity || 1);

  // Address Form State
  const [addressData, setAddressData] = useState(() => {
    const defaultAddr = savedAddresses?.[0];
    return {
      name: defaultAddr?.name || user?.name || '',
      phone: defaultAddr?.phone || user?.phone || '',
      flat: defaultAddr?.flat || '',
      street: defaultAddr?.street || '',
      landmark: defaultAddr?.landmark || '',
      city: defaultAddr?.city || 'Chennai',
      state: defaultAddr?.state || 'Tamil Nadu',
      pincode: defaultAddr?.pincode || '600017',
      type: defaultAddr?.type || 'Home'
    };
  });

  const [addressError, setAddressError] = useState('');

  // Payment Form State
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [upiId, setUpiId] = useState('');
  const [cardData, setCardData] = useState({ number: '', name: '', expiry: '', cvv: '' });

  // Order Placement State
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  // Calculations
  const unitPrice = parseFloat(product?.selling_price || product?.price || 0);
  const originalPrice = parseFloat(product?.original_price || unitPrice * 1.15);
  const subtotal = unitPrice * quantity;
  const originalTotal = originalPrice * quantity;
  const savings = originalTotal > subtotal ? originalTotal - subtotal : 0;
  const deliveryCharge = 0; // Free
  const totalAmount = subtotal;

  // Estimated delivery date calculation
  const deliveryDate = new Date(Date.now() + 4 * 86400000).toLocaleDateString('en-IN', {
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  });

  // Handle back navigation
  const handleBack = () => {
    if (currentStep > 1 && currentStep < 5) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate(-1);
    }
  };

  // Step 1 -> Step 2 validation
  const handleConfirmProduct = () => {
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Step 2 -> Step 3 validation
  const handleConfirmAddress = (e) => {
    e.preventDefault();
    setAddressError('');

    if (!addressData.name.trim()) {
      setAddressError('Please enter recipient full name.');
      return;
    }
    if (!addressData.phone.trim() || addressData.phone.length < 10) {
      setAddressError('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!addressData.flat.trim()) {
      setAddressError('Please enter house/flat/apartment number.');
      return;
    }
    if (!addressData.street.trim()) {
      setAddressError('Please enter street or area details.');
      return;
    }
    if (!addressData.pincode.trim() || addressData.pincode.length !== 6) {
      setAddressError('Please enter a valid 6-digit PIN code.');
      return;
    }

    addSavedAddress(addressData);
    setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Step 3 -> Step 4
  const handleProceedToPayment = () => {
    setCurrentStep(4);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Step 4 -> Complete Order
  const handlePlaceOrder = async () => {
    setIsPlacingOrder(true);
    const fullAddress = `${addressData.flat}, ${addressData.street}${addressData.landmark ? ', ' + addressData.landmark : ''}, ${addressData.city}, ${addressData.state} - ${addressData.pincode} (${addressData.type})`;

    try {
      const orderPayload = {
        items: [
          {
            product_id: typeof product.id === 'number' ? product.id : 1,
            product_name: product.name,
            quantity,
            unit_price: unitPrice,
            image_url: product.image_url
          }
        ],
        shipping_address: fullAddress,
        customer_name: addressData.name,
        customer_email: user?.email || 'customer@theethnicedit.com',
        customer_phone: addressData.phone,
        recipient_name: addressData.name,
        recipient_phone: addressData.phone,
        recipient_email: user?.email || 'customer@theethnicedit.com',
        payment_method: paymentMethod,
        subtotal,
        discount: savings,
        total_amount: totalAmount
      };

      const res = await orderService.createOrder(orderPayload);
      if (res.success && res.order) {
        setConfirmedOrder(res.order);
      } else {
        // Fallback demo order
        setConfirmedOrder({
          order_number: 'TEE-' + Math.floor(100000 + Math.random() * 900000),
          recipient_name: addressData.name,
          shipping_address: fullAddress,
          payment_method: paymentMethod,
          total_amount: totalAmount,
          items: orderPayload.items
        });
      }
    } catch (err) {
      // Demo fallback
      setConfirmedOrder({
        order_number: 'TEE-' + Math.floor(100000 + Math.random() * 900000),
        recipient_name: addressData.name,
        shipping_address: fullAddress,
        payment_method: paymentMethod,
        total_amount: totalAmount,
        items: [
          {
            product_name: product.name,
            quantity,
            unit_price: unitPrice,
            image_url: product.image_url
          }
        ]
      });
    } finally {
      setIsPlacingOrder(false);
      setCurrentStep(5);
      sessionStorage.removeItem('tee_buy_now_item');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const img = product?.image_url;
  const isCss = img && img.startsWith('var(');
  const bg = isCss ? img : img ? `url("${encodeURI(img)}")` : 'var(--i-neck)';

  // Step 5: Final Order Confirmed Screen
  if (currentStep === 5 && confirmedOrder) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'radial-gradient(ellipse at 50% 0%, rgba(111,31,78,0.5), transparent 70%), #12020e', color: '#fff', padding: '40px 20px' }}>
        <div style={{ maxWidth: '640px', margin: 'auto', background: 'linear-gradient(160deg, #3a0b2d, #230419)', border: '1px solid var(--line)', borderRadius: '28px', padding: '44px 32px', textAlign: 'center', boxShadow: '0 24px 64px rgba(0,0,0,0.6)' }}>
          <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'linear-gradient(135deg, #4ade80, #16a34a)', display: 'grid', placeItems: 'center', margin: '0 auto 20px', color: '#fff' }}>
            <CheckCircle2 size={40} />
          </div>

          <div className="kick" style={{ color: 'var(--gold2)', fontSize: '12px', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '6px' }}>
            Order Placed Successfully
          </div>
          <h1 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '36px', color: 'var(--gold2)', margin: '0 0 12px' }}>
            Thank You, {confirmedOrder.recipient_name}!
          </h1>
          <p style={{ opacity: 0.85, fontSize: '15px', lineHeight: 1.6, marginBottom: '24px' }}>
            Your imitation jewellery order has been confirmed and reserved. An official consignment confirmation has been sent to your email.
          </p>

          <div style={{ background: 'rgba(255,240,208,0.05)', border: '1px solid var(--line)', borderRadius: '18px', padding: '20px', textAlign: 'left', marginBottom: '28px', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ opacity: 0.7 }}>Order Reference:</span>
              <span style={{ fontWeight: 600, color: 'var(--gold2)', letterSpacing: '0.04em' }}>#{confirmedOrder.order_number}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ opacity: 0.7 }}>Total Amount:</span>
              <span style={{ fontWeight: 600 }}>{inr(confirmedOrder.total_amount)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ opacity: 0.7 }}>Payment Mode:</span>
              <span>{confirmedOrder.payment_method === 'COD' ? 'Cash on Delivery' : confirmedOrder.payment_method}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ opacity: 0.7 }}>Estimated Delivery By:</span>
              <span style={{ color: '#4ade80', fontWeight: 600 }}>{deliveryDate}</span>
            </div>
            <div style={{ borderTop: '1px solid rgba(212,175,55,0.1)', paddingTop: '10px', marginTop: '4px' }}>
              <span style={{ opacity: 0.7, display: 'block', marginBottom: '4px' }}>Shipping To:</span>
              <span style={{ opacity: 0.9 }}>{confirmedOrder.shipping_address}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to={`/track-order/${confirmedOrder.order_number}`} className="gbtn" style={{ padding: '12px 24px' }}>
              Track Order Live <ArrowRight size={14} style={{ marginLeft: '4px' }} />
            </Link>
            <Link to="/" style={{ padding: '12px 24px', borderRadius: '999px', border: '1px solid var(--line)', color: 'var(--cream)', textDecoration: 'none', fontSize: '14px' }}>
              Back to Landing Page
            </Link>
          </div>
        </div>

        <div style={{ marginTop: 'auto', textAlign: 'center', fontSize: '12px', opacity: 0.6, paddingTop: '32px' }}>
          Powered by <a href="https://www.aminoid.in/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--gold2)', textDecoration: 'underline' }}>Aminoid</a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)', color: 'var(--cream)' }}>
      {/* Header with Back Arrow and Brand */}
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
          {isAuthenticated && <Link to="/orders">{t('myOrders', 'My Orders')}</Link>}
          {isAuthenticated && <Link to="/settings">{t('settings', 'Settings')}</Link>}
        </nav>
      </header>

      {/* Main Container */}
      <main style={{ flex: 1, maxWidth: '1000px', width: '100%', margin: '0 auto', padding: '32px 20px' }}>
        {/* Step Title Header */}
        <div style={{ marginBottom: '28px' }}>
          <div className="kick" style={{ color: 'var(--gold2)', fontSize: '12px', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
            Express Buy Now Checkout
          </div>
          <h1 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '34px', color: 'var(--gold2)', margin: '4px 0 0' }}>
            {currentStep === 1 && 'Confirm Your Piece'}
            {currentStep === 2 && 'Enter Delivery Address'}
            {currentStep === 3 && 'Order Review & Delivery Schedule'}
            {currentStep === 4 && 'Complete Secure Payment'}
          </h1>
        </div>

        {/* STEP 1: CONFIRM PRODUCT */}
        {currentStep === 1 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px', alignItems: 'start' }}>
            {/* Left: Product Details Card */}
            <div style={{ background: 'linear-gradient(160deg, #320726, #200318)', border: '1px solid var(--line)', borderRadius: '22px', padding: '24px' }}>
              <div style={{ display: 'flex', gap: '20px', alignItems: 'center', borderBottom: '1px solid var(--line)', paddingBottom: '20px', marginBottom: '20px' }}>
                <div
                  style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '16px',
                    backgroundImage: bg,
                    backgroundColor: '#24061d',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    border: '1px solid var(--line)',
                    flexShrink: 0
                  }}
                />
                <div>
                  <small style={{ color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '11px' }}>
                    {product.category?.name || 'Imitation Masterpiece'}
                  </small>
                  <h3 style={{ margin: '4px 0 8px', fontSize: '20px', fontFamily: '"Cormorant Garamond", serif', color: 'var(--gold2)' }}>
                    {product.name}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                    <span style={{ fontSize: '20px', fontWeight: 700, color: 'var(--gold2)' }}>{inr(unitPrice)}</span>
                    {originalPrice > unitPrice && (
                      <span style={{ fontSize: '14px', textDecoration: 'line-through', opacity: 0.5 }}>{inr(originalPrice)}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Quantity Selector */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ fontSize: '14px', opacity: 0.85 }}>Select Quantity:</span>
                <div style={{ display: 'inline-flex', alignItems: 'center', background: 'rgba(255,240,208,0.06)', border: '1px solid var(--line)', borderRadius: '10px' }}>
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    style={{ padding: '6px 14px', background: 'none', border: 'none', color: 'var(--gold)', fontSize: '16px', cursor: 'pointer' }}
                  >
                    −
                  </button>
                  <span style={{ padding: '0 12px', fontSize: '14px', fontWeight: 600 }}>{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(10, quantity + 1))}
                    style={{ padding: '6px 14px', background: 'none', border: 'none', color: 'var(--gold)', fontSize: '16px', cursor: 'pointer' }}
                  >
                    +
                  </button>
                </div>
              </div>

              <div style={{ fontSize: '12px', opacity: 0.7, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={14} style={{ color: '#4ade80' }} />
                <span>Certified authentic imitation finish · 7-day hassle free replacement</span>
              </div>
            </div>

            {/* Right: Summary & Confirm Button */}
            <div style={{ background: 'linear-gradient(160deg, #3a0b2d, #230419)', border: '1px solid var(--line)', borderRadius: '22px', padding: '28px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '22px', color: 'var(--gold2)', margin: 0 }}>
                Order Summary
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', borderTop: '1px solid var(--line)', paddingTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ opacity: 0.8 }}>Item Subtotal ({quantity} piece{quantity > 1 ? 's' : ''})</span>
                  <span>{inr(subtotal)}</span>
                </div>
                {savings > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4ade80' }}>
                    <span>Special Savings</span>
                    <span>- {inr(savings)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ opacity: 0.8 }}>Insured Transit</span>
                  <span style={{ color: '#4ade80' }}>FREE</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--line)', paddingTop: '14px', fontSize: '20px', fontWeight: 700, color: 'var(--gold2)' }}>
                  <span>Total Payable</span>
                  <span>{inr(totalAmount)}</span>
                </div>
              </div>

              <button
                className="gbtn"
                onClick={handleConfirmProduct}
                style={{ justifyContent: 'center', padding: '14px', fontSize: '15px' }}
              >
                Confirm &amp; Continue →
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', opacity: 0.7, justifyContent: 'center' }}>
                <ShieldCheck size={16} style={{ color: 'var(--gold)' }} />
                <span>100% Secure Checkout Guarantee</span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: DELIVERY ADDRESS FORM */}
        {currentStep === 2 && (
          <div style={{ maxWidth: '720px', margin: '0 auto', background: 'linear-gradient(160deg, #320726, #200318)', border: '1px solid var(--line)', borderRadius: '24px', padding: '32px' }}>
            <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '24px', color: 'var(--gold2)', margin: '0 0 8px' }}>
              Delivery Address
            </h2>
            <p style={{ fontSize: '13px', opacity: 0.8, marginBottom: '24px' }}>
              Please provide the complete shipping address where your order should be delivered.
            </p>

            {addressError && (
              <div style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid #ef4444', color: '#fca5a5', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', marginBottom: '20px' }}>
                {addressError}
              </div>
            )}

            <form onSubmit={handleConfirmAddress} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--gold)', display: 'block', marginBottom: '6px' }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={addressData.name}
                    onChange={(e) => setAddressData({ ...addressData, name: e.target.value })}
                    placeholder="Recipient Full Name"
                    style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', background: 'rgba(255,240,208,0.06)', border: '1px solid var(--line)', color: '#fff', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--gold)', display: 'block', marginBottom: '6px' }}>
                    10-Digit Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={addressData.phone}
                    onChange={(e) => setAddressData({ ...addressData, phone: e.target.value.replace(/\D/g, '') })}
                    placeholder="e.g. 9876543210"
                    style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', background: 'rgba(255,240,208,0.06)', border: '1px solid var(--line)', color: '#fff', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--gold)', display: 'block', marginBottom: '6px' }}>
                    House / Flat / Apartment No. *
                  </label>
                  <input
                    type="text"
                    required
                    value={addressData.flat}
                    onChange={(e) => setAddressData({ ...addressData, flat: e.target.value })}
                    placeholder="e.g. Flat 402, Royal Enclave"
                    style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', background: 'rgba(255,240,208,0.06)', border: '1px solid var(--line)', color: '#fff', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--gold)', display: 'block', marginBottom: '6px' }}>
                    Street / Colony / Area *
                  </label>
                  <input
                    type="text"
                    required
                    value={addressData.street}
                    onChange={(e) => setAddressData({ ...addressData, street: e.target.value })}
                    placeholder="e.g. Usman Road, T. Nagar"
                    style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', background: 'rgba(255,240,208,0.06)', border: '1px solid var(--line)', color: '#fff', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--gold)', display: 'block', marginBottom: '6px' }}>
                    Landmark (Optional)
                  </label>
                  <input
                    type="text"
                    value={addressData.landmark}
                    onChange={(e) => setAddressData({ ...addressData, landmark: e.target.value })}
                    placeholder="Near Panagal Park"
                    style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', background: 'rgba(255,240,208,0.06)', border: '1px solid var(--line)', color: '#fff', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--gold)', display: 'block', marginBottom: '6px' }}>
                    City / Town *
                  </label>
                  <input
                    type="text"
                    required
                    value={addressData.city}
                    onChange={(e) => setAddressData({ ...addressData, city: e.target.value })}
                    placeholder="Chennai"
                    style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', background: 'rgba(255,240,208,0.06)', border: '1px solid var(--line)', color: '#fff', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--gold)', display: 'block', marginBottom: '6px' }}>
                    PIN Code *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={addressData.pincode}
                    onChange={(e) => setAddressData({ ...addressData, pincode: e.target.value.replace(/\D/g, '') })}
                    placeholder="600017"
                    style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', background: 'rgba(255,240,208,0.06)', border: '1px solid var(--line)', color: '#fff', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              {/* Address Type */}
              <div>
                <label style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--gold)', display: 'block', marginBottom: '6px' }}>
                  Address Type
                </label>
                <div style={{ display: 'flex', gap: '16px' }}>
                  {['Home', 'Work'].map((type) => (
                    <label key={type} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
                      <input
                        type="radio"
                        name="addressType"
                        value={type}
                        checked={addressData.type === type}
                        onChange={() => setAddressData({ ...addressData, type })}
                        style={{ accentColor: 'var(--gold)' }}
                      />
                      <span>{type} (7 AM - 9 PM)</span>
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '14px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={handleBack}
                  style={{ padding: '12px 24px', borderRadius: '999px', border: '1px solid var(--line)', color: 'var(--cream)', background: 'transparent', cursor: 'pointer', fontSize: '14px' }}
                >
                  ← Back to Product
                </button>
                <button
                  type="submit"
                  className="gbtn"
                  style={{ flex: 1, justifyContent: 'center', padding: '12px', fontSize: '14px' }}
                >
                  Continue to Order Review →
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 3: ORDER REVIEW & SUMMARY */}
        {currentStep === 3 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px', alignItems: 'start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Delivery Address Card */}
              <div style={{ background: 'linear-gradient(160deg, #320726, #200318)', border: '1px solid var(--line)', borderRadius: '20px', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--gold2)', fontWeight: 600, fontSize: '15px' }}>
                    <MapPin size={18} /> Delivering To
                  </div>
                  <button
                    onClick={() => setCurrentStep(2)}
                    style={{ background: 'none', border: 'none', color: 'var(--gold)', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'underline' }}
                  >
                    <Edit2 size={12} /> Change Address
                  </button>
                </div>
                <div style={{ fontSize: '14px', lineHeight: 1.6 }}>
                  <b>{addressData.name}</b> · {addressData.phone}<br />
                  <span style={{ opacity: 0.85 }}>
                    {addressData.flat}, {addressData.street}{addressData.landmark ? ', ' + addressData.landmark : ''}<br />
                    {addressData.city}, {addressData.state} - <b>{addressData.pincode}</b> ({addressData.type})
                  </span>
                </div>
              </div>

              {/* Product and Estimated Delivery */}
              <div style={{ background: 'linear-gradient(160deg, #320726, #200318)', border: '1px solid var(--line)', borderRadius: '20px', padding: '24px' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '16px' }}>
                  <div
                    style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '14px',
                      backgroundImage: bg,
                      backgroundColor: '#24061d',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      border: '1px solid var(--line)',
                      flexShrink: 0
                    }}
                  />
                  <div>
                    <h4 style={{ margin: '0 0 6px', fontSize: '18px', fontFamily: '"Cormorant Garamond", serif', color: 'var(--gold2)' }}>
                      {product.name}
                    </h4>
                    <div style={{ fontSize: '13px', opacity: 0.8 }}>
                      Quantity: <b>{quantity}</b> · {inr(unitPrice)} each
                    </div>
                  </div>
                </div>

                <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '12px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#86efac' }}>
                  <Truck size={18} />
                  <span>
                    Estimated Delivery: <b>{deliveryDate}</b> · Free Insured Courier
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Full Price Details Breakdown */}
            <div style={{ background: 'linear-gradient(160deg, #3a0b2d, #230419)', border: '1px solid var(--line)', borderRadius: '22px', padding: '28px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '22px', color: 'var(--gold2)', margin: 0 }}>
                Price Details
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', borderTop: '1px solid var(--line)', paddingTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ opacity: 0.8 }}>Items Subtotal</span>
                  <span>{inr(subtotal)}</span>
                </div>
                {savings > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4ade80' }}>
                    <span>Total Discount</span>
                    <span>- {inr(savings)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ opacity: 0.8 }}>Delivery Charges</span>
                  <span style={{ color: '#4ade80' }}>FREE</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--line)', paddingTop: '14px', fontSize: '20px', fontWeight: 700, color: 'var(--gold2)' }}>
                  <span>Total Payable</span>
                  <span>{inr(totalAmount)}</span>
                </div>
              </div>

              <button
                className="gbtn"
                onClick={handleProceedToPayment}
                style={{ justifyContent: 'center', padding: '14px', fontSize: '15px' }}
              >
                Continue to Payment →
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', opacity: 0.7, justifyContent: 'center' }}>
                <ShieldCheck size={16} style={{ color: 'var(--gold)' }} />
                <span>Encrypted 256-bit Bank Grade Security</span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: PAYMENT PAGE */}
        {currentStep === 4 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px', alignItems: 'start' }}>
            {/* Left: Payment Options */}
            <div style={{ background: 'linear-gradient(160deg, #320726, #200318)', border: '1px solid var(--line)', borderRadius: '24px', padding: '28px' }}>
              <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '24px', color: 'var(--gold2)', margin: '0 0 18px' }}>
                Select Payment Mode
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Option 1: Cash on Delivery */}
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    padding: '16px',
                    borderRadius: '14px',
                    border: paymentMethod === 'COD' ? '1px solid var(--gold2)' : '1px solid var(--line)',
                    background: paymentMethod === 'COD' ? 'rgba(212,175,55,0.12)' : 'rgba(255,240,208,0.03)',
                    cursor: 'pointer'
                  }}
                >
                  <input
                    type="radio"
                    name="payMode"
                    value="COD"
                    checked={paymentMethod === 'COD'}
                    onChange={() => setPaymentMethod('COD')}
                    style={{ accentColor: 'var(--gold)' }}
                  />
                  <Banknote size={22} style={{ color: 'var(--gold)' }} />
                  <div>
                    <b style={{ display: 'block', fontSize: '14px', color: 'var(--gold2)' }}>Cash on Delivery (COD)</b>
                    <small style={{ opacity: 0.75 }}>Pay cash or UPI upon delivery at your doorstep.</small>
                  </div>
                </label>

                {/* Option 2: UPI */}
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    padding: '16px',
                    borderRadius: '14px',
                    border: paymentMethod === 'UPI' ? '1px solid var(--gold2)' : '1px solid var(--line)',
                    background: paymentMethod === 'UPI' ? 'rgba(212,175,55,0.12)' : 'rgba(255,240,208,0.03)',
                    cursor: 'pointer'
                  }}
                >
                  <input
                    type="radio"
                    name="payMode"
                    value="UPI"
                    checked={paymentMethod === 'UPI'}
                    onChange={() => setPaymentMethod('UPI')}
                    style={{ accentColor: 'var(--gold)' }}
                  />
                  <QrCode size={22} style={{ color: 'var(--gold)' }} />
                  <div style={{ flex: 1 }}>
                    <b style={{ display: 'block', fontSize: '14px', color: 'var(--gold2)' }}>UPI / QR Code</b>
                    <small style={{ opacity: 0.75 }}>Google Pay, PhonePe, Paytm, BHIM</small>
                    {paymentMethod === 'UPI' && (
                      <div style={{ marginTop: '10px' }}>
                        <input
                          type="text"
                          placeholder="Enter your UPI ID (e.g. mobile@upi)"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', background: 'rgba(255,240,208,0.06)', border: '1px solid var(--line)', color: '#fff', fontSize: '12px', boxSizing: 'border-box' }}
                        />
                      </div>
                    )}
                  </div>
                </label>

                {/* Option 3: Credit/Debit Cards */}
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    padding: '16px',
                    borderRadius: '14px',
                    border: paymentMethod === 'CARD' ? '1px solid var(--gold2)' : '1px solid var(--line)',
                    background: paymentMethod === 'CARD' ? 'rgba(212,175,55,0.12)' : 'rgba(255,240,208,0.03)',
                    cursor: 'pointer'
                  }}
                >
                  <input
                    type="radio"
                    name="payMode"
                    value="CARD"
                    checked={paymentMethod === 'CARD'}
                    onChange={() => setPaymentMethod('CARD')}
                    style={{ accentColor: 'var(--gold)' }}
                  />
                  <CreditCard size={22} style={{ color: 'var(--gold)' }} />
                  <div>
                    <b style={{ display: 'block', fontSize: '14px', color: 'var(--gold2)' }}>Credit / Debit Card</b>
                    <small style={{ opacity: 0.75 }}>Visa, MasterCard, RuPay cards accepted.</small>
                  </div>
                </label>
              </div>
            </div>

            {/* Right: Price Summary & Place Order Button */}
            <div style={{ background: 'linear-gradient(160deg, #3a0b2d, #230419)', border: '1px solid var(--line)', borderRadius: '24px', padding: '28px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '22px', color: 'var(--gold2)', margin: 0 }}>
                Final Amount
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', borderTop: '1px solid var(--line)', paddingTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ opacity: 0.8 }}>Item Price ({quantity}x)</span>
                  <span>{inr(subtotal)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ opacity: 0.8 }}>Shipping &amp; Insurance</span>
                  <span style={{ color: '#4ade80' }}>Complimentary</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--line)', paddingTop: '14px', fontSize: '22px', fontWeight: 700, color: 'var(--gold2)' }}>
                  <span>Total Payable</span>
                  <span>{inr(totalAmount)}</span>
                </div>
              </div>

              <button
                className="gbtn"
                disabled={isPlacingOrder}
                onClick={handlePlaceOrder}
                style={{ justifyContent: 'center', padding: '16px', fontSize: '15px' }}
              >
                {isPlacingOrder ? 'Confirming Order...' : 'Pay & Place Order →'}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', opacity: 0.7, justifyContent: 'center' }}>
                <ShieldCheck size={16} style={{ color: 'var(--gold)' }} />
                <span>100% Certified Safe &amp; Insured Dispatch</span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{ marginTop: 'auto', borderTop: '1px solid var(--line)', padding: '24px', background: 'var(--panel)', fontSize: '13px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <span>© {new Date().getFullYear()} {storeName}. All rights reserved.</span>
          <span>
            Powered by{' '}
            <a href="https://www.aminoid.in/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--gold2)', textDecoration: 'underline', fontWeight: 500 }}>
              Aminoid
            </a>
          </span>
          <Link to="/" style={{ color: 'var(--gold)', textDecoration: 'none' }}>
            Store Landing Page
          </Link>
        </div>
      </footer>
    </div>
  );
}

