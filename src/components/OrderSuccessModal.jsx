import React from 'react';
import { useStore } from '../context/StoreContext';

const inr = (n) => '₹' + Number(n).toLocaleString('en-IN');

export default function OrderSuccessModal({ order, onClose, onTrackOrder }) {
  const { storeName } = useStore();
  if (!order) return null;

  return (
    <div className="ov on" onClick={(e) => e.target.classList.contains('ov') && onClose()}>
      <div className="box" style={{ maxWidth: '560px', padding: '36px', textAlign: 'center' }}>
        <button className="x" aria-label="Close" onClick={onClose}>
          ×
        </button>

        <div
          style={{
            width: '68px',
            height: '68px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #f6dda0, #d4af37)',
            color: '#1a0418',
            display: 'grid',
            placeItems: 'center',
            fontSize: '32px',
            margin: '0 auto 18px',
            boxShadow: '0 0 32px rgba(212,175,55,0.4)'
          }}
        >
          ✓
        </div>

        <h3 style={{ fontSize: '28px', color: 'var(--gold2)', marginBottom: '8px' }}>
          Order Confirmed!
        </h3>
        <p style={{ color: 'var(--cream)', opacity: 0.9, fontSize: '15px', marginBottom: '20px' }}>
          Thank you for choosing <b>{storeName}</b>. Your heirloom jewellery is being prepared with utmost care.
        </p>

        <div style={{ background: 'rgba(255,240,208,0.05)', border: '1px solid var(--line)', borderRadius: '12px', padding: '16px', textAlign: 'left', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', borderBottom: '1px solid var(--line)', paddingBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: 'var(--gold)' }}>Order Number:</span>
            <b style={{ color: 'var(--gold2)', letterSpacing: '0.05em' }}>#{order.order_number}</b>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', opacity: 0.8 }}>Customer:</span>
            <span style={{ color: '#fff' }}>{order.customer_name}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', opacity: 0.8 }}>Delivery To:</span>
            <span style={{ color: '#fff', maxWidth: '240px', textAlign: 'right', fontSize: '13px' }}>{order.shipping_address}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', opacity: 0.8 }}>Payment:</span>
            <span style={{ color: '#4ade80', textTransform: 'uppercase', fontSize: '12px' }}>
              {order.payment_method === 'cod' ? 'Cash on Delivery' : 'Paid Online'}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--line)', paddingTop: '8px', fontSize: '16px', fontWeight: 600 }}>
            <span style={{ color: 'var(--gold)' }}>Total Paid:</span>
            <span style={{ color: 'var(--gold2)' }}>{inr(order.total_amount)}</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button
            className="gbtn"
            onClick={() => {
              onClose();
              if (onTrackOrder) onTrackOrder(order.order_number);
            }}
          >
            Track Order Details →
          </button>
          <button
            onClick={onClose}
            style={{
              padding: '12px 24px',
              borderRadius: '999px',
              border: '1px solid var(--line)',
              background: 'none',
              color: 'var(--cream)',
              cursor: 'pointer'
            }}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}

