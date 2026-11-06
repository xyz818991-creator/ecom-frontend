import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';
import { Heart, ShoppingBag, Trash2, ArrowLeft, ArrowRight } from 'lucide-react';
import '../EthnicEdit.css';

const inr = (n) => '₹' + Number(n).toLocaleString('en-IN');

export default function Wishlist() {
  const { wishlistItems, toggleWishlist, addToCart, cartCount } = useCart();
  const { storeSettings, storeName } = useStore();
  const navigate = useNavigate();

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
          <span style={{ color: 'var(--gold2)', fontWeight: 600 }}>Wishlist</span>
        </nav>
        <div className="tools">
          <Link to="/cart" style={{ display: 'flex', alignItems: 'center', color: '#fff', textDecoration: 'none' }}>
            <ShoppingBag size={20} />
            <span id="cnt" style={{ marginLeft: '4px' }}>{cartCount}</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ flex: 1, maxWidth: '1200px', width: '100%', margin: '0 auto', padding: '36px 24px' }}>
        <div style={{ marginBottom: '28px' }}>
          <Link to="/" style={{ color: 'var(--gold)', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none', marginBottom: '8px' }}>
            <ArrowLeft size={14} /> Back to Home
          </Link>
          <div className="kick" style={{ color: 'var(--gold2)', fontSize: '12px', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
            Saved Curations
          </div>
          <h1 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '36px', color: 'var(--gold2)', margin: '4px 0 0' }}>
            My Jewellery Wishlist ({wishlistItems.length})
          </h1>
        </div>

        {wishlistItems.length === 0 ? (
          <div style={{ background: 'linear-gradient(160deg, #320726, #200318)', border: '1px solid var(--line)', borderRadius: '24px', padding: '60px 24px', textAlign: 'center' }}>
            <Heart size={54} style={{ color: 'var(--gold)', opacity: 0.5, marginBottom: '16px' }} />
            <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '26px', color: 'var(--gold2)', marginBottom: '8px' }}>
              Your Wishlist is Empty
            </h2>
            <p style={{ opacity: 0.8, maxWidth: '440px', margin: '0 auto 28px', fontSize: '14px' }}>
              Save your favourite heirloom temple necklaces, antique kadas, and gemstone rings to revisit anytime.
            </p>
            <Link to="/shop" className="gbtn">
              Discover Top Products <ArrowRight size={14} style={{ marginLeft: '4px' }} />
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '24px' }}>
            {wishlistItems.map((item) => {
              const img = item.image_url;
              const isCss = img && img.startsWith('var(');
              const isUp = img && (img.startsWith('/uploads/') || img.startsWith('http'));
              const bg = isCss ? img : img ? `url("${encodeURI(img)}")` : 'var(--i-neck)';

              return (
                <div
                  key={item.id}
                  style={{
                    background: 'linear-gradient(160deg, #320726, #200318)',
                    border: '1px solid var(--line)',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <div
                    style={{
                      width: '100%',
                      aspectRatio: '1',
                      backgroundImage: bg,
                      backgroundColor: '#24061d',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      position: 'relative'
                    }}
                  >
                    <button
                      onClick={() => toggleWishlist(item)}
                      style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        background: 'rgba(0,0,0,0.5)',
                        border: 0,
                        borderRadius: '50%',
                        width: '36px',
                        height: '36px',
                        display: 'grid',
                        placeItems: 'center',
                        color: '#f87171',
                        cursor: 'pointer'
                      }}
                      title="Remove from wishlist"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div style={{ padding: '18px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <small style={{ color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '11px' }}>
                        {item.category || 'Jewellery'}
                      </small>
                      <h3 style={{ margin: '4px 0 8px', fontSize: '16px', fontFamily: '"Cormorant Garamond", serif', color: 'var(--gold2)' }}>
                        {item.name}
                      </h3>
                      <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--gold2)', marginBottom: '14px' }}>
                        {inr(item.price)}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        className="gbtn"
                        onClick={() => {
                          addToCart(item);
                          toggleWishlist(item);
                        }}
                        style={{ flex: 1, justifyContent: 'center', padding: '10px 14px', fontSize: '13px' }}
                      >
                        Move to Bag
                      </button>
                      <Link
                        to={`/product/${item.id}`}
                        style={{
                          padding: '10px 14px',
                          borderRadius: '999px',
                          border: '1px solid var(--line)',
                          color: 'var(--cream)',
                          textDecoration: 'none',
                          fontSize: '13px',
                          display: 'grid',
                          placeItems: 'center'
                        }}
                      >
                        View
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{ marginTop: 'auto', borderTop: '1px solid var(--line)', padding: '24px', background: 'var(--panel)', fontSize: '13px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
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
