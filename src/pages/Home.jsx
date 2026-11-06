import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Heart, Star, ArrowRight, ShoppingBag } from 'lucide-react';
import { productService, categoryService, bannerService } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import ProductDetailModal from '../components/ProductDetailModal';
import CheckoutModal from '../components/CheckoutModal';
import OrderSuccessModal from '../components/OrderSuccessModal';
import OrderTracking from './OrderTracking';
import '../EthnicEdit.css';

const inr = (n) => '₹' + Number(n).toLocaleString('en-IN');

const CORE_PRODUCTS = [
  { id: 'neck', name: 'Temple Lakshmi Necklace', category: { name: 'Necklaces', slug: 'necklaces' }, selling_price: 48500, original_price: 54900, image_url: 'var(--i-neck)', rating: 4.9, reviews_count: 128, description: 'This temple necklace is an ode to timeless South Indian bridal grandeur. Featuring an ornate central pendant of Goddess Lakshmi flanked by dancing peacocks.' },
  { id: 'ear', name: 'Pearl Jhumka Earrings', category: { name: 'Earrings', slug: 'earrings' }, selling_price: 18900, original_price: 21500, image_url: 'var(--i-ear)', rating: 4.8, reviews_count: 94, description: 'Classic bell-shaped jhumkas suspended from an intricate floral ear stud. Finished with a fringe of micro seed pearls.' },
  { id: 'bang', name: 'Antique Gold Bangles', category: { name: 'Bangles', slug: 'bangles' }, selling_price: 32400, original_price: 36000, image_url: 'var(--i-bang)', rating: 4.9, reviews_count: 76, description: 'Pair of solid kada bangles showcasing openwork filigree craft inspired by temple architecture.' },
  { id: 'ring', name: 'Gemstone Cocktail Ring', category: { name: 'Rings', slug: 'rings' }, selling_price: 12600, original_price: 14500, image_url: 'var(--i-ring)', rating: 4.7, reviews_count: 52, description: 'Centred with an oval cabochon synthetic ruby surrounded by floral petals encrusted with un-cut polki crystals.' },
  { id: 'belt', name: 'Temple Waist Belt', category: { name: 'Waist Belts', slug: 'waist-belts' }, selling_price: 54900, original_price: 62000, image_url: 'var(--i-belt)', rating: 5.0, reviews_count: 41, description: 'An heirloom vaddanam waist belt crafted for the contemporary bride. The central panel depicts Goddess Lakshmi.' },
  { id: 'box', name: 'Heirloom Jewellery Chest', category: { name: 'Gifting', slug: 'gifting' }, selling_price: 8900, original_price: 10500, image_url: 'var(--i-chest)', rating: 4.9, reviews_count: 83, description: 'Designed exclusively for keeping your precious temple jewellery tarnishing-free. Featuring carved brass fittings.' }
];

const RAIL_COLLECTIONS = [
  { id: 'neck', name: 'Necklaces', c: 'Necklaces', i: '--i-neck', slug: 'necklaces' },
  { id: 'ear', name: 'Earrings', c: 'Earrings', i: '--i-ear', slug: 'earrings' },
  { id: 'bang', name: 'Bangles', c: 'Bangles', i: '--i-bang', slug: 'bangles' },
  { id: 'ring', name: 'Rings', c: 'Rings', i: '--i-ring', slug: 'rings' },
  { id: 'belt', name: 'Waist Belts', c: 'Waist Belts', i: '--i-belt', slug: 'waist-belts' },
  { id: 'box', name: 'Gifting', c: 'Gifting', i: '--i-chest', slug: 'gifting' }
];

export default function Home() {
  const navigate = useNavigate();
  const { cartItems, cartCount, cartSubtotal, addToCart, updateQuantity, isCartOpen, setIsCartOpen, toggleWishlist, isInWishlist, wishlistCount } = useCart();
  const { user, isAuthenticated, login, register, logout } = useAuth();

  // Dynamic Content State - pre-populated with core pieces so original images are never lost
  const [products, setProducts] = useState(CORE_PRODUCTS);
  const [categories, setCategories] = useState([]);
  const [banners, setBanners] = useState([]);
  const [promoBanner, setPromoBanner] = useState(null);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const [loading, setLoading] = useState(false);

  // UI Interactive States
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  // Modals
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [trackingOrderNumber, setTrackingOrderNumber] = useState(null);

  // Search & Account forms
  const [searchQuery, setSearchQuery] = useState('');
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');

  // Hero Carousel State
  const [currentSlide, setCurrentSlide] = useState(0);
  const heroTouchStartX = useRef(0);
  const cartBadgeRef = useRef(null);
  const searchInputRef = useRef(null);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState('');
  const [toastActive, setToastActive] = useState(false);
  const toastTimerRef = useRef(null);

  const showToast = useCallback((msg) => {
    setToastMessage(msg);
    setToastActive(true);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => {
      setToastActive(false);
    }, 2800);
  }, []);

  // Fetch Dynamic Data from Backend
  const fetchData = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes, banRes, promoRes] = await Promise.allSettled([
        productService.getProducts(),
        categoryService.getCategories(),
        bannerService.getBanners({ type: 'hero' }),
        bannerService.getBanners({ type: 'promo' })
      ]);

      if (prodRes.status === 'fulfilled' && prodRes.value.success && prodRes.value.products?.length > 0) {
        const dbProducts = prodRes.value.products;
        const coreNames = new Set(CORE_PRODUCTS.map(p => p.name.toLowerCase()));
        const extra = dbProducts.filter(p => !coreNames.has(p.name.toLowerCase())).map(p => ({
          ...p,
          image_url: p.images?.[0]?.image_url || p.image_url || 'var(--i-neck)'
        }));
        setProducts([...CORE_PRODUCTS, ...extra]);
      }
      if (catRes.status === 'fulfilled' && catRes.value.success) {
        setCategories(catRes.value.categories || []);
      }
      if (banRes.status === 'fulfilled' && banRes.value.success && banRes.value.banners.length > 0) {
        setBanners(banRes.value.banners);
      }
      if (promoRes.status === 'fulfilled' && promoRes.value.success && promoRes.value.banners.length > 0) {
        setPromoBanner(promoRes.value.banners[0]);
      }
    } catch (err) {
      console.warn('Backend fetch notice:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Close overlays
  const closeAll = useCallback(() => {
    setIsSearchOpen(false);
    setIsAccountOpen(false);
    setIsCartOpen(false);
    setSelectedProduct(null);
  }, [setIsCartOpen]);

  // Escape key closes modals
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') closeAll();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [closeAll]);

  // Scroll Header Shadow
  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Section ScrollSpy Observer
  useEffect(() => {
    const secs = ['home', 'shop', 'collections', 'about', 'contact']
      .map((id) => document.getElementById(id))
      .filter(Boolean);
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setActiveSection(e.target.id);
          }
        });
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );
    secs.forEach((s) => spy.observe(s));
    return () => spy.disconnect();
  }, []);

  // Reveal Animation Observer (.rv)
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
  }, [products, categories]);

  // Hero Carousel Navigation (3 iconic original slides)
  const slideCount = 3;
  const goToSlide = useCallback((index) => {
    setCurrentSlide((index + slideCount) % slideCount);
  }, [slideCount]);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;
    const interval = setInterval(() => {
      if (!document.hidden) {
        goToSlide(currentSlide + 1);
      }
    }, 6500);
    return () => clearInterval(interval);
  }, [currentSlide, goToSlide]);

  const handleHeroTouchStart = (e) => {
    heroTouchStartX.current = e.touches[0].clientX;
  };

  const handleHeroTouchEnd = (e) => {
    const diff = e.changedTouches[0].clientX - heroTouchStartX.current;
    if (Math.abs(diff) > 50) {
      goToSlide(currentSlide + (diff < 0 ? 1 : -1));
    }
  };

  // Product Focus / Highlight Scroll
  const focusProduct = useCallback((id) => {
    const el = document.querySelector(`.pc[data-id="${id}"]`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.remove('hl');
      void el.offsetWidth;
      el.classList.add('hl');
    }
  }, []);

  // Collections Rail Marquee & Drag Scroll
  const railRef = useRef(null);
  const railState = useRef({
    pos: 0,
    hold: 0,
    inside: false,
    drag: false,
    dx: 0,
    ds: 0,
    moved: 0
  });

  const scrollRail = (delta) => {
    railState.current.hold = Date.now() + 2500;
    if (railRef.current) {
      railRef.current.scrollBy({ left: delta, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    const state = railState.current;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
      const busy = state.inside || state.drag || Date.now() < state.hold || document.hidden || reduce;
      if (half > 0) {
        if (busy) {
          state.pos = rail.scrollLeft;
        } else {
          if (!state.pos) state.pos = half / 3;
          state.pos += 0.55;
          if (state.pos >= half) state.pos -= half;
          rail.scrollLeft = state.pos;
        }
        if (rail.scrollLeft >= half) {
          rail.scrollLeft -= half;
          state.pos = rail.scrollLeft;
        } else if (rail.scrollLeft <= 0 && busy) {
          rail.scrollLeft = half;
          state.pos = half;
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
  }, [categories]);

  // Gold Canvas Particles Effect (#fx)
  const canvasRef = useRef(null);
  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const cx = cv.getContext('2d');
    if (!cx) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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
        p: Math.random() * 6.28,
        d: Math.random() * 0.0004
      });
    }

    let rafId;
    const fx = (t) => {
      cx.clearRect(0, 0, W, H);
      if (!reduce) {
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
      }
      rafId = requestAnimationFrame(fx);
    };
    rafId = requestAnimationFrame(fx);

    return () => {
      window.removeEventListener('resize', sz);
      cancelAnimationFrame(rafId);
    };
  }, []);

  // Form Submissions
  const handleContactSubmit = (e) => {
    e.preventDefault();
    e.target.reset();
    showToast('Thank you! Your message has been sent to our curators.');
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    e.target.reset();
    showToast('Subscribed. Welcome to The Ethnic Edit privileged circle.');
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      if (authMode === 'login') {
        const res = await login(authForm.email, authForm.password);
        if (res.success) {
          setIsAccountOpen(false);
          showToast(`Welcome back, ${res.user.name}!`);
          if (res.user.role === 'admin') {
            navigate('/admin/dashboard');
          } else {
            // Redirect to home page upon customer login
            navigate('/');
          }
        }
      } else {
        const res = await register(authForm);
        if (res.success) {
          setIsAccountOpen(false);
          showToast(`Welcome to The Ethnic Edit, ${res.user.name}!`);
          // Redirect to home page upon customer register
          navigate('/');
        }
      }
    } catch (err) {
      setAuthError(err.message || 'Authentication failed. Please check credentials.');
    }
  };

  // Filter Products by category and search
  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      selectedCategoryFilter === 'all' ||
      p.category_id?.toString() === selectedCategoryFilter ||
      p.category?.slug === selectedCategoryFilter ||
      p.category?.name?.toLowerCase() === selectedCategoryFilter.toLowerCase();
    const matchesSearch =
      !searchQuery.trim() ||
      (p.name + ' ' + (p.category?.name || '')).toLowerCase().includes(searchQuery.trim().toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Collections for rail (original 6 categories doubled for marquee)
  const railItems = [...RAIL_COLLECTIONS, ...RAIL_COLLECTIONS];

  return (
    <>
      <canvas id="fx" ref={canvasRef} aria-hidden="true"></canvas>

      {/* Top Flipkart-Style Announcement Banner */}
      <div style={{ background: 'linear-gradient(90deg, #320726, #4a0d39, #320726)', color: 'var(--gold2)', padding: '6px 16px', fontSize: '11px', textAlign: 'center', letterSpacing: '0.08em', textTransform: 'uppercase', borderBottom: '1px solid rgba(212,175,55,0.2)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
        <span>✨ Insured Express Delivery Across India · Use Code <b>WELCOME10</b> for 10% Off · Certified 24k Matte Gold Finish</span>
      </div>

      {/* Header */}
      <header className={`nav ${isScrolled ? 'sc' : ''}`} id="nav">
        <a className="brand" href="#home" aria-label="The Ethnic Edit home">
          <span className="logo"></span>
          <span>
            <b>THE ETHNIC EDIT</b>
            <small>Tradition, Beautifully Curated.</small>
          </span>
        </a>

        <nav className={`menu ${isMenuOpen ? 'open' : ''}`} id="menu" aria-label="Main">
          <a href="#home" className={activeSection === 'home' ? 'on' : ''} onClick={() => setIsMenuOpen(false)}>
            Home
          </a>
          <a href="#top-products" onClick={() => setIsMenuOpen(false)}>
            Top Products
          </a>
          <a href="#collections" className={activeSection === 'collections' ? 'on' : ''} onClick={() => setIsMenuOpen(false)}>
            Collections
          </a>
          <Link to="/shop" onClick={() => setIsMenuOpen(false)}>
            Catalogue
          </Link>
          <Link to="/wishlist" onClick={() => setIsMenuOpen(false)}>
            Wishlist {wishlistCount > 0 && `(${wishlistCount})`}
          </Link>
          <a href="#about" className={activeSection === 'about' ? 'on' : ''} onClick={() => setIsMenuOpen(false)}>
            About
          </a>
          <a href="#contact" className={activeSection === 'contact' ? 'on' : ''} onClick={() => setIsMenuOpen(false)}>
            Contact
          </a>
          <a
            href="#"
            className="mo"
            id="mA"
            onClick={(e) => {
              e.preventDefault();
              setIsMenuOpen(false);
              if (isAuthenticated) {
                navigate('/account');
              } else {
                closeAll();
                setIsAccountOpen(true);
              }
            }}
          >
            {isAuthenticated ? `Hi, ${user.name}` : 'Account / Sign In'}
          </a>
        </nav>

        <div className="tools">
          <button
            id="bS"
            aria-label="Search"
            onClick={() => {
              closeAll();
              setIsSearchOpen(true);
              setTimeout(() => searchInputRef.current?.focus(), 60);
            }}
          >
            <svg className="i" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
          </button>
          <Link
            to="/wishlist"
            id="bW"
            aria-label="Wishlist"
            style={{
              position: 'relative',
              background: 'transparent',
              border: 0,
              color: 'var(--gold)',
              display: 'grid',
              placeItems: 'center',
              cursor: 'pointer',
              padding: '6px'
            }}
            title="Wishlist"
          >
            <Heart size={20} />
            {wishlistCount > 0 && (
              <span id="cnt" style={{ background: '#f87171' }}>
                {wishlistCount}
              </span>
            )}
          </Link>
          <button
            id="bA"
            aria-label="Account"
            onClick={() => {
              if (isAuthenticated) {
                navigate('/account');
              } else {
                closeAll();
                setIsAccountOpen(true);
              }
            }}
            title={isAuthenticated ? `Signed in as ${user?.name}` : 'Sign In'}
          >
            <svg className="i" viewBox="0 0 24 24">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21a8 8 0 0 1 16 0" />
            </svg>
          </button>
          <button
            id="bB"
            aria-label="Shopping bag"
            onClick={() => {
              closeAll();
              setIsCartOpen(true);
            }}
          >
            <svg className="i" viewBox="0 0 24 24">
              <path d="M6 7h12l1 13H5z" />
              <path d="M9 7a3 3 0 0 1 6 0" />
            </svg>
            <span id="cnt" ref={cartBadgeRef}>
              {cartCount}
            </span>
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
        {/* Hero Section - Preserving Original Iconic Landing Page Slides */}
        <section
          className="hero"
          id="home"
          aria-roledescription="carousel"
          aria-label="Featured"
          onTouchStart={handleHeroTouchStart}
          onTouchEnd={handleHeroTouchEnd}
        >
          {/* Slide 1 - Iconic Model */}
          <div className={`slide ${currentSlide === 0 ? 'on' : ''}`}>
            <div className="vis" style={{ backgroundImage: 'var(--i-model)', backgroundPosition: 'left center' }}></div>
            <div className="tx">
              <div className="kick" style={{ '--k': 0 }}>The Ethnic Edit</div>
              <h1 style={{ '--k': 1 }}>Tradition,<br /><em>Beautifully</em> Curated.</h1>
              <p style={{ '--k': 2 }}>Timeless jewellery for every celebration, crafted with elegance.</p>
              <a className="gbtn" style={{ '--k': 3 }} href="#shop">Shop the Collection <span>→</span></a>
            </div>
          </div>
          {/* Slide 2 - Heirloom Chest */}
          <div className={`slide ${currentSlide === 1 ? 'on' : ''}`}>
            <div className="vis" style={{ backgroundImage: 'var(--i-chest)' }}></div>
            <div className="tx">
              <div className="kick" style={{ '--k': 0 }}>Celebrate Tradition</div>
              <h1 style={{ '--k': 1 }}><em>In Every Detail.</em></h1>
              <p style={{ '--k': 2 }}>Discover the perfect piece for your special moments.</p>
              <a className="gbtn" style={{ '--k': 3 }} href="#shop">Explore More <span>→</span></a>
            </div>
          </div>
          {/* Slide 3 - Five Arches */}
          <div className={`slide ${currentSlide === 2 ? 'on' : ''}`}>
            <div className="arches">
              <i className="arch" style={{ '--k': 0, backgroundImage: 'var(--i-neck)' }}></i>
              <i className="arch" style={{ '--k': 1, backgroundImage: 'var(--i-ear)' }}></i>
              <i className="arch" style={{ '--k': 2, backgroundImage: 'var(--i-bang)' }}></i>
              <i className="arch" style={{ '--k': 3, backgroundImage: 'var(--i-ring)' }}></i>
              <i className="arch" style={{ '--k': 4, backgroundImage: 'var(--i-belt)' }}></i>
            </div>
            <div className="tx">
              <div className="kick" style={{ '--k': 0 }}>Five Collections</div>
              <h1 style={{ '--k': 1 }}>Crafted with <em>elegance.</em></h1>
              <p style={{ '--k': 2 }}>From necklaces to waist belts, find the piece that tells your story.</p>
              <a className="gbtn" style={{ '--k': 3 }} href="#collections">Browse Collections <span>→</span></a>
            </div>
          </div>

          <div className="ctl">
            <button className="ar" id="pv" aria-label="Previous slide" onClick={() => goToSlide(currentSlide - 1)}>
              <svg className="i" viewBox="0 0 24 24"><path d="m15 5-7 7 7 7" /></svg>
            </button>
            <div id="dots">
              {Array.from({ length: slideCount }).map((_, i) => (
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
            <svg className="i" viewBox="0 0 24 24">
              <path d="M6 3h12l4 6-10 12L2 9z" />
              <path d="M2 9h20M9 3l3 6 3-6M12 21 9 9m3 12 3-12" />
            </svg>
            <span>Premium Quality<br />Assured</span>
          </div>
          <div>
            <svg className="i" viewBox="0 0 24 24">
              <path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
            <span>Secure<br />Payments</span>
          </div>
          <div>
            <svg className="i" viewBox="0 0 24 24">
              <path d="M2 6h11v10H2zM13 9h5l3 3v4h-8" />
              <circle cx="7" cy="18" r="2" />
              <circle cx="17" cy="18" r="2" />
            </svg>
            <span>Fast &amp; Reliable<br />Delivery</span>
          </div>
          <div>
            <svg className="i" viewBox="0 0 24 24">
              <rect x="3" y="8" width="18" height="4" />
              <path d="M5 12v9h14v-9M12 8v13M12 8c-3 0-5-4-2-4 2 0 2 4 2 4zm0 0c3 0 5-4 2-4-2 0-2 4-2 4z" />
            </svg>
            <span>Elegant Gifting<br />Options</span>
          </div>
        </div>

        {/* Collections Rail Section */}
        <section className="sec" id="collections" style={{ paddingInline: 0 }}>
          <div className="hd rv">
            <h2>Our Collections</h2>
            <p className="ui" style={{ fontSize: '15px' }}>
              Drag, swipe or use the arrows
            </p>
          </div>
          <div className="rail" id="rail" ref={railRef} tabIndex={0} aria-label="Collections">
            {railItems.map((cat, idx) => {
              const bg = cat.i ? `var(${cat.i})` : (cat.image_url && cat.image_url.startsWith('var(')) ? cat.image_url : `url(${cat.image_url})`;
              return (
                <Link
                  className="cc"
                  to={`/category/${cat.slug || cat.id}`}
                  key={idx}
                  onClick={(e) => {
                    if (railState.current.moved > 6) {
                      e.preventDefault();
                      railState.current.moved = 0;
                    }
                  }}
                >
                  <div className="ph" style={{ backgroundImage: bg, backgroundPosition: 'center', backgroundColor: '#24061d' }}></div>
                  <span>{cat.c || cat.name} →</span>
                </Link>
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

        {/* Top Products & Best Sellers (Single-Vendor E-Commerce Showcase) */}
        <section className="sec" id="top-products" style={{ paddingTop: '20px' }}>
          <div className="hd rv" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px', marginBottom: '28px' }}>
            <div>
              <div className="kick" style={{ color: 'var(--gold2)', fontSize: '12px', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '4px' }}>
                Featured Curations
              </div>
              <h2 style={{ margin: 0 }}>Top Products &amp; Best Sellers</h2>
              <p style={{ margin: '6px 0 0', opacity: 0.85 }}>Handpicked heirlooms most coveted by our patrons across celebrations.</p>
            </div>
            <Link to="/shop" className="gbtn" style={{ fontSize: '13px', padding: '10px 22px' }}>
              Explore Full Catalogue <span>→</span>
            </Link>
          </div>

          <div className="grid" id="grid">
            {CORE_PRODUCTS.map((p, idx) => {
              const price = parseFloat(p.selling_price || 0);
              const originalPrice = parseFloat(p.original_price || price * 1.15);
              const discountPct = originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
              const wishlisted = isInWishlist(p.id);

              return (
                <article
                  className="pc in"
                  data-id={p.id}
                  key={p.id}
                  style={{ cursor: 'pointer', position: 'relative' }}
                  onClick={() => setSelectedProduct(p)}
                >
                  {/* Top Badge */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      zIndex: 2,
                      background: idx === 0 ? 'linear-gradient(135deg, #f59e0b, #d97706)' : idx === 1 ? 'linear-gradient(135deg, #10b981, #059669)' : 'rgba(212,175,55,0.9)',
                      color: '#1a0418',
                      fontSize: '10px',
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                    }}
                  >
                    {idx === 0 ? '🔥 #1 Best Seller' : idx === 1 ? '✨ Trending' : idx === 2 ? '👑 Royal Heritage' : '✦ Curated'}
                  </div>

                  {/* Wishlist Heart Toggle */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWishlist(p);
                      showToast(wishlisted ? 'Removed from Wishlist' : 'Saved to Wishlist');
                    }}
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      zIndex: 2,
                      background: 'rgba(20,2,16,0.6)',
                      border: '1px solid var(--line)',
                      borderRadius: '50%',
                      width: '34px',
                      height: '34px',
                      display: 'grid',
                      placeItems: 'center',
                      cursor: 'pointer',
                      color: wishlisted ? '#f87171' : 'var(--gold)'
                    }}
                    title={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
                  >
                    <Heart size={16} fill={wishlisted ? '#f87171' : 'none'} />
                  </button>

                  <div className="wr">
                    <div
                      className="im"
                      style={{ backgroundImage: p.image_url, backgroundColor: '#24061d', backgroundPosition: 'center' }}
                      role="img"
                      aria-label={p.name}
                    ></div>
                  </div>

                  <div className="in">
                    <small>{p.category?.name || 'Jewellery'}</small>
                    <h3>{p.name}</h3>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--gold)', margin: '4px 0 8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '2px', background: 'rgba(34,197,94,0.15)', padding: '2px 6px', borderRadius: '4px', color: '#4ade80', fontWeight: 600 }}>
                        <span>{p.rating || 4.9}</span>
                        <Star size={11} fill="#4ade80" />
                      </div>
                      <span style={{ opacity: 0.6 }}>({p.reviews_count || 90}+ ratings)</span>
                    </div>

                    <div className="row">
                      <div>
                        <span className="pr">{inr(price)}</span>
                        {originalPrice > price && (
                          <span style={{ fontSize: '12px', textDecoration: 'line-through', opacity: 0.5, marginLeft: '6px' }}>
                            {inr(originalPrice)}
                          </span>
                        )}
                      </div>
                      <button
                        className="add"
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(p);
                          showToast(`${p.name} added to your bag`);
                        }}
                      >
                        Add to bag
                      </button>
                    </div>

                    <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid rgba(212,175,55,0.1)', display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                      <Link
                        to={`/product/${p.id}`}
                        onClick={(e) => e.stopPropagation()}
                        style={{ color: 'var(--gold2)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        View Details →
                      </Link>
                      {discountPct > 0 && <span style={{ color: '#4ade80' }}>Save {discountPct}%</span>}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* Promotional Banner Section */}
        <section className="promo" id="promo">
          <div
            className="vis"
            style={{
              backgroundImage: promoBanner?.desktop_image
                ? (promoBanner.desktop_image.startsWith('/uploads/') || promoBanner.desktop_image.startsWith('http'))
                  ? `url(${promoBanner.desktop_image.startsWith('/') ? promoBanner.desktop_image : promoBanner.desktop_image})`
                  : `url(${promoBanner.desktop_image})`
                : 'var(--i-chest)',
              backgroundColor: '#24061d',
              backgroundPosition: 'center'
            }}
          ></div>
          <div className="tx rv">
            <div className="kick">{promoBanner?.kick || 'Celebrate Tradition'}</div>
            <h2>{promoBanner?.title || 'In Every Detail.'}</h2>
            <p>{promoBanner?.subtitle || 'Discover the perfect piece for your special moments.'}</p>
            <a className="gbtn" href={promoBanner?.button_link || '#shop'}>
              {promoBanner?.button_text || 'Explore More'} <span>→</span>
            </a>
          </div>
        </section>

        {/* About Section */}
        <section className="sec" id="about">
          <div className="two">
            <div className="frame rv" style={{ backgroundImage: 'var(--i-model)' }}></div>
            <div className="rv">
              <div className="kick">Our Story</div>
              <h2>Jewellery that carries a legacy.</h2>
              <p>
                The Ethnic Edit brings together temple-inspired designs, antique gold finishes and
                delicate pearl work, curated for weddings, festivals and every moment worth celebrating.
              </p>
              <p>
                Each piece is chosen for its craftsmanship and its story, so what you wear feels both
                timeless and personal.
              </p>
              <div className="pts">
                <span>Handcrafted detail</span>
                <span>Antique finish</span>
                <span>Gift-ready packaging</span>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="sec" id="contact" style={{ paddingTop: 0 }}>
          <div className="two">
            <div className="rv">
              <div className="kick">Contact</div>
              <h2>We'd love to hear from you.</h2>
              <p>
                Questions about a piece, a custom order or gifting? Write to us and we'll reply within
                a day.
              </p>
              <div className="cinfo">
                <a href="mailto:hello@theethnicedit.com">✉ hello@theethnicedit.com</a>
                <a href="tel:+919876543210">☎ +91 98765 43210</a>
                <span>◉ Mon–Sat, 10am–7pm IST</span>
              </div>
            </div>
            <form className="f rv" id="cf" onSubmit={handleContactSubmit}>
              <label>
                Name
                <input required name="n" autoComplete="name" />
              </label>
              <label>
                Email
                <input required type="email" name="e" autoComplete="email" />
              </label>
              <label>
                Message
                <textarea required name="m"></textarea>
              </label>
              <button className="gbtn" type="submit" style={{ justifySelf: 'start' }}>
                Send Message
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
                <b>THE ETHNIC EDIT</b>
              </span>
            </a>
            <p>Timeless jewellery for every celebration, crafted with elegance.</p>
          </div>
          <div>
            <h4>Explore</h4>
            <ul>
              <li><a href="#home">Home</a></li>
              <li><a href="#shop">Shop</a></li>
              <li><a href="#collections">Collections</a></li>
              <li><a href="#about">About</a></li>
              <li><a href="#contact">Contact</a></li>
              <li>
                <button
                  onClick={() => setTrackingOrderNumber('prompt')}
                  style={{ background: 'none', border: 0, color: 'var(--gold2)', cursor: 'pointer', padding: 0, font: 'inherit' }}
                >
                  Track Order
                </button>
              </li>
            </ul>
          </div>
          <div>
            <h4>Help &amp; Policies</h4>
            <ul>
              <li><a href="#contact">Shipping &amp; Delivery</a></li>
              <li><a href="#contact">Returns &amp; Exchanges</a></li>
              <li><a href="#contact">Gifting Services</a></li>
              <li><a href="#contact">Jewellery Care Guide</a></li>
              <li>
                
              </li>
            </ul>
          </div>
          <div>
            <h4>Newsletter</h4>
            <p style={{ marginBottom: '12px' }}>
              New collections and festive offers, straight to your inbox.
            </p>
            <form className="nl" id="nl" onSubmit={handleNewsletterSubmit}>
              <input type="email" required placeholder="Your email" aria-label="Email address" />
              <button type="submit">Subscribe</button>
            </form>
          </div>
        </div>

        {/* Footer Bottom with Powered by Aminoid */}
        <div className="fb">
          <span>© {new Date().getFullYear()} The Ethnic Edit. All rights reserved.</span>
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
          <span>Privacy · Terms</span>
        </div>
      </footer>

      {/* Search Overlay Modal */}
      <div
        className={`ov ${isSearchOpen ? 'on' : ''}`}
        id="oS"
        onClick={(e) => {
          if (e.target.id === 'oS') closeAll();
        }}
      >
        <div className="box">
          <button className="x" aria-label="Close" onClick={closeAll}>
            ×
          </button>
          <h3>Search the Edit</h3>
          <input
            id="sq"
            ref={searchInputRef}
            placeholder="Search necklaces, earrings, bangles, rings..."
            autoComplete="off"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div id="sr">
            {filteredProducts.length > 0 ? (
              filteredProducts.slice(0, 8).map((p) => {
                let img = p.images && p.images[0]?.image_url;
                if (!img && p.image_url) img = p.image_url;
                if (!img && p.i) img = `var(${p.i})`;
                const isCss = img && img.startsWith('var(');
                const isUp = img && (img.startsWith('/uploads/') || img.startsWith('http'));
                const bg = isCss ? img : isUp ? `url(${img})` : `url(${img})`;
                const price = parseFloat(p.selling_price || p.price || p.p || 0);

                return (
                  <button
                    key={p.id}
                    className="sr"
                    onClick={() => {
                      closeAll();
                      setSelectedProduct(p);
                    }}
                  >
                    <i style={{ backgroundImage: bg, backgroundColor: '#24061d', backgroundPosition: 'center' }}></i>
                    <div>
                      <b>{p.name}</b>
                      <span>{p.category?.name || p.c || 'Jewellery'} · {inr(price)}</span>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="empty">No matching jewellery pieces found.</div>
            )}
          </div>
        </div>
      </div>

      {/* Customer Account Overlay Modal */}
      <div
        className={`ov ${isAccountOpen ? 'on' : ''}`}
        id="oA"
        onClick={(e) => {
          if (e.target.id === 'oA') closeAll();
        }}
      >
        <div className="box" style={{ maxWidth: '440px' }}>
          <button className="x" aria-label="Close" onClick={closeAll}>
            ×
          </button>

          {isAuthenticated ? (
            <div>
              <h3 style={{ color: 'var(--gold2)', marginBottom: '8px' }}>
                Hello, {user.name}
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--cream)', opacity: 0.8, marginBottom: '20px' }}>
                {user.email}
              </p>

              <div style={{ background: 'rgba(255,240,208,0.05)', padding: '16px', borderRadius: '12px', border: '1px solid var(--line)', marginBottom: '20px', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div>Role: <b style={{ color: 'var(--gold2)' }}>{user.role}</b></div>
                {user.phone && <div>Phone: {user.phone}</div>}
                {user.address && <div>Address: {user.address}</div>}
              </div>

              <button
                onClick={() => {
                  logout();
                  showToast('You have been signed out.');
                  setIsAccountOpen(false);
                }}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '999px',
                  border: '1px solid var(--line)',
                  background: 'none',
                  color: '#f87171',
                  cursor: 'pointer'
                }}
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div>
              <h3 id="at" style={{ color: 'var(--gold2)', marginBottom: '4px' }}>
                {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--cream)', opacity: 0.75, marginBottom: '20px' }}>
                {authMode === 'login'
                  ? 'Sign in to access saved addresses and order history.'
                  : 'Join The Ethnic Edit for exclusive festive previews.'}
              </p>

              {authError && (
                <div style={{ background: 'rgba(239,68,68,0.2)', color: '#fca5a5', padding: '10px', borderRadius: '8px', fontSize: '13px', marginBottom: '14px' }}>
                  {authError}
                </div>
              )}

              <form className="f" id="af" style={{ border: 0, padding: 0, background: 'none' }} onSubmit={handleAuthSubmit}>
                {authMode === 'register' && (
                  <label>
                    Full Name
                    <input
                      required
                      name="name"
                      value={authForm.name}
                      onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                      placeholder="Nivetha"
                    />
                  </label>
                )}

                <label>
                  Email Address
                  <input
                    required
                    type="email"
                    name="email"
                    autoComplete="email"
                    value={authForm.email}
                    onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                    placeholder="hello@example.com"
                  />
                </label>

                <label>
                  Password
                  <div style={{ position: 'relative' }}>
                    <input
                      required
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      minLength={4}
                      autoComplete="current-password"
                      value={authForm.password}
                      onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                      placeholder="••••••••"
                      style={{ paddingRight: '40px', width: '100%', boxSizing: 'border-box' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'transparent',
                        border: 0,
                        color: 'var(--gold)',
                        cursor: 'pointer',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: 0.85
                      }}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </label>

                <button className="gbtn" style={{ justifySelf: 'start', marginTop: '6px' }}>
                  {authMode === 'login' ? 'Sign In' : 'Register Account'}
                </button>
              </form>

              <div style={{ marginTop: '18px', fontSize: '13px', textAlign: 'center', opacity: 0.85 }}>
                {authMode === 'login' ? (
                  <span>
                    New customer?{' '}
                    <button
                      type="button"
                      onClick={() => setAuthMode('register')}
                      style={{ background: 'none', border: 0, color: 'var(--gold2)', textDecoration: 'underline', cursor: 'pointer', font: 'inherit' }}
                    >
                      Create an account
                    </button>
                  </span>
                ) : (
                  <span>
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setAuthMode('login')}
                      style={{ background: 'none', border: 0, color: 'var(--gold2)', textDecoration: 'underline', cursor: 'pointer', font: 'inherit' }}
                    >
                      Sign in here
                    </button>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cart Drawer & Backdrop */}
      <div className={`bg ${isCartOpen ? 'on' : ''}`} id="bg" onClick={closeAll}></div>

      <aside className={`dr ${isCartOpen ? 'on' : ''}`} id="dr" aria-label="Shopping bag">
        <button className="x" aria-label="Close bag" onClick={closeAll}>
          ×
        </button>
        <h3>Your Bag</h3>
        <div className="bl" id="bl">
          {cartItems.length > 0 ? (
            cartItems.map((item) => {
              const img = item.image_url;
              const isCss = img && img.startsWith('var(');
              const isUp = img && (img.startsWith('/uploads/') || img.startsWith('http'));
              const bg = isCss ? img : isUp ? `url(${img})` : `url(${img})`;

              return (
                <div className="bi" key={item.id}>
                  <i style={{ backgroundImage: bg, backgroundColor: '#24061d', backgroundPosition: 'center' }}></i>
                  <div>
                    <b>{item.name}</b>
                    {item.variant && <small style={{ display: 'block', opacity: 0.7 }}>{item.variant.title}</small>}
                    <div className="q">
                      <button onClick={() => updateQuantity(item.id, -1)} aria-label="Less">
                        −
                      </button>
                      {item.quantity}
                      <button onClick={() => updateQuantity(item.id, 1)} aria-label="More">
                        +
                      </button>
                    </div>
                  </div>
                  <div>
                    <div className="pp">{inr(item.price * item.quantity)}</div>
                    <button className="rm" onClick={() => updateQuantity(item.id, -item.quantity)}>
                      Remove
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="empty">
              Your bag is empty.<br />
              Discover your favourite pieces.
            </div>
          )}
        </div>
        <div className="sub">
          <span>Subtotal</span>
          <span id="st">{inr(cartSubtotal)}</span>
        </div>
        <button
          className="gbtn"
          id="co"
          disabled={!cartItems.length}
          style={{ justifyContent: 'center' }}
          onClick={() => {
            setIsCartOpen(false);
            setIsCheckoutOpen(true);
          }}
        >
          Proceed to Checkout
        </button>
      </aside>

      {/* Product Details Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onShowToast={showToast}
        />
      )}

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderSuccess={(ord) => setConfirmedOrder(ord)}
      />

      {/* Order Confirmed Modal */}
      {confirmedOrder && (
        <OrderSuccessModal
          order={confirmedOrder}
          onClose={() => setConfirmedOrder(null)}
          onTrackOrder={(orderNum) => setTrackingOrderNumber(orderNum)}
        />
      )}

      {/* Order Tracking Modal */}
      {trackingOrderNumber && (
        <OrderTracking
          initialOrderNumber={trackingOrderNumber === 'prompt' ? '' : trackingOrderNumber}
          onClose={() => setTrackingOrderNumber(null)}
        />
      )}

      {/* Toast Notification */}
      <div className={`toast ${toastActive ? 'on' : ''}`} id="toast" role="status" aria-live="polite">
        {toastMessage}
      </div>
    </>
  );
}

