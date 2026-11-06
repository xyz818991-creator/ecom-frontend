import React, { useState } from 'react';
import { useCart } from '../context/CartContext';

const inr = (n) => '₹' + Number(n).toLocaleString('en-IN');

export default function ProductDetailModal({ product, onClose, onShowToast }) {
  const { addToCart, setIsCartOpen } = useCart();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(null);

  if (!product) return null;

  const images = [];
  if (product.images && product.images.length > 0) {
    product.images.forEach((img) => images.push(img.image_url));
  } else if (product.image_url) {
    images.push(product.image_url);
  } else if (product.i) {
    images.push(`var(${product.i})`);
  }

  const primaryImage = images[selectedImageIndex] || images[0] || '';
  const isCssVar = primaryImage.startsWith('var(');
  const isUploadUrl = primaryImage.startsWith('/uploads/') || primaryImage.startsWith('http');
  const resolvedBgImage = isCssVar ? primaryImage : isUploadUrl ? `url(${primaryImage})` : `url(${primaryImage})`;

  const sellingPrice = parseFloat(product.selling_price || product.price || product.p || 0);
  const originalPrice = parseFloat(product.original_price || sellingPrice);
  const discountPercent = originalPrice > sellingPrice ? Math.round(((originalPrice - sellingPrice) / originalPrice) * 100) : 0;
  const inStock = product.stock === undefined || product.stock > 0;

  const handleAdd = () => {
    addToCart(product, quantity, selectedVariant);
    if (onShowToast) {
      onShowToast(`${product.name} (${quantity}) added to your bag!`);
    }
  };

  const handleBuyNow = () => {
    addToCart(product, quantity, selectedVariant);
    onClose();
    setIsCartOpen(true);
  };

  return (
    <div className="ov on" onClick={(e) => e.target.classList.contains('ov') && onClose()}>
      <div className="box" style={{ maxWidth: '820px', padding: '32px' }}>
        <button className="x" aria-label="Close" onClick={onClose}>
          ×
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '28px', alignItems: 'start' }}>
          {/* Gallery View */}
          <div>
            <div
              style={{
                width: '100%',
                aspectRatio: '1',
                borderRadius: '16px',
                backgroundImage: resolvedBgImage,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                border: '1px solid var(--line)',
                boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
                marginBottom: '12px',
                backgroundColor: '#1f0418'
              }}
            />

            {/* Thumbnails */}
            {images.length > 1 && (
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                {images.map((img, idx) => {
                  const isThumbCss = img.startsWith('var(');
                  const thumbBg = isThumbCss ? img : img.startsWith('/uploads/') ? `url(${img})` : `url(${img})`;
                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      style={{
                        width: '54px',
                        height: '54px',
                        borderRadius: '10px',
                        backgroundImage: thumbBg,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        border: selectedImageIndex === idx ? '2px solid var(--gold)' : '1px solid var(--line)',
                        opacity: selectedImageIndex === idx ? 1 : 0.6,
                        cursor: 'pointer',
                        flexShrink: 0
                      }}
                    />
                  );
                })}
              </div>
            )}
          </div>

          {/* Details Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <span
                style={{
                  display: 'inline-block',
                  fontSize: '12px',
                  fontWeight: 600,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: 'var(--gold)',
                  marginBottom: '4px'
                }}
              >
                {product.category?.name || product.c || 'Heirloom Jewellery'}
              </span>
              <h2 style={{ fontSize: '28px', fontWeight: 500, color: 'var(--cream)', lineHeight: 1.2 }}>
                {product.name}
              </h2>
              {product.sku && (
                <small style={{ color: 'var(--gold)', opacity: 0.7, fontSize: '12px', display: 'block', marginTop: '2px' }}>
                  SKU: {product.sku}
                </small>
              )}
            </div>

            {/* Price section */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginTop: '4px' }}>
              <span style={{ fontSize: '26px', fontWeight: 600, color: 'var(--gold2)' }}>
                {inr(sellingPrice)}
              </span>
              {discountPercent > 0 && (
                <>
                  <span style={{ fontSize: '16px', textDecoration: 'line-through', opacity: 0.6 }}>
                    {inr(originalPrice)}
                  </span>
                  <span
                    style={{
                      background: 'rgba(212,175,55,0.18)',
                      color: 'var(--gold2)',
                      fontSize: '12px',
                      padding: '2px 8px',
                      borderRadius: '999px',
                      border: '1px solid var(--gold)'
                    }}
                  >
                    Save {discountPercent}%
                  </span>
                </>
              )}
            </div>

            {/* Stock status badge */}
            <div>
              {inStock ? (
                <span style={{ color: '#4ade80', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#4ade80' }}></span>
                  In Stock {product.stock ? `(${product.stock} pieces left)` : ''}
                </span>
              ) : (
                <span style={{ color: '#f87171', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f87171' }}></span>
                  Currently Out of Stock
                </span>
              )}
            </div>

            {/* Description */}
            <p style={{ fontSize: '14px', lineHeight: 1.6, opacity: 0.88, color: 'var(--cream)', margin: '6px 0' }}>
              {product.description || product.short_description || 'Exquisite temple jewellery piece crafted with antique gold finishes and natural stones.'}
            </p>

            {/* Variants if any */}
            {product.variants && product.variants.length > 0 && (
              <div>
                <label style={{ fontSize: '12px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gold)', display: 'block', marginBottom: '6px' }}>
                  Select Option:
                </label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {product.variants.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariant(v)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '999px',
                        border: selectedVariant?.id === v.id ? '1px solid var(--gold2)' : '1px solid var(--line)',
                        background: selectedVariant?.id === v.id ? 'rgba(229,189,114,0.2)' : 'rgba(255,240,208,0.05)',
                        color: selectedVariant?.id === v.id ? 'var(--gold2)' : 'var(--cream)',
                        fontSize: '13px',
                        cursor: 'pointer'
                      }}
                    >
                      {v.title}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector & Action buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--line)', borderRadius: '999px', padding: '4px 10px', gap: '12px' }}>
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  style={{ color: 'var(--gold2)', fontSize: '18px', cursor: 'pointer', padding: '0 4px' }}
                >
                  −
                </button>
                <span style={{ fontSize: '15px', fontWeight: 500, minWidth: '18px', textAlign: 'center' }}>{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  style={{ color: 'var(--gold2)', fontSize: '18px', cursor: 'pointer', padding: '0 4px' }}
                >
                  +
                </button>
              </div>

              <button
                className="gbtn"
                onClick={handleAdd}
                disabled={!inStock}
                style={{ flex: 1, justifyContent: 'center', opacity: inStock ? 1 : 0.5 }}
              >
                Add to Bag
              </button>
            </div>

            <button
              onClick={handleBuyNow}
              disabled={!inStock}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '999px',
                border: '1px solid var(--gold)',
                background: 'none',
                color: 'var(--gold2)',
                fontSize: '14px',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.2s',
                opacity: inStock ? 1 : 0.5
              }}
              onMouseEnter={(e) => (e.target.style.background = 'rgba(229,189,114,0.15)')}
              onMouseLeave={(e) => (e.target.style.background = 'none')}
            >
              Express Checkout →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

