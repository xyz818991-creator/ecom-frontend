import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { orderService, paymentService } from '../services/api';

const inr = (n) => '₹' + Number(n).toLocaleString('en-IN');

export default function CheckoutModal({ isOpen, onClose, onOrderSuccess }) {
  const { cartItems, cartSubtotal, discount, cartTotal, appliedCoupon, applyCouponCode, removeCoupon, clearCart } = useCart();
  const { user } = useAuth();
  const { storeName } = useStore();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: 'Chennai',
    pincode: '600017',
    notes: '',
    paymentMethod: 'cod'
  });

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    setCouponError('');
    setCouponSuccess('');
    if (!couponInput.trim()) return;

    const res = await applyCouponCode(couponInput.trim());
    if (res.success) {
      setCouponSuccess(res.message);
      setCouponInput('');
    } else {
      setCouponError(res.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      const fullAddress = `${formData.address}, ${formData.city} - ${formData.pincode}`;

      const orderPayload = {
        customer_name: formData.name,
        customer_email: formData.email,
        customer_phone: formData.phone,
        shipping_address: fullAddress,
        items: cartItems.map((item) => ({
          product_id: item.id,
          name: item.name,
          quantity: item.quantity,
          image_url: item.image_url,
          variant_name: item.variant?.title
        })),
        payment_method: formData.paymentMethod,
        coupon_code: appliedCoupon?.code,
        notes: formData.notes
      };

      // 1. Create order in Backend
      const res = await orderService.createOrder(orderPayload);
      if (!res.success) {
        throw new Error(res.message || 'Failed to place order.');
      }

      const createdOrder = res.order;

      // 2. Handle Online Payment (Razorpay gateway integration)
      if (formData.paymentMethod === 'razorpay') {
        try {
          const payRes = await paymentService.createOrder({
            amount: createdOrder.total_amount,
            receipt: createdOrder.order_number
          });

          if (window.Razorpay && payRes?.order?.id && !payRes.is_simulation) {
            const options = {
              key: payRes.keyId || 'rzp_test_TwS8lhHECXyOSI',
              amount: payRes.order.amount,
              currency: payRes.order.currency || 'INR',
              name: storeName,
              description: `Heritage Order #${createdOrder.order_number}`,
              order_id: payRes.order.id,
              prefill: {
                name: formData.name,
                email: formData.email,
                contact: formData.phone
              },
              theme: {
                color: '#390b2c'
              },
              handler: async (response) => {
                try {
                  await paymentService.verifyPayment({
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature,
                    order_id: createdOrder.id
                  });
                } catch (verifyErr) {
                  console.warn('Payment verify notice:', verifyErr.message);
                }
                clearCart();
                onClose();
                if (onOrderSuccess) {
                  onOrderSuccess(createdOrder);
                }
              },
              modal: {
                ondismiss: () => {
                  setLoading(false);
                  setErrorMessage('Razorpay checkout was dismissed. You may retry or select Cash on Delivery.');
                }
              }
            };
            const rzp = new window.Razorpay(options);
            rzp.open();
            return;
          } else {
            // Simulated / fallback payment verification
            await paymentService.verifyPayment({
              razorpay_order_id: payRes?.order?.id || `sim_order_${Date.now()}`,
              razorpay_payment_id: `pay_test_${Date.now()}`,
              order_id: createdOrder.id
            });
          }
        } catch (payErr) {
          console.warn('Payment gateway fallback:', payErr.message);
        }
      }

      // 3. Clear cart and notify success
      clearCart();
      onClose();
      if (onOrderSuccess) {
        onOrderSuccess(createdOrder);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Error completing checkout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ov on" onClick={(e) => e.target.classList.contains('ov') && onClose()}>
      <div className="box" style={{ maxWidth: '780px', padding: '32px' }}>
        <button className="x" aria-label="Close" onClick={onClose}>
          ×
        </button>

        <h3 style={{ fontSize: '28px', color: 'var(--gold2)', marginBottom: '8px' }}>
          Secure Checkout
        </h3>
        <p style={{ color: 'var(--cream)', opacity: 0.8, fontSize: '14px', marginBottom: '24px' }}>
          Complete your heirloom jewellery order with complimentary insured delivery.
        </p>

        {errorMessage && (
          <div style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#fca5a5', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', marginBottom: '16px' }}>
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          {/* Customer Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h4 style={{ color: 'var(--gold)', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.12em', borderBottom: '1px solid var(--line)', paddingBottom: '6px' }}>
              Shipping Details
            </h4>

            <label className="f" style={{ border: 0, padding: 0, background: 'none' }}>
              <span style={{ fontSize: '12px', color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Full Name *</span>
              <input
                required
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Nivetha Priyadharshini"
                style={{ background: 'rgba(255,240,208,0.06)', border: '1px solid var(--line)', padding: '10px 14px', borderRadius: '10px', color: '#fff' }}
              />
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <label className="f" style={{ border: 0, padding: 0, background: 'none' }}>
                <span style={{ fontSize: '12px', color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Email *</span>
                <input
                  required
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="hello@example.com"
                  style={{ background: 'rgba(255,240,208,0.06)', border: '1px solid var(--line)', padding: '10px 14px', borderRadius: '10px', color: '#fff' }}
                />
              </label>

              <label className="f" style={{ border: 0, padding: 0, background: 'none' }}>
                <span style={{ fontSize: '12px', color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Phone Number *</span>
                <input
                  required
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  style={{ background: 'rgba(255,240,208,0.06)', border: '1px solid var(--line)', padding: '10px 14px', borderRadius: '10px', color: '#fff' }}
                />
              </label>
            </div>

            <label className="f" style={{ border: 0, padding: 0, background: 'none' }}>
              <span style={{ fontSize: '12px', color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Delivery Address *</span>
              <textarea
                required
                name="address"
                rows="2"
                value={formData.address}
                onChange={handleChange}
                placeholder="House/Flat No., Apartment, Street, Locality"
                style={{ background: 'rgba(255,240,208,0.06)', border: '1px solid var(--line)', padding: '10px 14px', borderRadius: '10px', color: '#fff', minHeight: '60px' }}
              />
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <label className="f" style={{ border: 0, padding: 0, background: 'none' }}>
                <span style={{ fontSize: '12px', color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>City *</span>
                <input
                  required
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="City"
                  style={{ background: 'rgba(255,240,208,0.06)', border: '1px solid var(--line)', padding: '10px 14px', borderRadius: '10px', color: '#fff' }}
                />
              </label>

              <label className="f" style={{ border: 0, padding: 0, background: 'none' }}>
                <span style={{ fontSize: '12px', color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Pincode *</span>
                <input
                  required
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  placeholder="600001"
                  style={{ background: 'rgba(255,240,208,0.06)', border: '1px solid var(--line)', padding: '10px 14px', borderRadius: '10px', color: '#fff' }}
                />
              </label>
            </div>
          </div>

          {/* Order Summary & Payment */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: 'rgba(20,2,16,0.5)', padding: '20px', borderRadius: '14px', border: '1px solid var(--line)' }}>
            <h4 style={{ color: 'var(--gold)', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.12em', borderBottom: '1px solid var(--line)', paddingBottom: '6px' }}>
              Order Summary ({cartItems.length} items)
            </h4>

            {/* Items mini list */}
            <div style={{ maxHeight: '140px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {cartItems.map((item) => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--cream)' }}>
                  <span>{item.name} × {item.quantity}</span>
                  <span style={{ color: 'var(--gold2)' }}>{inr(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            {/* Coupon Application */}
            <div style={{ borderTop: '1px dashed var(--line)', paddingTop: '12px' }}>
              {appliedCoupon ? (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(212,175,55,0.12)', padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--gold)' }}>
                  <span style={{ fontSize: '13px', color: 'var(--gold2)' }}>
                    Coupon <b>{appliedCoupon.code}</b> applied!
                  </span>
                  <button type="button" onClick={removeCoupon} style={{ color: '#f87171', background: 'none', border: 0, cursor: 'pointer', fontSize: '12px' }}>
                    Remove
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="Coupon code (e.g. ETHNIC10)"
                    style={{ flex: 1, background: 'rgba(255,240,208,0.06)', border: '1px solid var(--line)', padding: '8px 12px', borderRadius: '8px', color: '#fff', fontSize: '13px' }}
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    style={{ background: 'var(--gold)', color: 'var(--ink)', border: 0, padding: '8px 14px', borderRadius: '8px', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}
                  >
                    Apply
                  </button>
                </div>
              )}
              {couponError && <small style={{ color: '#f87171', fontSize: '12px', marginTop: '4px', display: 'block' }}>{couponError}</small>}
              {couponSuccess && <small style={{ color: '#4ade80', fontSize: '12px', marginTop: '4px', display: 'block' }}>{couponSuccess}</small>}
            </div>

            {/* Price Calculations */}
            <div style={{ borderTop: '1px solid var(--line)', paddingTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', opacity: 0.8 }}>
                <span>Subtotal</span>
                <span>{inr(cartSubtotal)}</span>
              </div>
              {discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4ade80' }}>
                  <span>Coupon Discount</span>
                  <span>− {inr(discount)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', opacity: 0.8 }}>
                <span>Delivery (Insured Express)</span>
                <span style={{ color: '#4ade80' }}>FREE</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 600, color: 'var(--gold2)', borderTop: '1px solid var(--line)', paddingTop: '8px', marginTop: '4px' }}>
                <span>Total Amount</span>
                <span>{inr(cartTotal)}</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div>
              <span style={{ fontSize: '12px', color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '8px' }}>
                Select Payment Method:
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', background: formData.paymentMethod === 'cod' ? 'rgba(212,175,55,0.18)' : 'rgba(255,240,208,0.04)', padding: '10px', borderRadius: '8px', border: formData.paymentMethod === 'cod' ? '1px solid var(--gold)' : '1px solid var(--line)', cursor: 'pointer', fontSize: '13px' }}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={formData.paymentMethod === 'cod'}
                    onChange={handleChange}
                  />
                  Cash on Delivery
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', background: formData.paymentMethod === 'razorpay' ? 'rgba(212,175,55,0.18)' : 'rgba(255,240,208,0.04)', padding: '10px', borderRadius: '8px', border: formData.paymentMethod === 'razorpay' ? '1px solid var(--gold)' : '1px solid var(--line)', cursor: 'pointer', fontSize: '13px' }}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="razorpay"
                    checked={formData.paymentMethod === 'razorpay'}
                    onChange={handleChange}
                  />
                  Online (UPI/Card)
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="gbtn"
              disabled={loading || cartItems.length === 0}
              style={{ justifyContent: 'center', marginTop: '8px' }}
            >
              {loading ? 'Processing Order...' : `Confirm Order (${inr(cartTotal)})`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

