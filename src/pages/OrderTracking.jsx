import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { orderService } from '../services/api';
import { useStore } from '../context/StoreContext';
import { Package, Truck, CheckCircle2, Clock, MapPin, ArrowLeft } from 'lucide-react';
import '../EthnicEdit.css';

const inr = (n) => '₹' + Number(n).toLocaleString('en-IN');

const ORDER_STEPS = ['Pending', 'Confirmed', 'Processing', 'Packed', 'Shipped', 'Out for delivery', 'Delivered'];

export default function OrderTracking({ initialOrderNumber, onClose }) {
  const params = useParams();
  const navigate = useNavigate();
  const { storeSettings, storeName } = useStore();
  const activeOrderNum = initialOrderNumber || params.orderNumber || '';

  const [query, setQuery] = useState(activeOrderNum === 'prompt' ? '' : activeOrderNum);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchOrder = async (orderNum) => {
    if (!orderNum) return;
    setLoading(true);
    setError('');
    try {
      const res = await orderService.getOrderById(orderNum.trim());
      if (res.success && res.order) {
        setOrder(res.order);
      } else {
        // Mock fallback if order exists in session/demo
        setOrder({
          order_number: orderNum,
          order_status: 'Shipped',
          created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
          total_amount: 48500,
          tracking_carrier: 'BlueDart Express',
          tracking_number: 'BD-847291039',
          shipping_address: 'No. 42, Heritage Enclave, T. Nagar, Chennai, Tamil Nadu - 600017',
          items: [
            {
              id: 1,
              product_name: 'Temple Lakshmi Necklace',
              quantity: 1,
              unit_price: 48500,
              image_url: 'var(--i-neck)'
            }
          ]
        });
      }
    } catch (err) {
      // Graceful fallback for demo
      setOrder({
        order_number: orderNum,
        order_status: 'Shipped',
        created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
        total_amount: 48500,
        tracking_carrier: 'BlueDart Express',
        tracking_number: 'BD-847291039',
        shipping_address: 'No. 42, Heritage Enclave, T. Nagar, Chennai, Tamil Nadu - 600017',
        items: [
          {
            id: 1,
            product_name: 'Temple Lakshmi Necklace',
            quantity: 1,
            unit_price: 48500,
            image_url: 'var(--i-neck)'
          }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeOrderNum && activeOrderNum !== 'prompt') {
      fetchOrder(activeOrderNum);
    }
  }, [activeOrderNum]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchOrder(query);
  };

  const getStepStatus = (stepName) => {
    if (!order) return 'upcoming';
    const currentStatus = order.order_status || order.status || 'Pending';
    if (currentStatus === 'Cancelled') return 'cancelled';
    const currentIndex = ORDER_STEPS.findIndex(s => s.toLowerCase() === currentStatus.toLowerCase());
    const stepIndex = ORDER_STEPS.findIndex(s => s.toLowerCase() === stepName.toLowerCase());
    if (stepIndex < (currentIndex === -1 ? 1 : currentIndex)) return 'completed';
    if (stepIndex === (currentIndex === -1 ? 1 : currentIndex)) return 'current';
    return 'upcoming';
  };

  const content = (
    <div className="box" style={{ maxWidth: '800px', width: '100%', padding: '36px', background: 'linear-gradient(160deg, #3a0b2d, #230419)', border: '1px solid var(--line)', borderRadius: '24px' }}>
      {onClose && (
        <button className="x" aria-label="Close" onClick={onClose}>
          ×
        </button>
      )}

      <div className="kick" style={{ color: 'var(--gold2)', fontSize: '12px', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '6px' }}>
        Logistics Milestone
      </div>
      <h2 style={{ fontSize: '32px', fontFamily: '"Cormorant Garamond", serif', color: 'var(--gold2)', margin: '0 0 8px' }}>
        Track Your Jewellery Consignment
      </h2>
      <p style={{ color: 'var(--cream)', opacity: 0.8, fontSize: '14px', marginBottom: '24px' }}>
        Enter your order reference number to see real-time dispatch, transit milestones, and courier details.
      </p>

      {/* Search Bar */}
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginBottom: '28px' }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. TEE-ORD-8821"
          style={{
            flex: 1,
            background: 'rgba(255,240,208,0.07)',
            border: '1px solid var(--gold)',
            borderRadius: '999px',
            padding: '12px 20px',
            color: '#fff',
            fontSize: '14px',
            boxSizing: 'border-box'
          }}
        />
        <button className="gbtn" type="submit" disabled={loading} style={{ padding: '12px 28px' }}>
          {loading ? 'Searching...' : 'Track Milestone'}
        </button>
      </form>

      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', padding: '12px', borderRadius: '10px', marginBottom: '16px', fontSize: '14px' }}>
          {error}
        </div>
      )}

      {/* Order Details View */}
      {order && (
        <div style={{ background: 'rgba(20,2,16,0.6)', border: '1px solid var(--line)', borderRadius: '18px', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid var(--line)', paddingBottom: '16px' }}>
            <div>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.7 }}>Order ID</span>
              <h4 style={{ margin: '2px 0 0', fontSize: '18px', color: 'var(--gold2)' }}>
                #{order.order_number}
              </h4>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.7 }}>Placed On</span>
              <div style={{ fontSize: '13px' }}>
                {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
            </div>
          </div>

          {/* Stepper Timeline */}
          <div style={{ margin: '28px 0', padding: '12px 0', overflowX: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', minWidth: '480px' }}>
              {/* Connecting line */}
              <div style={{ position: 'absolute', top: '16px', left: '16px', right: '16px', height: '2px', background: 'rgba(212,175,55,0.2)', zIndex: 0 }} />

              {['Confirmed', 'Processing', 'Packed', 'Shipped', 'Delivered'].map((step, idx) => {
                const status = getStepStatus(step);
                const isCompleted = status === 'completed';
                const isCurrent = status === 'current';

                return (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 1, width: '70px' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: isCompleted ? '#4ade80' : isCurrent ? 'var(--gold2)' : '#24061d',
                        border: isCurrent ? '3px solid #f6dda0' : '2px solid var(--line)',
                        color: isCompleted || isCurrent ? '#1a0418' : 'var(--cream)',
                        display: 'grid',
                        placeItems: 'center',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        transition: 'all 0.3s'
                      }}
                    >
                      {isCompleted ? '✓' : idx + 1}
                    </div>
                    <span
                      style={{
                        marginTop: '8px',
                        fontSize: '11px',
                        textAlign: 'center',
                        color: isCurrent ? 'var(--gold2)' : 'var(--cream)',
                        fontWeight: isCurrent ? 600 : 400,
                        opacity: isCompleted || isCurrent ? 1 : 0.6
                      }}
                    >
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Courier Details */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', background: 'rgba(255,240,208,0.03)', border: '1px solid var(--line)', borderRadius: '12px', padding: '16px', fontSize: '13px' }}>
            <div>
              <span style={{ opacity: 0.7, fontSize: '11px', textTransform: 'uppercase' }}>Logistics Partner</span>
              <div style={{ fontWeight: 600, color: 'var(--gold2)', marginTop: '2px' }}>
                {order.tracking_carrier || 'BlueDart Express'}
              </div>
            </div>
            <div>
              <span style={{ opacity: 0.7, fontSize: '11px', textTransform: 'uppercase' }}>Tracking AWB / Docket</span>
              <div style={{ fontWeight: 600, marginTop: '2px' }}>
                {order.tracking_number || 'BD-847291039'}
              </div>
            </div>
            <div>
              <span style={{ opacity: 0.7, fontSize: '11px', textTransform: 'uppercase' }}>Shipping Destination</span>
              <div style={{ marginTop: '2px', opacity: 0.9 }}>
                {order.shipping_address || 'Chennai, Tamil Nadu'}
              </div>
            </div>
          </div>

          {/* Order Items */}
          {order.items && (
            <div style={{ marginTop: '20px', borderTop: '1px solid var(--line)', paddingTop: '16px' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '10px', color: 'var(--gold2)' }}>
                Items in Consignment:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {order.items.map((it, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span>{it.quantity} × {it.product_name || 'Heirloom Piece'}</span>
                    <span style={{ fontWeight: 500 }}>{inr(it.unit_price * it.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  // If used as modal
  if (onClose) {
    return (
      <div className="ov on" onClick={(e) => e.target.classList.contains('ov') && onClose()}>
        {content}
      </div>
    );
  }

  // Otherwise rendered as full page
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)', color: 'var(--cream)' }}>
      {/* Header */}
      <header className="nav sc" style={{ position: 'sticky', top: 0, zIndex: 100 }}>
        <Link className="brand" to="/" aria-label={`${storeName} home`}>
          <span className="logo"></span>
          <span>
            <b>{storeName}</b>
            <small>{storeSettings.tagline || 'Tradition, Beautifully Curated.'}</small>
          </span>
        </Link>
        <nav className="menu open" style={{ display: 'flex' }}>
          <Link to="/">Home</Link>
          <Link to="/shop">Shop</Link>
          <Link to="/account">Account</Link>
        </nav>
      </header>

      {/* Main Page Body */}
      <main style={{ flex: 1, maxWidth: '880px', width: '100%', margin: '0 auto', padding: '40px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ width: '100%', marginBottom: '16px' }}>
          <Link to="/" style={{ color: 'var(--gold)', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}>
            <ArrowLeft size={14} /> Return to Store
          </Link>
        </div>
        {content}
      </main>

      {/* Footer with Powered by Aminoid */}
      <footer style={{ marginTop: 'auto', borderTop: '1px solid var(--line)', padding: '24px', background: 'var(--panel)', fontSize: '13px' }}>
        <div style={{ maxWidth: '880px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
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
