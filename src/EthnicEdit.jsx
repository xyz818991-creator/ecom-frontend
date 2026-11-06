import React, { useState, useEffect, useRef, useCallback } from 'react';
import './EthnicEdit.css';

const PRODUCTS = [
  { id: 'neck', n: 'Temple Lakshmi Necklace', c: 'Necklaces', p: 48500, i: '--i-neck' },
  { id: 'ear', n: 'Pearl Jhumka Earrings', c: 'Earrings', p: 18900, i: '--i-ear' },
  { id: 'bang', n: 'Antique Gold Bangles', c: 'Bangles', p: 32400, i: '--i-bang' },
  { id: 'ring', n: 'Gemstone Cocktail Ring', c: 'Rings', p: 12600, i: '--i-ring' },
  { id: 'belt', n: 'Temple Waist Belt', c: 'Waist Belts', p: 54900, i: '--i-belt' },
  { id: 'box', n: 'Heirloom Jewellery Chest', c: 'Gifting', p: 8900, i: '--i-chest' }
];

const inr = (n) => '₹' + n.toLocaleString('en-IN');

export default function EthnicEdit() {
  // Navigation & Scroll State
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  // Hero Carousel State
  const [currentSlide, setCurrentSlide] = useState(0);
  const heroTouchStartX = useRef(0);

  // Overlays / Modals State
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isBagOpen, setIsBagOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef(null);
  const cartBadgeRef = useRef(null);

  // User State
  const [user, setUser] = useState(() => {
    try {
      const v = localStorage.getItem('tee_user');
      return v ? JSON.parse(v) : null;
    } catch (e) {
      return null;
    }
  });

  // Bag State
  const [bag, setBag] = useState(() => {
    try {
      const v = localStorage.getItem('tee_bag');
      return v ? JSON.parse(v) : {};
    } catch (e) {
      return {};
    }
  });

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState('');
  const [toastActive, setToastActive] = useState(false);
  const toastTimerRef = useRef(null);

  const showToast = useCallback((msg) => {
    setToastMessage(msg);
    setToastActive(true);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => {
      setToastActive(false);
    }, 2600);
  }, []);

  // Save Cart to LocalStorage
  const saveBag = (newBag) => {
    setBag(newBag);
    try {
      localStorage.setItem('tee_bag', JSON.stringify(newBag));
    } catch (e) {}
  };

  const addToBag = (id) => {
    const newBag = { ...bag, [id]: (bag[id] || 0) + 1 };
    saveBag(newBag);
    if (cartBadgeRef.current) {
      cartBadgeRef.current.style.transform = 'scale(1.4)';
      setTimeout(() => {
        if (cartBadgeRef.current) cartBadgeRef.current.style.transform = '';
      }, 250);
    }
    const item = PRODUCTS.find((p) => p.id === id);
    if (item) {
      showToast(item.n + ' added to your bag');
    }
  };

  const updateBagQuantity = (id, delta) => {
    const newBag = { ...bag };
    if (delta === 0) {
      newBag[id] = 0;
    } else {
      newBag[id] = Math.max(0, (newBag[id] || 0) + delta);
    }
    saveBag(newBag);
  };

  // Close all open overlays
  const closeAll = useCallback(() => {
    setIsSearchOpen(false);
    setIsAccountOpen(false);
    setIsBagOpen(false);
  }, []);

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
  }, []);

  // Hero Carousel Navigation
  const goToSlide = useCallback((index) => {
    setCurrentSlide((index + 3) % 3);
  }, []);

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

  // Focus and Highlight a Product
  const focusProduct = useCallback((id) => {
    const el = document.querySelector(`.pc[data-id="${id}"]`);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.classList.remove('hl');
    void el.offsetWidth;
    el.classList.add('hl');
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
  }, []);

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
    showToast('Thank you! Your message has been sent.');
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    e.target.reset();
    showToast('Subscribed. Welcome to The Ethnic Edit.');
  };

  const handleAccountSubmit = (e) => {
    e.preventDefault();
    const emailVal = e.target.e.value;
    const username = emailVal.split('@')[0];
    setUser(username);
    try {
      localStorage.setItem('tee_user', JSON.stringify(username));
    } catch (err) {}
    closeAll();
    showToast(`Signed in as ${username} (demo)`);
  };

  // Search filter
  const filteredProducts = PRODUCTS.filter((p) => {
    const q = searchQuery.trim().toLowerCase();
    return !q || (p.n + ' ' + p.c).toLowerCase().includes(q);
  });

  // Cart Calculations
  const activeCartKeys = Object.keys(bag).filter((k) => bag[k] > 0 && PRODUCTS.some((p) => p.id === k));
  const cartItemCount = activeCartKeys.reduce((sum, k) => sum + bag[k], 0);
  const cartSubtotal = activeCartKeys.reduce((sum, k) => {
    const p = PRODUCTS.find((x) => x.id === k);
    return sum + (p ? p.p * bag[k] : 0);
  }, 0);

  // Collections Rail items (doubled for infinite scroll)
  const collectionList = PRODUCTS.slice(0, 5);
  const railItems = [...collectionList, ...collectionList];

  return (
    <>
      <canvas id="fx" ref={canvasRef} aria-hidden="true"></canvas>

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
          <a
            href="#home"
            className={activeSection === 'home' ? 'on' : ''}
            onClick={() => setIsMenuOpen(false)}
          >
            Home
          </a>
          <a
            href="#shop"
            className={activeSection === 'shop' ? 'on' : ''}
            onClick={() => setIsMenuOpen(false)}
          >
            Shop
          </a>
          <a
            href="#collections"
            className={activeSection === 'collections' ? 'on' : ''}
            onClick={() => setIsMenuOpen(false)}
          >
            Collections
          </a>
          <a
            href="#about"
            className={activeSection === 'about' ? 'on' : ''}
            onClick={() => setIsMenuOpen(false)}
          >
            About
          </a>
          <a
            href="#contact"
            className={activeSection === 'contact' ? 'on' : ''}
            onClick={() => setIsMenuOpen(false)}
          >
            Contact
          </a>
          <a
            href="#"
            className="mo"
            id="mA"
            onClick={(e) => {
              e.preventDefault();
              setIsMenuOpen(false);
              closeAll();
              setIsAccountOpen(true);
            }}
          >
            Account
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
          <button
            id="bA"
            aria-label="Account"
            onClick={() => {
              closeAll();
              setIsAccountOpen(true);
            }}
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
              setIsBagOpen(true);
            }}
          >
            <svg className="i" viewBox="0 0 24 24">
              <path d="M6 7h12l1 13H5z" />
              <path d="M9 7a3 3 0 0 1 6 0" />
            </svg>
            <span id="cnt" ref={cartBadgeRef}>
              {cartItemCount}
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
        {/* Hero Section */}
        <section
          className="hero"
          id="home"
          aria-roledescription="carousel"
          aria-label="Featured"
          onTouchStart={handleHeroTouchStart}
          onTouchEnd={handleHeroTouchEnd}
        >
          {/* Slide 1 */}
          <div className={`slide ${currentSlide === 0 ? 'on' : ''}`}>
            <div
              className="vis"
              style={{ backgroundImage: 'var(--i-model)', backgroundPosition: 'left center' }}
            ></div>
            <div className="tx">
              <div className="kick" style={{ '--k': 0 }}>
                The Ethnic Edit
              </div>
              <h1 style={{ '--k': 1 }}>
                Tradition,
                <br />
                <em>Beautifully</em> Curated.
              </h1>
              <p style={{ '--k': 2 }}>Timeless jewellery for every celebration, crafted with elegance.</p>
              <a className="gbtn" style={{ '--k': 3 }} href="#shop">
                Shop the Collection <span>→</span>
              </a>
            </div>
          </div>

          {/* Slide 2 */}
          <div className={`slide ${currentSlide === 1 ? 'on' : ''}`}>
            <div className="vis" style={{ backgroundImage: 'var(--i-chest)' }}></div>
            <div className="tx">
              <div className="kick" style={{ '--k': 0 }}>
                Celebrate Tradition
              </div>
              <h1 style={{ '--k': 1 }}>
                <em>In Every Detail.</em>
              </h1>
              <p style={{ '--k': 2 }}>Discover the perfect piece for your special moments.</p>
              <a className="gbtn" style={{ '--k': 3 }} href="#shop">
                Explore More <span>→</span>
              </a>
            </div>
          </div>

          {/* Slide 3 */}
          <div className={`slide ${currentSlide === 2 ? 'on' : ''}`}>
            <div className="arches">
              <i className="arch" style={{ '--k': 0, backgroundImage: 'var(--i-neck)' }}></i>
              <i className="arch" style={{ '--k': 1, backgroundImage: 'var(--i-ear)' }}></i>
              <i className="arch" style={{ '--k': 2, backgroundImage: 'var(--i-bang)' }}></i>
              <i className="arch" style={{ '--k': 3, backgroundImage: 'var(--i-ring)' }}></i>
              <i className="arch" style={{ '--k': 4, backgroundImage: 'var(--i-belt)' }}></i>
            </div>
            <div className="tx">
              <div className="kick" style={{ '--k': 0 }}>
                Five Collections
              </div>
              <h1 style={{ '--k': 1 }}>
                Crafted with <em>elegance.</em>
              </h1>
              <p style={{ '--k': 2 }}>
                From necklaces to waist belts, find the piece that tells your story.
              </p>
              <a className="gbtn" style={{ '--k': 3 }} href="#collections">
                Browse Collections <span>→</span>
              </a>
            </div>
          </div>

          <div className="ctl">
            <button
              className="ar"
              id="pv"
              aria-label="Previous slide"
              onClick={() => goToSlide(currentSlide - 1)}
            >
              <svg className="i" viewBox="0 0 24 24">
                <path d="m15 5-7 7 7 7" />
              </svg>
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
            <button
              className="ar"
              id="nx"
              aria-label="Next slide"
              onClick={() => goToSlide(currentSlide + 1)}
            >
              <svg className="i" viewBox="0 0 24 24">
                <path d="m9 5 7 7-7 7" />
              </svg>
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
            <span>
              Premium Quality
              <br />
              Assured
            </span>
          </div>
          <div>
            <svg className="i" viewBox="0 0 24 24">
              <path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
            <span>
              Secure
              <br />
              Payments
            </span>
          </div>
          <div>
            <svg className="i" viewBox="0 0 24 24">
              <path d="M2 6h11v10H2zM13 9h5l3 3v4h-8" />
              <circle cx="7" cy="18" r="2" />
              <circle cx="17" cy="18" r="2" />
            </svg>
            <span>
              Fast &amp; Reliable
              <br />
              Delivery
            </span>
          </div>
          <div>
            <svg className="i" viewBox="0 0 24 24">
              <rect x="3" y="8" width="18" height="4" />
              <path d="M5 12v9h14v-9M12 8v13M12 8c-3 0-5-4-2-4 2 0 2 4 2 4zm0 0c3 0 5-4 2-4-2 0-2 4-2 4z" />
            </svg>
            <span>
              Elegant Gifting
              <br />
              Options
            </span>
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
            {railItems.map((p, idx) => (
              <a
                className="cc"
                href="#shop"
                key={idx}
                data-go={p.id}
                onClick={(e) => {
                  if (railState.current.moved > 6) {
                    e.preventDefault();
                    e.stopPropagation();
                    railState.current.moved = 0;
                    return;
                  }
                  e.preventDefault();
                  focusProduct(p.id);
                }}
              >
                <div className="ph" style={{ backgroundImage: `var(${p.i})` }}></div>
                <span>{p.c} →</span>
              </a>
            ))}
          </div>
          <div className="railbar">
            <button
              className="ar"
              id="rp"
              aria-label="Scroll left"
              style={{ display: 'grid' }}
              onClick={() => scrollRail(-300)}
            >
              <svg className="i" viewBox="0 0 24 24">
                <path d="m15 5-7 7 7 7" />
              </svg>
            </button>
            <button
              className="ar"
              id="rn"
              aria-label="Scroll right"
              style={{ display: 'grid' }}
              onClick={() => scrollRail(300)}
            >
              <svg className="i" viewBox="0 0 24 24">
                <path d="m9 5 7 7-7 7" />
              </svg>
            </button>
          </div>
        </section>

        {/* Shop Grid Section */}
        <section className="sec" id="shop" style={{ paddingTop: 0 }}>
          <div className="hd rv">
            <h2>Shop the Edit</h2>
            <p>Heirloom-inspired pieces, ready to gift or to keep.</p>
          </div>
          <div className="grid" id="grid">
            {PRODUCTS.map((p) => (
              <article className="pc rv" data-id={p.id} key={p.id}>
                <div className="wr">
                  <div
                    className="im"
                    style={{ backgroundImage: `var(${p.i})` }}
                    role="img"
                    aria-label={p.n}
                  ></div>
                </div>
                <div className="in">
                  <small>{p.c}</small>
                  <h3>{p.n}</h3>
                  <div className="row">
                    <span className="pr">{inr(p.p)}</span>
                    <button className="add" data-add={p.id} onClick={() => addToBag(p.id)}>
                      Add to bag
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Promo Banner Section */}
        <section className="promo" id="promo">
          <div className="vis" style={{ backgroundImage: 'var(--i-chest)' }}></div>
          <div className="tx rv">
            <div className="kick">Celebrate Tradition</div>
            <h2>In Every Detail.</h2>
            <p>Discover the perfect piece for your special moments.</p>
            <a className="gbtn" href="#shop">
              Explore More <span>→</span>
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
              <li>
                <a href="#home">Home</a>
              </li>
              <li>
                <a href="#shop">Shop</a>
              </li>
              <li>
                <a href="#collections">Collections</a>
              </li>
              <li>
                <a href="#about">About</a>
              </li>
              <li>
                <a href="#contact">Contact</a>
              </li>
            </ul>
          </div>
          <div>
            <h4>Help</h4>
            <ul>
              <li>
                <a href="#contact">Shipping &amp; Delivery</a>
              </li>
              <li>
                <a href="#contact">Returns</a>
              </li>
              <li>
                <a href="#contact">Gifting</a>
              </li>
              <li>
                <a href="#contact">Care Guide</a>
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
        <div className="fb">
          <span>© {new Date().getFullYear()} The Ethnic Edit. All rights reserved.</span>
          <span>
            Powered by{' '}
            <a
              href="https://www.aminoid.in/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--gold2)', textDecoration: 'underline' }}
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
          <h3>Search</h3>
          <input
            id="sq"
            ref={searchInputRef}
            placeholder="Necklaces, earrings, bangles…"
            autoComplete="off"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div id="sr">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((p) => (
                <button
                  key={p.id}
                  className="sr"
                  onClick={() => {
                    closeAll();
                    setTimeout(() => focusProduct(p.id), 120);
                  }}
                >
                  <i style={{ backgroundImage: `var(${p.i})` }}></i>
                  <div>
                    <b>{p.n}</b>
                    <span>
                      {p.c} · {inr(p.p)}
                    </span>
                  </div>
                </button>
              ))
            ) : (
              <div className="empty">No pieces found.</div>
            )}
          </div>
        </div>
      </div>

      {/* Account Overlay Modal */}
      <div
        className={`ov ${isAccountOpen ? 'on' : ''}`}
        id="oA"
        onClick={(e) => {
          if (e.target.id === 'oA') closeAll();
        }}
      >
        <div className="box">
          <button className="x" aria-label="Close" onClick={closeAll}>
            ×
          </button>
          <h3 id="at">{user ? 'Hello, ' + user : 'Welcome back'}</h3>
          <form
            className="f"
            id="af"
            style={{ border: 0, padding: 0, background: 'none' }}
            onSubmit={handleAccountSubmit}
          >
            <label>
              Email
              <input required type="email" name="e" autoComplete="email" />
            </label>
            <label>
              Password
              <input required type="password" name="p" minLength={4} autoComplete="current-password" />
            </label>
            <button className="gbtn" style={{ justifySelf: 'start' }}>
              Sign in
            </button>
          </form>
        </div>
      </div>

      {/* Cart Drawer & Backdrop */}
      <div className={`bg ${isBagOpen ? 'on' : ''}`} id="bg" onClick={closeAll}></div>

      <aside className={`dr ${isBagOpen ? 'on' : ''}`} id="dr" aria-label="Shopping bag">
        <button className="x" aria-label="Close bag" onClick={closeAll}>
          ×
        </button>
        <h3>Your Bag</h3>
        <div className="bl" id="bl">
          {activeCartKeys.length > 0 ? (
            activeCartKeys.map((k) => {
              const p = PRODUCTS.find((x) => x.id === k);
              if (!p) return null;
              return (
                <div className="bi" key={k}>
                  <i style={{ backgroundImage: `var(${p.i})` }}></i>
                  <div>
                    <b>{p.n}</b>
                    <div className="q">
                      <button
                        onClick={() => updateBagQuantity(k, -1)}
                        aria-label="Less"
                      >
                        −
                      </button>
                      {bag[k]}
                      <button
                        onClick={() => updateBagQuantity(k, 1)}
                        aria-label="More"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div>
                    <div className="pp">{inr(p.p * bag[k])}</div>
                    <button className="rm" onClick={() => updateBagQuantity(k, 0)}>
                      Remove
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="empty">
              Your bag is empty.
              <br />
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
          disabled={!activeCartKeys.length}
          style={{ justifyContent: 'center' }}
          onClick={() => showToast('Demo checkout: connect your payment gateway to go live.')}
        >
          Checkout
        </button>
      </aside>

      {/* Toast Notification */}
      <div className={`toast ${toastActive ? 'on' : ''}`} id="toast" role="status" aria-live="polite">
        {toastMessage}
      </div>
    </>
  );
}

