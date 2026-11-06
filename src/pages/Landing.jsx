import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Heart, ShoppingBag, ArrowLeft, ArrowRight, ShieldCheck, Globe, Settings, Star, CheckCircle2, MessageSquare, Search } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useStore } from '../context/StoreContext';
import { productService, categoryService, reviewService, settingsService } from '../services/api';
import '../EthnicEdit.css';

const inr = (n) => '₹' + Number(n).toLocaleString('en-IN');

const resolveSafeImage = (img, fallback = 'var(--i-neck)') => {
  if (!img) return fallback;
  const str = String(img).trim();
  if (str.startsWith('var(')) return str;
  if (str.startsWith('--')) return `var(${str})`;
  return `url("${encodeURI(str)}")`;
};

const INITIAL_SHOP_PRODUCTS = [
  { id: 1, name: 'Temple Lakshmi Necklace', c: 'Necklaces', price: 48500, i: 'var(--i-neck)', slug: 'necklaces' },
  { id: 2, name: 'Pearl Jhumka Earrings', c: 'Earrings', price: 18900, i: 'var(--i-ear)', slug: 'earrings' },
  { id: 3, name: 'Antique Gold Bangles', c: 'Bangles', price: 32400, i: 'var(--i-bang)', slug: 'bangles' },
  { id: 4, name: 'Gemstone Cocktail Ring', c: 'Rings', price: 12600, i: 'var(--i-ring)', slug: 'rings' },
  { id: 5, name: 'Temple Waist Belt', c: 'Bridal Jewellery', price: 54900, i: 'var(--i-belt)', slug: 'bridal-jewellery' },
  { id: 6, name: 'Heirloom Jewellery Chest', c: 'Festive Collections', price: 8900, i: 'var(--i-chest)', slug: 'festive-collections' }
];

const RAIL_COLLECTIONS = [
  { id: 'necklaces', name: 'Necklaces', c: 'Necklaces', i: '--i-neck', slug: 'necklaces' },
  { id: 'earrings', name: 'Earrings', c: 'Earrings', i: '--i-ear', slug: 'earrings' },
  { id: 'bangles', name: 'Bangles', c: 'Bangles', i: '--i-bang', slug: 'bangles' },
  { id: 'rings', name: 'Rings', c: 'Rings', i: '--i-ring', slug: 'rings' },
  { id: 'waist-belts', name: 'Waist Belts', c: 'Waist Belts', i: '--i-belt', slug: 'bridal-jewellery' },
  { id: 'gifting', name: 'Gifting', c: 'Gifting', i: '--i-chest', slug: 'festive-collections' }
];

export default function Landing() {
  const navigate = useNavigate();
  const { cartCount, wishlistCount } = useCart();
  const { user, isAuthenticated, login, register, logout } = useAuth();
  const { lang, setLang, t, isTamil, translateCategory } = useLanguage();
  const { storeSettings, storeName } = useStore();

  // Interactive States
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');

  // Hero Carousel State
  const [currentSlide, setCurrentSlide] = useState(0);
  const heroTouchStartX = useRef(0);
  const canvasRef = useRef(null);

  // Auth Modal State
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');

  // Toast State
  const [toastMessage, setToastMessage] = useState('');
  const [toastActive, setToastActive] = useState(false);

  // Dynamic Collections from Database
  const [railCollections, setRailCollections] = useState(RAIL_COLLECTIONS);

  // Dynamic Products strictly from Database (No stale resurrected dummy items)
  const [shopProducts, setShopProducts] = useState([]);
  const newProducts = (shopProducts.filter((p) => p.is_new).length >= 2
    ? shopProducts.filter((p) => p.is_new)
    : shopProducts
  ).slice(0, 6);

  // Customer Reviews State
  const [reviews, setReviews] = useState([
    {
      id: 1,
      customer_name: 'Priya Sundaram',
      location: 'Chennai, Tamil Nadu',
      rating: 5,
      product_name: 'Temple Lakshmi Necklace',
      comment: 'The antique 24K matte finish on this necklace is absolutely regal. Wore it for my daughter’s engagement and received endless praise. Truly ancestral jewellery craftsmanship.'
    },
    {
      id: 2,
      customer_name: 'Ananya Deshmukh',
      location: 'South Mumbai',
      rating: 5,
      product_name: 'Pearl Jhumka Earrings',
      comment: 'Exceptional weight and genuine freshwater pearls. It looks virtually indistinguishable from heirloom 22k gold. Safe, insured shipping was flawless.'
    },
    {
      id: 3,
      customer_name: 'Dr. Radhika Menon',
      location: 'Bengaluru, Karnataka',
      rating: 5,
      product_name: 'Antique Gold Kada Bangles',
      comment: 'The intricate kemp stone setting and delicate peacock carving are breathtaking. Outstanding customer support and luxurious satin packaging.'
    },
    {
      id: 4,
      customer_name: 'Kavita Subramanian',
      location: 'Coimbatore, Tamil Nadu',
      rating: 5,
      product_name: 'Gemstone Cocktail Ring',
      comment: 'A showstopper piece! The ruby centerpiece catches candlelight majestically. Will definitely order the coordinated bridal set next.'
    }
  ]);
  const reviewRailRef = useRef(null);
  const newArrivalsRailRef = useRef(null);

  const scrollNewArrivalsRail = (offset) => {
    if (newArrivalsRailRef.current) {
      newArrivalsRailRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    reviewService.getReviews({ limit: 30 })
      .then((res) => {
        if (res.success && res.reviews && res.reviews.length > 0) {
          const sorted = [...res.reviews].sort((a, b) => (b.id || 0) - (a.id || 0) || new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
          setReviews(sorted);
        }
      })
      .catch((err) => {
        console.warn('Reviews fetch notice:', err.message);
      });
  }, []);

  const scrollReviewRail = (offset) => {
    if (reviewRailRef.current) {
      reviewRailRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  const loadCategories = useCallback(() => {
    categoryService.getCategories()
      .then((res) => {
        if (res.success && Array.isArray(res.categories) && res.categories.length > 0) {
          const mappedCats = res.categories.map((c) => ({
            id: c.slug || c.id.toString(),
            name: c.name,
            c: c.name,
            i: c.image_url || '--i-neck',
            slug: c.slug || c.id.toString()
          }));
          setRailCollections(mappedCats);
        }
      })
      .catch(() => {});
  }, []);

  const loadProducts = useCallback(() => {
    productService.getProducts({ limit: 100 })
      .then((res) => {
        if (res.success && Array.isArray(res.products)) {
          const mapped = res.products.map((p) => ({
            id: p.id,
            name: p.name,
            c: p.category?.name || 'Jewellery',
            category: p.category?.name || 'Jewellery',
            price: p.selling_price || p.price,
            i: p.images?.[0]?.image_url || p.image_url || 'var(--i-neck)',
            slug: p.category?.slug || 'necklaces',
            is_new: !!p.is_new || (Date.now() - new Date(p.createdAt || 0).getTime() < 30 * 86400000),
            createdAt: p.createdAt
          }));
          setShopProducts(mapped);
        }
      })
      .catch((err) => {
        console.warn('Backend products fetch notice:', err.message);
      });
  }, []);

  useEffect(() => {
    loadCategories();
    loadProducts();

    window.addEventListener('products_updated', loadProducts);
    window.addEventListener('categories_updated', loadCategories);

    return () => {
      window.removeEventListener('products_updated', loadProducts);
      window.removeEventListener('categories_updated', loadCategories);
    };
  }, [loadCategories, loadProducts]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setToastActive(true);
    setTimeout(() => setToastActive(false), 2600);
  };

  // Strict Navigation Rule: Unauthenticated users are redirected to login
  const handleProtectedNavigation = (targetUrl) => {
    if (!isAuthenticated) {
      sessionStorage.setItem('tee_login_redirect', targetUrl || '/');
      showToast('Please sign in to explore and shop handcrafted jewellery.');
      setTimeout(() => {
        navigate('/login');
      }, 500);
      return;
    }

    if (targetUrl.startsWith('#')) {
      const el = document.querySelector(targetUrl);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate(targetUrl);
    }
  };

  const closeAll = useCallback(() => {
    setIsAccountOpen(false);
  }, []);

  // Scroll Header Shadow
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Section Observer
  useEffect(() => {
    const secs = ['home', 'collections', 'shop', 'about', 'contact']
      .map((id) => document.getElementById(id))
      .filter(Boolean);
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActiveSection(e.target.id);
        });
      },
      { rootMargin: '-40% 0px -50% 0px' }
    );
    secs.forEach((s) => spy.observe(s));
    return () => spy.disconnect();
  }, []);

  // Reveal Animation Observer
  useEffect(() => {
    const rv = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            rv.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    document.querySelectorAll('.rv').forEach((el) => rv.observe(el));
    return () => rv.disconnect();
  }, [shopProducts, railCollections, reviews]);

  // Hero Navigation
  const goToSlide = useCallback((index) => {
    setCurrentSlide((index + 3) % 3);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!document.hidden) goToSlide(currentSlide + 1);
    }, 6500);
    return () => clearInterval(interval);
  }, [currentSlide, goToSlide]);

  // Collections Rail Drag / Auto-scroll
  const railRef = useRef(null);
  const railState = useRef({ pos: 0, hold: 0, inside: false, drag: false, dx: 0, ds: 0, moved: 0 });

  const scrollRail = (delta) => {
    railState.current.hold = Date.now() + 2500;
    if (railRef.current) railRef.current.scrollBy({ left: delta, behavior: 'smooth' });
  };

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    const state = railState.current;

    const onPointerEnter = (e) => {
      if (e.pointerType === 'mouse') state.inside = true;
    };
    const onPointerLeave = () => {
      state.inside = false;
    };
    const onHold = () => {
      state.hold = Date.now() + 3500;
    };
    const onPointerDown = (e) => {
      if (e.pointerType === 'mouse') {
        state.drag = true;
        state.moved = 0;
        state.dx = e.clientX;
        state.ds = rail.scrollLeft;
        state.hold = Date.now() + 3500;
      }
    };
    const onPointerMove = (e) => {
      if (state.drag) {
        state.moved = Math.abs(e.clientX - state.dx);
        rail.scrollLeft = state.ds - (e.clientX - state.dx);
      }
    };
    const onPointerUp = () => {
      state.drag = false;
      state.hold = Date.now() + 2500;
    };

    rail.addEventListener('pointerenter', onPointerEnter);
    rail.addEventListener('pointerleave', onPointerLeave);
    rail.addEventListener('touchstart', onHold, { passive: true });
    rail.addEventListener('wheel', onHold, { passive: true });
    rail.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    let rafId;
    const loop = () => {
      const half = rail.scrollWidth / 2;
      const busy = state.inside || state.drag || Date.now() < state.hold || document.hidden;
      if (half > 0) {
        if (busy) {
          state.pos = rail.scrollLeft;
        } else {
          if (!state.pos) state.pos = half / 3;
          state.pos += 0.55;
          if (state.pos >= half) state.pos -= half;
          rail.scrollLeft = state.pos;
        }
      }
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);

    return () => {
      rail.removeEventListener('pointerenter', onPointerEnter);
      rail.removeEventListener('pointerleave', onPointerLeave);
      rail.removeEventListener('touchstart', onHold);
      rail.removeEventListener('wheel', onHold);
      rail.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      cancelAnimationFrame(rafId);
    };
  }, []);

  // Gold Particle Canvas
  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const cx = cv.getContext('2d');
    if (!cx) return;
    let W = window.innerWidth;
    let H = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let pts = [];

    const sz = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      cv.width = W * dpr;
      cv.height = H * dpr;
      cx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    sz();
    window.addEventListener('resize', sz);

    for (let i = 0; i < (window.innerWidth < 700 ? 22 : 46); i++) {
      pts.push({
        x: Math.random(),
        y: Math.random(),
        r: 0.8 + Math.random() * 2,
        s: 0.00004 + Math.random() * 0.00012,
        p: Math.random() * 6.28
      });
    }

    let rafId;
    const fx = (t) => {
      cx.clearRect(0, 0, W, H);
      pts.forEach((p) => {
        p.y -= p.s * 16;
        p.x += Math.sin(t * 0.0004 + p.p) * 0.00012;
        if (p.y < -0.02) {
          p.y = 1.02;
          p.x = Math.random();
        }
        const a = 0.25 + 0.55 * Math.abs(Math.sin(t * 0.0012 + p.p));
        cx.beginPath();
        cx.fillStyle = `rgba(255,214,130,${a})`;
        cx.shadowColor = 'rgba(255,200,100,.9)';
        cx.shadowBlur = 8;
        cx.arc(p.x * W, p.y * H, p.r, 0, 6.283);
        cx.fill();
      });
      rafId = requestAnimationFrame(fx);
    };
    rafId = requestAnimationFrame(fx);

    return () => {
      window.removeEventListener('resize', sz);
      cancelAnimationFrame(rafId);
    };
  }, []);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      if (authMode === 'login') {
        const res = await login(authForm.email, authForm.password);
        if (res.success) {
          setIsAccountOpen(false);
          showToast(`Welcome, ${res.user.name}!`);
          navigate('/');
        }
      } else {
        const res = await register(authForm);
        if (res.success) {
          setIsAccountOpen(false);
          showToast(`Welcome, ${res.user.name}!`);
          navigate('/');
        }
      }
    } catch (err) {
      setAuthError(err.message || 'Authentication failed. Please verify credentials.');
    }
  };

  const railItems = [...railCollections, ...railCollections];

  return (
    <>
      <canvas id="fx" ref={canvasRef} aria-hidden="true"></canvas>

      {/* Toast Notification */}
      <div className={`tst ${toastActive ? 'on' : ''}`}>
        {toastMessage}
      </div>

      {/* Header */}
      <header className={`nav ${isScrolled ? 'sc' : ''}`} id="nav">
        <a className="brand" href="#home" aria-label={`${storeName} home`}>
          <span className="logo"></span>
          <span>
            <b>{storeName}</b>
            <small>{storeSettings.tagline || t('heroSubtitle', 'Tradition, Beautifully Curated.')}</small>
          </span>
        </a>

        <nav className={`menu ${isMenuOpen ? 'open' : ''}`} id="menu" aria-label="Main">
          <a href="#home" className={activeSection === 'home' ? 'on' : ''} onClick={() => setIsMenuOpen(false)}>
            {t('home', 'Home')}
          </a>
          <button
            onClick={() => {
              setIsMenuOpen(false);
              handleProtectedNavigation('#collections');
            }}
            style={{ background: 'none', border: 'none', color: 'inherit', padding: 0, cursor: 'pointer', font: 'inherit' }}
          >
            {t('collections', 'Collections')}
          </button>
          <button
            onClick={() => {
              setIsMenuOpen(false);
              handleProtectedNavigation('/shop');
            }}
            style={{ background: 'none', border: 'none', color: 'inherit', padding: 0, cursor: 'pointer', font: 'inherit' }}
          >
            {t('catalogue', 'Catalogue')}
          </button>
          <button
            onClick={() => {
              setIsMenuOpen(false);
              handleProtectedNavigation('/orders');
            }}
            className="nav-orders-link"
            style={{ background: 'none', border: 'none', color: 'inherit', padding: 0, cursor: 'pointer', font: 'inherit', whiteSpace: 'nowrap' }}
          >
            {t('myOrders', 'My Orders')}
          </button>
          <a href="#about" className={`nav-about-link ${activeSection === 'about' ? 'on' : ''}`} onClick={() => setIsMenuOpen(false)}>
            {t('about', 'About')}
          </a>
          <a href="#contact" className={`nav-contact-link ${activeSection === 'contact' ? 'on' : ''}`} onClick={() => setIsMenuOpen(false)}>
            {t('contact', 'Contact')}
          </a>
          <button
            onClick={() => {
              setIsMenuOpen(false);
              if (isAuthenticated) {
                navigate('/account');
              } else {
                navigate('/login');
              }
            }}
            className="mo"
            id="mA"
            style={{ background: 'none', border: 'none', color: 'var(--gold2)', cursor: 'pointer', font: 'inherit', textAlign: 'left', padding: '12px 0' }}
          >
            {isAuthenticated ? user.name : t('signIn', 'Sign In / Register')}
          </button>
        </nav>

        <div className="tools">
          {/* Header Search Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (searchQuery.trim()) {
                handleProtectedNavigation(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
              }
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              background: 'rgba(255,240,208,0.06)',
              border: '1px solid var(--line)',
              borderRadius: '999px',
              padding: '6px 14px',
              gap: '6px'
            }}
          >
            <Search size={14} style={{ color: 'var(--gold)', opacity: 0.8 }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isTamil ? 'நகைகளைத் தேடவும்...' : 'Search jewellery...'}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--cream)',
                fontSize: '12.5px',
                width: 'clamp(70px, 10vw, 130px)',
                outline: 'none',
                fontFamily: 'var(--font-sans)'
              }}
            />
          </form>

          {isAuthenticated && (
            <button
              onClick={() => navigate('/settings')}
              title={t('settings', 'Settings')}
              style={{ color: 'var(--gold)', padding: '6px', display: 'flex', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <Settings size={18} />
            </button>
          )}

          <button
            id="bW"
            aria-label="Wishlist"
            onClick={() => handleProtectedNavigation('/wishlist')}
            style={{ color: 'var(--gold)', padding: '6px', display: 'flex', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer' }}
            title={t('wishlist', 'Wishlist')}
          >
            <Heart size={20} />
            {wishlistCount > 0 && <span id="cnt" style={{ background: '#f87171' }}>{wishlistCount}</span>}
          </button>
          <button
            id="bA"
            aria-label="Account"
            onClick={() => {
              if (isAuthenticated) {
                navigate('/account');
              } else {
                navigate('/login');
              }
            }}
            title={isAuthenticated ? `${t('adminLoggedInAs', 'Signed in as')} ${user?.name}` : t('signIn', 'Sign In')}
            style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          >
            <svg className="i" viewBox="0 0 24 24">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21a8 8 0 0 1 16 0" />
            </svg>
          </button>
          <button
            id="bB"
            aria-label="Bag"
            onClick={() => handleProtectedNavigation('/cart')}
            style={{ color: '#fff', display: 'flex', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer' }}
            title={t('bag', 'Bag')}
          >
            <ShoppingBag size={20} />
            <span id="cnt">{cartCount}</span>
          </button>
          <button
            id="burger"
            aria-label="Menu"
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg className="i" viewBox="0 0 24 24">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section
          className="hero"
          id="home"
          aria-roledescription="carousel"
          aria-label="Featured"
        >
          {/* Slide 1 - Iconic Model */}
          <div className={`slide ${currentSlide === 0 ? 'on' : ''}`}>
            <div className="vis" style={{ backgroundImage: 'var(--i-model)', backgroundPosition: 'left center' }}></div>
            <div className="tx">
              <div className="kick" style={{ '--k': 0 }}>{storeName}</div>
              <h1 style={{ '--k': 1 }}>
                {isTamil ? <>பாரம்பரியம்,<br /><em>அழகாக</em> செதுக்கப்பட்டது.</> : <>Tradition,<br /><em>Beautifully</em> Curated.</>}
              </h1>
              <p style={{ '--k': 2 }}>{t('heroSubtitle', 'Timeless jewellery for every celebration, crafted with elegance.')}</p>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button
                  className="gbtn"
                  style={{ '--k': 3 }}
                  onClick={() => handleProtectedNavigation('/shop')}
                >
                  {t('shopCollection', 'Shop the Collection')} <span>→</span>
                </button>
                <button
                  style={{
                    '--k': 3,
                    padding: '12px 24px',
                    borderRadius: '999px',
                    border: '1px solid var(--line)',
                    color: 'var(--cream)',
                    background: 'none',
                    fontSize: '13.5px',
                    fontFamily: 'var(--font-sans)',
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    cursor: 'pointer'
                  }}
                  onClick={() => handleProtectedNavigation('/shop')}
                >
                  {t('startShopping', 'Explore Catalogue')}
                </button>
              </div>
            </div>
          </div>

          {/* Slide 2 - Chest */}
          <div className={`slide ${currentSlide === 1 ? 'on' : ''}`}>
            <div className="vis" style={{ backgroundImage: 'var(--i-chest)' }}></div>
            <div className="tx">
              <div className="kick" style={{ '--k': 0 }}>{isTamil ? 'பாரம்பரியக் கொண்டாட்டம்' : 'Celebrate Tradition'}</div>
              <h1 style={{ '--k': 1 }}><em>{t('inEveryDetail', 'In Every Detail.')}</em></h1>
              <p style={{ '--k': 2 }}>{t('inEveryDetailSub', 'Discover the perfect piece for your special moments.')}</p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  className="gbtn"
                  style={{ '--k': 3 }}
                  onClick={() => handleProtectedNavigation('/shop')}
                >
                  {t('exploreMore', 'Explore More')} <span>→</span>
                </button>
              </div>
            </div>
          </div>

          {/* Slide 3 - Arches */}
          <div className={`slide ${currentSlide === 2 ? 'on' : ''}`}>
            <div className="arches">
              <i className="arch" style={{ '--k': 0, backgroundImage: 'var(--i-neck)' }}></i>
              <i className="arch" style={{ '--k': 1, backgroundImage: 'var(--i-ear)' }}></i>
              <i className="arch" style={{ '--k': 2, backgroundImage: 'var(--i-bang)' }}></i>
              <i className="arch" style={{ '--k': 3, backgroundImage: 'var(--i-ring)' }}></i>
              <i className="arch" style={{ '--k': 4, backgroundImage: 'var(--i-belt)' }}></i>
            </div>
            <div className="tx">
              <div className="kick" style={{ '--k': 0 }}>{isTamil ? 'அனைத்து தொகுப்புகள்' : 'Heirloom Collections'}</div>
              <h1 style={{ '--k': 1 }}>{isTamil ? <>நேர்த்தியுடன் <em>வடிவமைக்கப்பட்டது.</em></> : <>Crafted with <em>elegance.</em></>}</h1>
              <p style={{ '--k': 2 }}>{isTamil ? 'அட்டிகைகள் முதல் ஒட்டியாணங்கள் வரை, உங்கள் அழகை மெருகூட்டும் நகைகள்.' : 'From necklaces to waist belts, find the piece that tells your story.'}</p>
              <button
                className="gbtn"
                style={{ '--k': 3 }}
                onClick={() => handleProtectedNavigation('/shop')}
              >
                {t('ourCollections', 'Browse Collections')} <span>→</span>
              </button>
            </div>
          </div>

          <div className="ctl">
            <button className="ar" id="pv" aria-label="Previous slide" onClick={() => goToSlide(currentSlide - 1)}>
              <svg className="i" viewBox="0 0 24 24"><path d="m15 5-7 7 7 7" /></svg>
            </button>
            <div id="dots">
              {[0, 1, 2].map((i) => (
                <button
                  key={i}
                  className={currentSlide === i ? 'on' : ''}
                  aria-label={`Go to slide ${i + 1}`}
                  onClick={() => goToSlide(i)}
                ></button>
              ))}
            </div>
            <button className="ar" id="nx" aria-label="Next slide" onClick={() => goToSlide(currentSlide + 1)}>
              <svg className="i" viewBox="0 0 24 24"><path d="m9 5 7 7-7 7" /></svg>
            </button>
          </div>
        </section>

        {/* Trust Badges */}
        <div className="trust">
          <div>
            <svg className="i" viewBox="0 0 24 24"><path d="M6 3h12l4 6-10 12L2 9z" /><path d="M2 9h20M9 3l3 6 3-6M12 21 9 9m3 12 3-12" /></svg>
            <span>{isTamil ? <>தூய தங்கம் &amp; நவரத்தினங்கள்<br />ஹால்மார்க் தரம்</> : <>Pure Gold &amp; Jewels<br />Quality Assured</>}</span>
          </div>
          <div>
            <svg className="i" viewBox="0 0 24 24"><path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z" /><path d="m9 12 2 2 4-4" /></svg>
            <span>{isTamil ? <>பாதுகாப்பான<br />பரிவர்த்தனை</> : <>Secure<br />Payments</>}</span>
          </div>
          <div>
            <svg className="i" viewBox="0 0 24 24"><path d="M2 6h11v10H2zM13 9h5l3 3v4h-8" /><circle cx="7" cy="18" r="2" /><circle cx="17" cy="18" r="2" /></svg>
            <span>{isTamil ? <>இந்தியா முழுவதும்<br />விரைவான டெலிவரி</> : <>Fast &amp; Reliable<br />Delivery</>}</span>
          </div>
          <div>
            <svg className="i" viewBox="0 0 24 24"><rect x="3" y="8" width="18" height="4" /><path d="M5 12v9h14v-9M12 8v13M12 8c-3 0-5-4-2-4 2 0 2 4 2 4zm0 0c3 0 5-4 2-4-2 0-2 4-2 4z" /></svg>
            <span>{isTamil ? <>துல்லியமான<br />அளவு வழிகாட்டல்</> : <>Expert Sizing<br />Advice</>}</span>
          </div>
        </div>

        {/* Our Collections Rail Section */}
        <section className="sec" id="collections" style={{ paddingInline: 0 }}>
          <div className="hd rv">
            <h2>{t('ourCollections', 'Our Collections')}</h2>
            <p className="ui" style={{ fontSize: '15px' }}>
              {t('ourCollectionsSub', 'Every unique piece in our heritage')}
            </p>
          </div>
          <div className="rail" id="rail" ref={railRef} tabIndex={0} aria-label="Collections">
            {railItems.map((cat, idx) => {
              const bg = resolveSafeImage(cat.i, 'var(--i-neck)');
              return (
                <div
                  className="cc"
                  key={idx}
                  onClick={(e) => {
                    if (railState.current.moved > 6) {
                      e.preventDefault();
                      railState.current.moved = 0;
                      return;
                    }
                    handleProtectedNavigation(`/category/${cat.slug}`);
                  }}
                  style={{ cursor: 'pointer' }}
                  title={`View all ${cat.name}`}
                >
                  <div className="ph" style={{ backgroundImage: bg, backgroundPosition: 'center', backgroundColor: '#24061d' }}></div>
                  <span>{translateCategory(cat.c || cat.name)} →</span>
                </div>
              );
            })}
          </div>
          <div className="railbar">
            <button className="ar" id="rp" aria-label="Scroll left" style={{ display: 'grid' }} onClick={() => scrollRail(-300)}>
              <svg className="i" viewBox="0 0 24 24"><path d="m15 5-7 7 7 7" /></svg>
            </button>
            <button className="ar" id="rn" aria-label="Scroll right" style={{ display: 'grid' }} onClick={() => scrollRail(300)}>
              <svg className="i" viewBox="0 0 24 24"><path d="m9 5 7 7-7 7" /></svg>
            </button>
          </div>
        </section>

        {/* New Products Section - Newly Added Pieces by Admin (Arched rail matching collections) */}
        <section className="sec" id="new-products" style={{ paddingTop: 0 }}>
          <div className="hd rv">
            <div className="kick" style={{ justifyContent: 'center' }}>
              {t('newArrivals', 'New Arrivals')}
            </div>
            <h2>{t('newProducts', 'New Products')}</h2>
            <p className="ui" style={{ fontSize: '15px' }}>
              {t('newProductsSub', 'Recently handcrafted heirloom pieces, fresh from our master artisans.')}
            </p>
          </div>
          <div className="rail" ref={newArrivalsRailRef}>
            {newProducts.map((p) => {
              const imgBg = resolveSafeImage(p.i, 'var(--i-neck)');
              return (
                <article
                  className="cc rv"
                  key={`new-${p.id}`}
                  onClick={() => handleProtectedNavigation(`/product/${p.id}`)}
                  style={{ cursor: 'pointer', textAlign: 'center' }}
                >
                  <div
                    className="ph"
                    style={{ backgroundImage: imgBg, position: 'relative' }}
                    role="img"
                    aria-label={p.name}
                  >
                    <div style={{ position: 'absolute', top: '16px', left: '50%', transform: 'translateX(-50%)', zIndex: 2, background: 'linear-gradient(135deg, #f6dda0, #d4af37)', color: '#1a0418', fontSize: '10px', fontWeight: '700', padding: '3px 12px', borderRadius: '999px', textTransform: 'uppercase', letterSpacing: '0.12em', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', whiteSpace: 'nowrap' }}>
                      {isTamil ? '✨ புதியது' : '✨ New'}
                    </div>
                  </div>
                  <span style={{ display: 'block', marginTop: '14px', font: '500 clamp(17px, 1.6vw, 20px) var(--font-serif)', color: 'var(--gold2)' }}>
                    {p.name} →
                  </span>
                  <div style={{ marginTop: '4px', font: '600 clamp(14px, 1.1vw, 16px) var(--font-sans)', color: 'var(--gold)' }}>
                    {inr(p.price || p.selling_price)}
                  </div>
                </article>
              );
            })}
          </div>
          <div className="railbar">
            <button className="ar" aria-label="Previous" onClick={() => scrollNewArrivalsRail(-280)}>
              <svg className="i" viewBox="0 0 24 24"><path d="m15 19-7-7 7-7" /></svg>
            </button>
            <button className="ar" aria-label="Next" onClick={() => scrollNewArrivalsRail(280)}>
              <svg className="i" viewBox="0 0 24 24"><path d="m9 5 7 7-7 7" /></svg>
            </button>
          </div>
        </section>

        {/* Shop the Edit Section - Displays All Catalogue Items */}
        <section className="sec" id="shop" style={{ paddingTop: 0 }}>
          <div className="hd rv">
            <h2>{t('shopTheEdit', 'Shop the Edit')}</h2>
            <p className="ui" style={{ fontSize: '15px' }}>
              {t('shopTheEditSub', 'Heirloom-inspired pieces, ready to gift or to keep.')}
            </p>
          </div>
          <div className="grid" id="grid">
            {shopProducts.map((p) => {
              const imgBg = resolveSafeImage(p.i, 'var(--i-neck)');
              return (
                <article
                  className="pc rv"
                  key={p.id}
                  onClick={() => handleProtectedNavigation(`/product/${p.id}`)}
                  style={{ cursor: 'pointer', position: 'relative' }}
                >
                  {p.is_new && (
                    <div style={{ position: 'absolute', top: '12px', left: '12px', zIndex: 2, background: 'linear-gradient(135deg, #f6dda0, #d4af37)', color: '#1a0418', fontSize: '10px', fontWeight: 'bold', padding: '4px 10px', borderRadius: '999px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                      {isTamil ? '✨ புதியது' : '✨ New'}
                    </div>
                  )}
                  <div className="wr">
                    <div
                      className="im"
                      style={{ backgroundImage: imgBg }}
                      role="img"
                      aria-label={p.name}
                    ></div>
                  </div>
                  <div className="in">
                    <small>{translateCategory(p.category || p.c)}</small>
                    <h3>{p.name}</h3>
                    <div className="row">
                      <span className="pr">{inr(p.price || p.selling_price)}</span>
                      <button
                        className="add"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleProtectedNavigation(`/product/${p.id}`);
                        }}
                      >
                        {t('addToBag', 'Add to bag')}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* Promotional Banner Section */}
        <section className="promo" id="promo">
          <div className="vis" style={{ backgroundImage: 'var(--i-chest)' }}></div>
          <div className="tx rv">
            <div className="kick">{isTamil ? 'பாரம்பரியக் கொண்டாட்டம்' : 'Celebrate Tradition'}</div>
            <h2>{t('inEveryDetail', 'In Every Detail.')}</h2>
            <p>{t('inEveryDetailSub', 'Discover the perfect piece for your special moments.')}</p>
            <button
              className="gbtn"
              onClick={() => handleProtectedNavigation('/shop')}
            >
              {t('exploreMore', 'Explore More')} <span>→</span>
            </button>
          </div>
        </section>

        {/* About Section */}
        <section className="sec" id="about">
          <div className="two">
            <div className="frame rv" style={{ backgroundImage: 'var(--i-model)' }}></div>
            <div className="rv">
              <div className="kick">{isTamil ? 'எங்கள் கதை' : 'Our Story'}</div>
              <h2>{t('legacyTitle', 'Jewellery that carries a legacy.')}</h2>
              <p>{storeSettings.about_story || t('legacyDesc1', 'The Ethnic Edit brings together temple-inspired designs, antique gold finishes and delicate pearl work, curated for weddings, festivals and every moment worth celebrating.')}</p>
              <p>{t('legacyDesc2', 'Each piece is chosen for its craftsmanship and its story, so what you wear feels both timeless and personal.')}</p>
              <div className="pts">
                <span>{t('naturalGold', 'Natural Gold Finish')}</span>
                <span>{t('antiqueKemp', 'Antique Kemp Work')}</span>
                <span>{t('velvetPackaging', 'Luxury Packaging')}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Customer Reviews & Patron Love (Wall of Love) */}
        <section className="sec" id="reviews" style={{ paddingTop: '20px', paddingBottom: '60px' }}>
          <div className="hd rv" style={{ marginBottom: '24px' }}>
            <div className="kick" style={{ justifyContent: 'center' }}>
              {isTamil ? 'வாடிக்கையாளர் மதிப்புரைகள்' : 'Wall of Love'}
            </div>
            <h2>{isTamil ? 'எங்கள் வாடிக்கையாளர்களின் அன்பு' : 'Adored by 10,000+ Patrons Across India'}</h2>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginTop: '12px' }}>
              <div style={{ display: 'flex', color: 'var(--gold)', gap: '2px' }}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={16} fill="var(--gold)" color="var(--gold)" />
                ))}
              </div>
              <span style={{ fontSize: '14px', color: 'var(--gold2)', fontWeight: 600 }}>
                4.9 / 5.0 · {isTamil ? 'சரிபார்க்கப்பட்ட வாடிக்கையாளர் அனுபவம்' : '1,400+ Verified Heirloom Purchases'}
              </span>
            </div>
          </div>

          {/* Horizontal Review Cards Carousel */}
          <div style={{ position: 'relative', marginTop: '20px' }}>
            <div
              ref={reviewRailRef}
              style={{
                display: 'flex',
                gap: '20px',
                overflowX: 'auto',
                scrollSnapType: 'x mandatory',
                padding: '10px 4px 20px',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
              }}
            >
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  style={{
                    flex: '0 0 clamp(280px, 30vw, 360px)',
                    scrollSnapAlign: 'start',
                    background: 'linear-gradient(160deg, #320726, #200318)',
                    border: '1px solid var(--line)',
                    borderRadius: '20px',
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 12px 32px rgba(0,0,0,0.4)',
                    transition: 'transform 0.25s'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', gap: '3px', color: 'var(--gold)' }}>
                        {[...Array(rev.rating || 5)].map((_, i) => (
                          <Star key={i} size={15} fill="var(--gold)" color="var(--gold)" />
                        ))}
                      </div>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.4)', color: '#86efac', fontSize: '11px', padding: '2px 8px', borderRadius: '999px', fontWeight: 500 }}>
                        <CheckCircle2 size={12} /> Verified
                      </span>
                    </div>

                    <p style={{ fontSize: '14px', lineHeight: '1.6', color: 'var(--cream)', opacity: 0.9, margin: '0 0 12px', fontStyle: 'italic' }}>
                      "{rev.comment}"
                    </p>

                    {rev.image_url && (
                      <div style={{ marginBottom: '12px', borderRadius: '10px', overflow: 'hidden', height: '110px' }}>
                        <img
                          src={rev.image_url}
                          alt="Customer review photo"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                    )}
                  </div>

                  <div style={{ borderTop: '1px solid rgba(229,189,114,0.18)', paddingTop: '12px', marginTop: 'auto' }}>
                    <b style={{ display: 'block', fontSize: '14.5px', color: 'var(--gold2)' }}>
                      {rev.customer_name}
                    </b>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', opacity: 0.7, marginTop: '2px' }}>
                      <span>{rev.location || 'Verified Patron'}</span>
                      {rev.product_name && <span style={{ color: 'var(--gold)' }}>{rev.product_name}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Carousel navigation arrows & Feedback button */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  className="ar"
                  onClick={() => scrollReviewRail(-340)}
                  aria-label="Previous Reviews"
                  style={{ display: 'grid' }}
                >
                  <ArrowLeft size={16} />
                </button>
                <button
                  className="ar"
                  onClick={() => scrollReviewRail(340)}
                  aria-label="Next Reviews"
                  style={{ display: 'grid' }}
                >
                  <ArrowRight size={16} />
                </button>
              </div>

              <Link
                to="/feedback"
                className="gbtn out"
                style={{
                  padding: '10px 22px',
                  fontSize: '13px',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <MessageSquare size={15} />
                {isTamil ? 'உங்கள் மதிப்புரையைப் பகிரவும் →' : 'Write a Review / Share Feedback →'}
              </Link>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="sec" id="contact" style={{ paddingTop: 0 }}>
          <div className="two">
            <div className="rv">
              <div className="kick">{t('contact', 'Contact')}</div>
              <h2>{t('contactTitle', "We'd love to hear from you.")}</h2>
              <p>{t('contactSub', "Questions about a piece, a custom order or gifting? Write to us and we'll reply within a day.")}</p>
              <div className="cinfo">
                <a href={`mailto:${storeSettings.contact_email || 'hello@theethnicedit.com'}`}>
                  ✉ {storeSettings.contact_email || 'hello@theethnicedit.com'}
                </a>
                <a href={`tel:${(storeSettings.contact_phone || '+91 98765 43210').replace(/\s+/g, '')}`}>
                  ☎ {storeSettings.contact_phone || '+91 98765 43210'}
                </a>
                <span>
                  ◉ {storeSettings.contact_hours || (isTamil ? 'திங்கள் - சனி, காலை 10 - இரவு 10 IST' : 'Mon–Sat, 10am–10pm IST')}
                </span>
              </div>
            </div>
            <form className="f rv" id="cf" onSubmit={(e) => { e.preventDefault(); e.target.reset(); showToast(t('messageSent', 'Message sent to curators.')); }}>
              <label>
                {t('fullName', 'Name')}
                <input required name="n" autoComplete="name" />
              </label>
              <label>
                {t('emailAddress', 'Email')}
                <input required type="email" name="e" autoComplete="email" />
              </label>
              <label>
                {t('messagePlaceholder', 'Message')}
                <textarea required name="m"></textarea>
              </label>
              <button className="gbtn" type="submit" style={{ justifySelf: 'start' }}>
                {t('sendMessage', 'Send Message')}
              </button>
            </form>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer>
        <div className="fg">
          <div>
            <a className="brand" href="#home" style={{ marginBottom: '16px' }}>
              <span className="logo"></span>
              <span>
                <b>{storeName}</b>
              </span>
            </a>
            <p>{t('footerDesc', 'Timeless jewellery for every celebration, crafted with elegance.')}</p>
          </div>
          <div>
            <h4>{t('quickLinks', 'Explore')}</h4>
            <ul>
              <li><a href="#home">{t('home', 'Home')}</a></li>
              <li>
                <button
                  onClick={() => handleProtectedNavigation('/shop')}
                  style={{ background: 'none', border: 'none', color: 'inherit', padding: '5px 0', cursor: 'pointer', font: 'inherit' }}
                >
                  {t('catalogue', 'Catalogue')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleProtectedNavigation('#collections')}
                  style={{ background: 'none', border: 'none', color: 'inherit', padding: '5px 0', cursor: 'pointer', font: 'inherit' }}
                >
                  {t('collections', 'Collections')}
                </button>
              </li>
              <li><a href="#about">{t('about', 'About Us')}</a></li>
              <li><a href="#contact">{t('contact', 'Contact')}</a></li>
            </ul>
          </div>
          <div>
            <h4>{t('helpInfo', 'Help & Policies')}</h4>
            <ul>
              <li><a href="#contact">{t('shippingPolicy', 'Shipping & Delivery')}</a></li>
              <li><a href="#contact">{t('returnsPolicy', 'Returns & Exchange')}</a></li>
              <li><a href="#contact">{t('privacyPolicy', 'Privacy Policy')}</a></li>
              <li>
                <Link to="/feedback" style={{ color: 'var(--gold2)', padding: '5px 0', textDecoration: 'none' }}>
                  {isTamil ? 'வாடிக்கையாளர் மதிப்புரைகள்' : 'Reviews & Feedback'} ⭐
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4>{t('newsletter', 'Newsletter')}</h4>
            <p style={{ marginBottom: '12px' }}>
              {t('newsletterDesc', 'New collections and festive offers, straight to your inbox.')}
            </p>
            <form className="nl" id="nl" onSubmit={(e) => { e.preventDefault(); e.target.reset(); showToast(isTamil ? 'செய்தி மடலில் இணைந்ததற்கு நன்றி!' : 'Subscribed to newsletter.'); }}>
              <input type="email" required placeholder={isTamil ? 'உங்கள் மின்னஞ்சல்' : 'Your email'} aria-label="Email address" />
              <button type="submit">{t('subscribe', 'Subscribe')}</button>
            </form>
          </div>
        </div>

        {/* Footer Bottom with Powered by Aminoid */}
        <div className="fb">
          <span>© {new Date().getFullYear()} {storeName}. {t('allRightsReserved', 'All rights reserved.')}</span>
          <span>
            Powered by{' '}
            <a
              href="https://www.aminoid.in/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--gold2)', textDecoration: 'underline', fontWeight: 500 }}
            >
              Aminoid
            </a>
          </span>
          <span>{isTamil ? 'தனியுரிமை · விதிமுறைகள்' : 'Privacy · Terms'}</span>
        </div>
      </footer>
    </>
  );
}
