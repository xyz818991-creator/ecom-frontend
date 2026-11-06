import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { productService, categoryService, bannerService } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import ProductDetailModal from '../components/ProductDetailModal';
import {
  Search,
  ShoppingBag,
  Heart,
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  LogOut,
  Tag,
  CheckCircle2,
  Award,
  Gem,
  Flame,
  Percent,
  TrendingUp,
  Gift,
  Share2,
  Eye,
  SlidersHorizontal,
  Mail,
  ChevronDown,
  X
} from 'lucide-react';
import '../EthnicEdit.css';

const inr = (n) => '₹' + Number(n).toLocaleString('en-IN');

// 14 Imitation Jewellery Categories
export const IMITATION_CATEGORIES = [
  { id: 'earrings', name: 'Earrings', slug: 'earrings', img: 'var(--i-ear)', tag: 'Popular' },
  { id: 'necklaces', name: 'Necklaces', slug: 'necklaces', img: 'var(--i-neck)', tag: 'Bridal' },
  { id: 'necklace-sets', name: 'Necklace Sets', slug: 'necklace-sets', img: 'var(--i-model)', tag: 'Trending' },
  { id: 'bangles', name: 'Bangles', slug: 'bangles', img: 'var(--i-bang)', tag: 'Classic' },
  { id: 'bracelets', name: 'Bracelets', slug: 'bracelets', img: 'var(--i-bang)', tag: 'Modern' },
  { id: 'rings', name: 'Rings', slug: 'rings', img: 'var(--i-ring)', tag: 'Top-Rated' },
  { id: 'anklets', name: 'Anklets', slug: 'anklets', img: 'var(--i-chest)', tag: 'Traditional' },
  { id: 'mangalsutra', name: 'Mangalsutra', slug: 'mangalsutra', img: 'var(--i-neck)', tag: 'Sacred' },
  { id: 'bridal-jewellery', name: 'Bridal Jewellery', slug: 'bridal-jewellery', img: 'var(--i-belt)', tag: 'Royal' },
  { id: 'temple-jewellery', name: 'Temple Jewellery', slug: 'temple-jewellery', img: 'var(--i-neck)', tag: 'Heritage' },
  { id: 'antique-jewellery', name: 'Antique Jewellery', slug: 'antique-jewellery', img: 'var(--i-ear)', tag: '24k Matte' },
  { id: 'american-diamond-jewellery', name: 'American Diamond', slug: 'american-diamond-jewellery', img: 'var(--i-ring)', tag: 'CZ Glitz' },
  { id: 'daily-wear-jewellery', name: 'Daily Wear', slug: 'daily-wear-jewellery', img: 'var(--i-ear)', tag: 'Lightweight' },
  { id: 'festive-collections', name: 'Festive Collections', slug: 'festive-collections', img: 'var(--i-chest)', tag: 'Festivals' }
];

// Fallback core catalog ensuring all 12 rails always populate with realistic data
export const FALLBACK_PRODUCTS = [
  {
    id: 'neck',
    name: 'Temple Lakshmi Royal Choker & Haram',
    category: { name: 'Necklaces', slug: 'necklaces' },
    selling_price: 48500,
    original_price: 54900,
    image_url: 'var(--i-neck)',
    rating: 4.9,
    reviews_count: 142,
    badge: '🔥 #1 Best Seller',
    material: '24k Antique Matte Gold Plating',
    colour: 'Ruby Red & Gold',
    occasion: 'Bridal & Muhurtham',
    is_deal: true,
    is_bestseller: true,
    is_trending: true,
    is_new: false,
    is_bridal: true,
    is_budget: false,
    is_premium: true,
    description: 'South Indian bridal grand choker featuring Goddess Lakshmi flanked by dancing peacocks and kemp rubies.'
  },
  {
    id: 'ear',
    name: 'South Indian Antique Pearl Jhumka Earrings',
    category: { name: 'Earrings', slug: 'earrings' },
    selling_price: 18900,
    original_price: 21500,
    image_url: 'var(--i-ear)',
    rating: 4.8,
    reviews_count: 98,
    badge: '⚡ Trending Deal',
    material: 'Hypoallergenic Brass with Dual Gold Wash',
    colour: 'Antique Gold & Pearl White',
    occasion: 'Festive & Sangeet',
    is_deal: true,
    is_bestseller: true,
    is_trending: true,
    is_new: false,
    is_bridal: false,
    is_budget: false,
    is_premium: false,
    description: 'Classic bell-shaped tiered jhumkas suspended from an intricate floral ear stud with micro seed pearls.'
  },
  {
    id: 'bang',
    name: 'Royal Heritage Antique Gold Filigree Bangles',
    category: { name: 'Bangles', slug: 'bangles' },
    selling_price: 32400,
    original_price: 36000,
    image_url: 'var(--i-bang)',
    rating: 4.9,
    reviews_count: 76,
    badge: '👑 Royal Heritage',
    material: 'Cast Artisan Brass with 24k Gold Layering',
    colour: 'Antique Gold',
    occasion: 'Bridal & Festive',
    is_deal: false,
    is_bestseller: true,
    is_trending: true,
    is_new: true,
    is_bridal: true,
    is_budget: false,
    is_premium: true,
    description: 'Pair of solid kada bangles showcasing openwork filigree craft inspired by temple architecture.'
  },
  {
    id: 'ring',
    name: 'Kemp Gemstone Floral Cocktail Ring',
    category: { name: 'Rings', slug: 'rings' },
    selling_price: 12600,
    original_price: 14500,
    image_url: 'var(--i-ring)',
    rating: 4.7,
    reviews_count: 54,
    badge: '✨ Trending Ring',
    material: 'Copper-Brass Alloy with Micro Gold Finish',
    colour: 'Ruby Red & Polki White',
    occasion: 'Party & Cocktail',
    is_deal: true,
    is_bestseller: false,
    is_trending: true,
    is_new: true,
    is_bridal: false,
    is_budget: true,
    is_premium: false,
    description: 'Centred with an oval cabochon synthetic ruby surrounded by floral petals encrusted with un-cut polki crystals.'
  },
  {
    id: 'belt',
    name: 'Temple Goddess Lakshmi Bridal Vaddanam Waist Belt',
    category: { name: 'Bridal Jewellery', slug: 'bridal-jewellery' },
    selling_price: 54900,
    original_price: 62000,
    image_url: 'var(--i-belt)',
    rating: 5.0,
    reviews_count: 45,
    badge: '💎 Limited Bridal',
    material: 'Solid Core Brass with 24k Matte Gold Plate',
    colour: 'Antique Matte Gold',
    occasion: 'Bridal Muhurtham',
    is_deal: false,
    is_bestseller: true,
    is_trending: false,
    is_new: false,
    is_bridal: true,
    is_budget: false,
    is_premium: true,
    description: 'An heirloom vaddanam waist belt crafted for the contemporary bride with miniature carved deities.'
  },
  {
    id: 'box',
    name: 'Maharani Brass Heirloom Jewellery Chest',
    category: { name: 'Festive Collections', slug: 'festive-collections' },
    selling_price: 8900,
    original_price: 10500,
    image_url: 'var(--i-chest)',
    rating: 4.9,
    reviews_count: 83,
    badge: '🎁 Best Luxury Gift',
    material: 'Sheesham Rosewood & Brass Fittings',
    colour: 'Rich Walnut & Crimson Velvet',
    occasion: 'Gifting & Keepsake',
    is_deal: true,
    is_bestseller: false,
    is_trending: true,
    is_new: true,
    is_bridal: false,
    is_budget: true,
    is_premium: false,
    description: 'Designed exclusively for keeping your precious temple jewellery tarnishing-free.'
  },
  {
    id: 'set-bridal',
    name: 'Royal Heritage Grand Bridal Guttapusalu Set',
    category: { name: 'Necklace Sets', slug: 'necklace-sets' },
    selling_price: 68500,
    original_price: 78000,
    image_url: 'var(--i-model)',
    rating: 5.0,
    reviews_count: 38,
    badge: '👑 Royal Set',
    material: '24K Antique Matte Gold Micro-Plating',
    colour: 'Emerald Green & Kemp Ruby',
    occasion: 'Bridal Wedding',
    is_deal: false,
    is_bestseller: true,
    is_trending: true,
    is_new: true,
    is_bridal: true,
    is_budget: false,
    is_premium: true,
    description: 'A complete bridal trousseau package comprising a grand guttapusalu choker, peacock haram, and matching jhumkas.'
  },
  {
    id: 'anklet-kemp',
    name: 'Traditional Kemp Ghungroo Payal Anklets',
    category: { name: 'Anklets', slug: 'anklets' },
    selling_price: 13200,
    original_price: 15500,
    image_url: 'var(--i-bang)',
    rating: 4.8,
    reviews_count: 42,
    badge: '✨ Traditional Melody',
    material: 'Jeweller Brass Alloy with Anti-Tarnish Finish',
    colour: 'Antique Gold',
    occasion: 'Festive & Classical Dance',
    is_deal: true,
    is_bestseller: false,
    is_trending: true,
    is_new: true,
    is_bridal: false,
    is_budget: true,
    is_premium: false,
    description: 'Exquisite antique gold anklets handcrafted with soothing musical ghungroo bells and ruby kemp stones.'
  },
  {
    id: 'mangalsutra-lakshmi',
    name: 'Auspicious Lakshmi Gold Plated Mangalsutra',
    category: { name: 'Mangalsutra', slug: 'mangalsutra' },
    selling_price: 15400,
    original_price: 18000,
    image_url: 'var(--i-neck)',
    rating: 4.9,
    reviews_count: 91,
    badge: '🕉️ Sacred Heritage',
    material: '24k Micron Gold Plated Silver & Brass',
    colour: 'Black & Gold',
    occasion: 'Daily & Auspicious',
    is_deal: false,
    is_bestseller: true,
    is_trending: true,
    is_new: false,
    is_bridal: true,
    is_budget: false,
    is_premium: false,
    description: 'Hand-knotted black beads on gold wire featuring a sacred Goddess Lakshmi motif pendant.'
  },
  {
    id: 'cz-cocktail-ring',
    name: 'American Diamond Solitaire Halo Cocktail Ring',
    category: { name: 'American Diamond', slug: 'american-diamond-jewellery' },
    selling_price: 7800,
    original_price: 9500,
    image_url: 'var(--i-ring)',
    rating: 4.7,
    reviews_count: 67,
    badge: '💎 High Sparkle',
    material: 'Rhodium & Rose Gold Plated Jeweller Brass',
    colour: 'Diamond White & Rose Gold',
    occasion: 'Reception & Evening Party',
    is_deal: true,
    is_bestseller: false,
    is_trending: true,
    is_new: true,
    is_bridal: false,
    is_budget: true,
    is_premium: false,
    description: 'Premium American Diamond round brilliant solitaire surrounded by a double cushion halo of micro pavé crystals.'
  },
  {
    id: 'daily-floral-studs',
    name: 'Dainty Daily Wear Floral Stud Earrings',
    category: { name: 'Daily Wear', slug: 'daily-wear-jewellery' },
    selling_price: 5200,
    original_price: 6500,
    image_url: 'var(--i-ear)',
    rating: 4.8,
    reviews_count: 110,
    badge: '🌸 Daily Essential',
    material: 'Hypoallergenic Brass with Nickel-Free Plating',
    colour: 'Ruby & Antique Gold',
    occasion: 'Daily Wear & Office',
    is_deal: true,
    is_bestseller: true,
    is_trending: false,
    is_new: false,
    is_bridal: false,
    is_budget: true,
    is_premium: false,
    description: 'Minimalist floral studs crafted for daily comfort. Skin-friendly hypoallergenic plating.'
  },
  {
    id: 'navratna-bracelet',
    name: 'Navratna Royal Openable Kada Bracelet',
    category: { name: 'Bracelets', slug: 'bracelets' },
    selling_price: 20500,
    original_price: 24000,
    image_url: 'var(--i-bang)',
    rating: 4.9,
    reviews_count: 53,
    badge: '🌟 Royal Nine Gems',
    material: 'Artisan Brass with Antique Gold Patina',
    colour: 'Multi-Colour Gemstones & Gold',
    occasion: 'Festive & Auspicious',
    is_deal: false,
    is_bestseller: false,
    is_trending: true,
    is_new: true,
    is_bridal: false,
    is_budget: false,
    is_premium: true,
    description: 'Traditional Navratna kada bracelet featuring authentic planetary gemstone hues set on a floral gold cuff.'
  }
];

export default function HomePage() {
  const { cartCount, wishlistCount, addToCart, toggleWishlist, isInWishlist, recentlyViewed } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const { storeName } = useStore();
  const navigate = useNavigate();

  const [products, setProducts] = useState(FALLBACK_PRODUCTS);
  const [categories, setCategories] = useState(IMITATION_CATEGORIES);
  const [banners, setBanners] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [heroSlide, setHeroSlide] = useState(0);
  const [dealTimeLeft, setDealTimeLeft] = useState('08h : 42m : 19s');

  // Live search states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [searchHistory, setSearchHistory] = useState(() => {
    try {
      const s = localStorage.getItem('tee_search_history');
      return s ? JSON.parse(s) : ['Temple Choker', 'Kemp Jhumkas', 'Kada Bangles', 'Vaddanam'];
    } catch {
      return ['Temple Choker', 'Kemp Jhumkas'];
    }
  });

  const [toastMessage, setToastMessage] = useState('');
  const [newsletterEmail, setNewsletterEmail] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2600);
  };

  // Sync products & categories dynamically from database
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes, banRes] = await Promise.allSettled([
          productService.getProducts({ limit: 100 }),
          categoryService.getCategories(),
          bannerService.getBanners({ type: 'hero' })
        ]);

        if (prodRes.status === 'fulfilled' && prodRes.value?.success && prodRes.value.products?.length > 0) {
          const dbProducts = prodRes.value.products.map((p) => ({
            ...p,
            image_url: p.images?.[0]?.image_url || p.image_url || 'var(--i-neck)',
            rating: p.rating || 4.8,
            reviews_count: p.reviews_count || 65,
            is_deal: p.selling_price < p.original_price,
            is_bestseller: p.is_featured || p.reviews_count > 60,
            is_trending: true,
            is_new: true,
            is_bridal: (p.occasion || '').toLowerCase().includes('bridal'),
            is_budget: p.selling_price <= 15000,
            is_premium: p.selling_price > 30000
          }));

          setProducts(dbProducts);
        }

        if (catRes.status === 'fulfilled' && catRes.value?.success && catRes.value.categories?.length > 0) {
          const dbCategories = catRes.value.categories.map((c) => ({
            id: c.slug || String(c.id),
            name: c.name,
            slug: c.slug,
            img: c.image_url || 'var(--i-neck)',
            tag: 'Shop'
          }));
          const existingSlugs = new Set(IMITATION_CATEGORIES.map((ic) => ic.slug));
          const extraCats = dbCategories.filter((dc) => !existingSlugs.has(dc.slug));
          setCategories([...IMITATION_CATEGORIES, ...extraCats]);
        }

        if (banRes.status === 'fulfilled' && banRes.value?.success && banRes.value.banners?.length > 0) {
          setBanners(banRes.value.banners);
        }
      } catch (err) {
        console.warn('Dynamic database sync notice:', err.message);
      }
    };
    fetchData();
  }, []);

  // Hero carousel auto slider
  useEffect(() => {
    const timer = setInterval(() => {
      setHeroSlide((prev) => (prev + 1) % 3);
    }, 5500);
    return () => clearInterval(timer);
  }, []);

  // Today's Deals countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const hrs = 23 - now.getHours();
      const mins = 59 - now.getMinutes();
      const secs = 59 - now.getSeconds();
      setDealTimeLeft(
        `${String(hrs).padStart(2, '0')}h : ${String(mins).padStart(2, '0')}m : ${String(secs).padStart(2, '0')}s`
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Live search suggestions computation
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchSuggestions([]);
      return;
    }
    const q = searchQuery.toLowerCase();
    const matches = products
      .filter((p) => p.name.toLowerCase().includes(q) || (p.category?.name || '').toLowerCase().includes(q) || (p.material || '').toLowerCase().includes(q))
      .slice(0, 5);
    setSearchSuggestions(matches);
  }, [searchQuery, products]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const term = searchQuery.trim();
      setSearchHistory((prev) => [term, ...prev.filter((t) => t !== term)].slice(0, 6));
      localStorage.setItem('tee_search_history', JSON.stringify([term, ...searchHistory.filter((t) => t !== term)].slice(0, 6)));
      setSearchFocused(false);
      navigate(`/shop?search=${encodeURIComponent(term)}`);
    }
  };

  // CRITICAL NAVIGATION RULE:
  // "Unauthenticated customers clicking products or protected shopping actions must be redirected to login"
  const handleProductAction = (product, action = 'view') => {
    if (!isAuthenticated) {
      showToast('Please sign in to view product details and start shopping.');
      setTimeout(() => navigate('/login'), 600);
      return;
    }

    if (action === 'wishlist') {
      toggleWishlist(product);
      showToast('Saved to Wishlist!');
      navigate('/wishlist');
    } else if (action === 'cart') {
      addToCart(product, 1);
      showToast('Added to Shopping Bag!');
      navigate('/cart');
    } else {
      navigate(`/product/${product.id}`);
    }
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      showToast(`Thank you for subscribing to ${storeName} Royal Circle!`);
      setNewsletterEmail('');
    }
  };

  // Image background helper preserving base64 theme images
  const getImageBg = (img) => {
    if (!img) return 'var(--i-neck)';
    if (img.startsWith('var(')) return img;
    if (img.startsWith('/uploads/') || img.startsWith('http')) {
      return `url(${img})`;
    }
    return `url(${img})`;
  };

  // Multiple Product Rails Definitions
  const bestSellers = products.filter((p) => p.is_bestseller);
  const trendingJewellery = products.filter((p) => p.is_trending);
  const newArrivals = products.filter((p) => p.is_new);
  const todaysDeals = products.filter((p) => p.is_deal);
  const exclusiveCollection = products.filter((p) => p.is_premium);
  const bridalCollection = products.filter((p) => p.is_bridal);
  const festiveSpecial = products.filter((p) => (p.occasion || '').toLowerCase().includes('festive') || p.category?.slug === 'festive-collections');
  const budgetFriendly = products.filter((p) => p.selling_price <= 15000);
  const premiumJewellery = products.filter((p) => p.selling_price >= 25000);
  const topRated = products.filter((p) => (p.rating || 4.5) >= 4.8);
  const recommendedForYou = [...products].sort(() => 0.5 - Math.random()).slice(0, 8);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)', color: 'var(--cream)', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="tst on" style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999 }}>
          {toastMessage}
        </div>
      )}

      {/* 1. TOP ANNOUNCEMENT RIBBON */}
      <div style={{ background: 'linear-gradient(90deg, #320726, #4a0d39, #320726)', color: 'var(--gold2)', padding: '6px 16px', fontSize: '11px', textAlign: 'center', letterSpacing: '0.08em', textTransform: 'uppercase', borderBottom: '1px solid rgba(212,175,55,0.2)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
        <span>✨ Festive & Bridal Imitation Jewellery · 24k Matte Gold Finish · Free Insured Pan-India Shipping</span>
        <span style={{ opacity: 0.5 }}>|</span>
        <span>Use Coupon: <b style={{ color: '#fff', letterSpacing: '0.1em' }}>WELCOME10</b> for 10% Off</span>
        <span style={{ opacity: 0.5 }}>|</span>
        <a href="#about" style={{ color: 'var(--gold)', textDecoration: 'underline' }}>Brand Heritage</a>
      </div>

      {/* 2. STICKY HEADER & SEARCH BAR */}
      <header className="nav sc" style={{ position: 'sticky', top: 0, zIndex: 100, padding: '12px 24px', background: 'rgba(20,2,16,0.96)', borderBottom: '1px solid var(--line)', backdropFilter: 'blur(10px)' }}>
        <div style={{ maxWidth: '1440px', width: '100%', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px' }}>
          {/* Logo */}
          <Link className="brand" to="/" style={{ margin: 0, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="logo" style={{ width: '38px', height: '38px' }}></span>
            <span>
              <b style={{ fontSize: '20px', letterSpacing: '0.08em', color: 'var(--gold2)', fontFamily: 'var(--font-serif)' }}>{storeName}</b>
              <small style={{ fontSize: '10px', color: 'var(--gold)', letterSpacing: '0.18em', textTransform: 'uppercase' }}>Imitation Jewellery Emporium</small>
            </span>
          </Link>

          {/* Flipkart-Style Search Bar with Live Suggestions Dropdown */}
          <div style={{ flex: '1 1 440px', maxWidth: '620px', position: 'relative' }}>
            <form onSubmit={handleSearchSubmit} style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Search for Temple Necklaces, Kemp Jhumkas, Bangles, Vaddanam, American Diamond..."
                value={searchQuery}
                onFocus={() => setSearchFocused(true)}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '11px 44px 11px 18px',
                  borderRadius: '12px',
                  background: 'rgba(255,240,208,0.08)',
                  border: '1px solid var(--line)',
                  color: '#fff',
                  fontSize: '13px',
                  boxSizing: 'border-box',
                  outline: 'none'
                }}
              />
              <button
                type="submit"
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 0,
                  color: 'var(--gold)',
                  cursor: 'pointer',
                  display: 'grid',
                  placeItems: 'center',
                  padding: 0
                }}
              >
                <Search size={18} />
              </button>
            </form>

            {/* Live Suggestions Dropdown Box */}
            {searchFocused && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 6px)',
                  left: 0,
                  right: 0,
                  background: '#24061d',
                  border: '1px solid var(--line)',
                  borderRadius: '12px',
                  boxShadow: '0 16px 36px rgba(0,0,0,0.7)',
                  zIndex: 200,
                  padding: '12px',
                  color: '#fff'
                }}
              >
                {/* Popular searches & search history */}
                {!searchQuery && (
                  <div>
                    <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--gold)', marginBottom: '8px' }}>
                      Recent &amp; Popular Searches
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
                      {searchHistory.map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setSearchQuery(item);
                            navigate(`/shop?search=${encodeURIComponent(item)}`);
                            setSearchFocused(false);
                          }}
                          style={{
                            background: 'rgba(212,175,55,0.1)',
                            border: '1px solid var(--line)',
                            borderRadius: '20px',
                            padding: '4px 12px',
                            color: 'var(--cream)',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          🔍 {item}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Filtered suggestions */}
                {searchSuggestions.length > 0 && (
                  <div>
                    <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--gold)', marginBottom: '8px' }}>
                      Product Suggestions
                    </div>
                    {searchSuggestions.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => {
                          setSearchFocused(false);
                          handleProductAction(p, 'view');
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '8px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,240,208,0.06)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '6px',
                            backgroundImage: getImageBg(p.image_url),
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            backgroundColor: '#1b0416'
                          }}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '13px', color: 'var(--gold2)' }}>{p.name}</div>
                          <div style={{ fontSize: '11px', color: 'var(--cream)', opacity: 0.6 }}>
                            {p.category?.name} · {inr(p.selling_price || p.price)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ textAlign: 'right', marginTop: '6px' }}>
                  <button
                    type="button"
                    onClick={() => setSearchFocused(false)}
                    style={{ background: 'none', border: 'none', color: 'var(--gold)', fontSize: '11px', cursor: 'pointer', padding: 0 }}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Tools Bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <Link to="/shop" style={{ color: 'var(--gold2)', textDecoration: 'none', fontSize: '13px', fontWeight: 600 }}>
              All Pieces
            </Link>

            {/* Account / User Menu */}
            {isAuthenticated ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Link
                  to="/account"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: 'var(--gold2)',
                    fontSize: '13px',
                    fontWeight: 600,
                    textDecoration: 'none',
                    padding: '6px 14px',
                    borderRadius: '8px',
                    background: 'rgba(212,175,55,0.12)',
                    border: '1px solid var(--line)'
                  }}
                >
                  <User size={15} /> Hi, {user?.name?.split(' ')[0]}
                </Link>
                <button
                  onClick={() => {
                    logout();
                    showToast('Signed out successfully.');
                  }}
                  title="Sign Out"
                  style={{ background: 'none', border: 0, color: '#f87171', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <Link to="/login" className="gbtn" style={{ padding: '8px 18px', fontSize: '13px' }}>
                Sign In
              </Link>
            )}

            {/* Wishlist Link */}
            <Link
              to="/wishlist"
              style={{ position: 'relative', color: 'var(--gold)', display: 'flex', alignItems: 'center', textDecoration: 'none', padding: '6px' }}
              title="Saved Wishlist"
            >
              <Heart size={20} fill={wishlistCount > 0 ? '#f87171' : 'none'} color={wishlistCount > 0 ? '#f87171' : 'var(--gold)'} />
              {wishlistCount > 0 && (
                <span id="cnt" style={{ background: '#f87171' }}>{wishlistCount}</span>
              )}
            </Link>

            {/* Shopping Cart Link */}
            <Link
              to="/cart"
              style={{ position: 'relative', color: '#fff', display: 'flex', alignItems: 'center', textDecoration: 'none', padding: '6px' }}
              title="Shopping Bag"
            >
              <ShoppingBag size={20} />
              <span id="cnt">{cartCount}</span>
            </Link>
          </div>
        </div>
      </header>

      {/* 3. FLIPKART-STYLE 14 IMITATION JEWELLERY CATEGORIES CIRCLE RAIL */}
      <section style={{ background: 'linear-gradient(180deg, #24061d 0%, #170213 100%)', borderBottom: '1px solid var(--line)', padding: '14px 20px', overflowX: 'auto' }}>
        <div style={{ maxWidth: '1440px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '22px', minWidth: '1000px', paddingBottom: '4px' }}>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/category/${cat.slug}`}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
                textDecoration: 'none',
                color: 'var(--cream)',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                padding: '4px'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-3px)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundImage: getImageBg(cat.img),
                  backgroundColor: '#320726',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  border: '1.5px solid var(--line)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                  position: 'relative'
                }}
              >
                {cat.tag && (
                  <span style={{ position: 'absolute', bottom: '-4px', left: '50%', transform: 'translateX(-50%)', background: 'var(--gold)', color: '#1a0418', fontSize: '9px', fontWeight: 800, padding: '1px 5px', borderRadius: '4px', whiteSpace: 'nowrap', textTransform: 'uppercase' }}>
                    {cat.tag}
                  </span>
                )}
              </div>
              <span style={{ fontSize: '11.5px', fontWeight: 600, letterSpacing: '0.02em', textAlign: 'center', whiteSpace: 'nowrap', marginTop: '4px' }}>
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. PROMOTIONAL HERO BANNER CAROUSEL */}
      <section style={{ maxWidth: '1440px', width: '100%', margin: '20px auto 0', padding: '0 20px', boxSizing: 'border-box' }}>
        <div style={{ position: 'relative', height: '360px', borderRadius: '24px', overflow: 'hidden', border: '1px solid var(--line)', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
          {/* Slide 1 */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              opacity: heroSlide === 0 ? 1 : 0,
              transition: 'opacity 0.8s ease-in-out',
              backgroundImage: 'var(--i-model)',
              backgroundSize: 'cover',
              backgroundPosition: 'center 25%',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(20,2,16,0.92) 0%, rgba(20,2,16,0.5) 60%, rgba(20,2,16,0.1) 100%)' }} />
            <div style={{ position: 'relative', padding: '0 48px', maxWidth: '620px' }}>
              <div className="kick" style={{ color: 'var(--gold)', fontSize: '12px', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: '8px' }}>
                Festive Bridal Collection 2026
              </div>
              <h1 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '42px', color: 'var(--gold2)', margin: '0 0 12px', lineHeight: 1.15 }}>
                South Indian Temple Grandeur
              </h1>
              <p style={{ opacity: 0.85, fontSize: '15px', lineHeight: 1.5, marginBottom: '22px' }}>
                Handcrafted Lakshmi chokers, basra pearl jhumkas, and antique gold ottiyanams plated in 24k micro-matte finish.
              </p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <Link to="/category/bridal-jewellery" className="gbtn">
                  Explore Bridal Edit <ArrowRight size={15} style={{ marginLeft: '4px' }} />
                </Link>
                <Link to="/shop" style={{ padding: '12px 24px', borderRadius: '999px', border: '1px solid var(--line)', color: 'var(--cream)', textDecoration: 'none', fontSize: '13px', fontWeight: 600 }}>
                  View All Pieces
                </Link>
              </div>
            </div>
          </div>

          {/* Slide 2 */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              opacity: heroSlide === 1 ? 1 : 0,
              transition: 'opacity 0.8s ease-in-out',
              backgroundImage: 'var(--i-neck)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(20,2,16,0.92) 0%, rgba(20,2,16,0.5) 60%, rgba(20,2,16,0.1) 100%)' }} />
            <div style={{ position: 'relative', padding: '0 48px', maxWidth: '620px' }}>
              <div className="kick" style={{ color: 'var(--gold)', fontSize: '12px', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: '8px' }}>
                Deal of the Day · Up to 25% Off
              </div>
              <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '42px', color: 'var(--gold2)', margin: '0 0 12px', lineHeight: 1.15 }}>
                Heirloom Temple Lakshmi Necklace
              </h2>
              <p style={{ opacity: 0.85, fontSize: '15px', lineHeight: 1.5, marginBottom: '22px' }}>
                Pure kemp rubies and basra seed pearls set in artisan nakshi carvings with lifetime polish warranty.
              </p>
              <button
                onClick={() => handleProductAction(FALLBACK_PRODUCTS[0], 'view')}
                className="gbtn"
              >
                Shop Masterpiece <ArrowRight size={15} style={{ marginLeft: '4px' }} />
              </button>
            </div>
          </div>

          {/* Slide 3 */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              opacity: heroSlide === 2 ? 1 : 0,
              transition: 'opacity 0.8s ease-in-out',
              backgroundImage: 'var(--i-chest)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(20,2,16,0.92) 0%, rgba(20,2,16,0.5) 60%, rgba(20,2,16,0.1) 100%)' }} />
            <div style={{ position: 'relative', padding: '0 48px', maxWidth: '620px' }}>
              <div className="kick" style={{ color: 'var(--gold)', fontSize: '12px', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: '8px' }}>
                Festive Gifting Specials
              </div>
              <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '42px', color: 'var(--gold2)', margin: '0 0 12px', lineHeight: 1.15 }}>
                Heirloom Velvet Preservation Chests
              </h2>
              <p style={{ opacity: 0.85, fontSize: '15px', lineHeight: 1.5, marginBottom: '22px' }}>
                Seasoned rosewood trunks with brass fittings and anti-tarnish crimson velvet dividers.
              </p>
              <Link to="/category/festive-collections" className="gbtn">
                Browse Gifting <ArrowRight size={15} style={{ marginLeft: '4px' }} />
              </Link>
            </div>
          </div>

          {/* Slide Navigation Buttons */}
          <button
            onClick={() => setHeroSlide((prev) => (prev - 1 + 3) % 3)}
            style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--line)', color: '#fff', width: '40px', height: '40px', borderRadius: '50%', display: 'grid', placeItems: 'center', cursor: 'pointer' }}
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => setHeroSlide((prev) => (prev + 1) % 3)}
            style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--line)', color: '#fff', width: '40px', height: '40px', borderRadius: '50%', display: 'grid', placeItems: 'center', cursor: 'pointer' }}
          >
            <ChevronRight size={20} />
          </button>

          {/* Indicators */}
          <div style={{ position: 'absolute', bottom: '16px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '8px' }}>
            {[0, 1, 2].map((s) => (
              <button
                key={s}
                onClick={() => setHeroSlide(s)}
                style={{ width: '10px', height: '10px', borderRadius: '50%', border: 'none', background: heroSlide === s ? 'var(--gold)' : 'rgba(255,255,255,0.3)', cursor: 'pointer', padding: 0 }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 5. OFFERS & DEALS STRIP (COUPON BANNERS & COMBO OFFERS) */}
      <section style={{ maxWidth: '1440px', width: '100%', margin: '24px auto 0', padding: '0 20px', boxSizing: 'border-box' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          <div style={{ background: 'linear-gradient(135deg, #320726, #200318)', border: '1px solid var(--line)', borderRadius: '16px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(212,175,55,0.15)', display: 'grid', placeItems: 'center', color: 'var(--gold2)', flexShrink: 0 }}>
              <Tag size={22} />
            </div>
            <div>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--gold)', letterSpacing: '0.1em' }}>FLAT 10% OFF</div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#fff' }}>Use Code: WELCOME10</div>
              <div style={{ fontSize: '11px', color: 'var(--cream)', opacity: 0.7 }}>On your first order above ₹5,000</div>
            </div>
          </div>

          <div style={{ background: 'linear-gradient(135deg, #320726, #200318)', border: '1px solid var(--line)', borderRadius: '16px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(212,175,55,0.15)', display: 'grid', placeItems: 'center', color: 'var(--gold2)', flexShrink: 0 }}>
              <Gift size={22} />
            </div>
            <div>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--gold)', letterSpacing: '0.1em' }}>BRIDAL COMBO OFFER</div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#fff' }}>Complimentary Choker Pouch</div>
              <div style={{ fontSize: '11px', color: 'var(--cream)', opacity: 0.7 }}>Free velvet box with bridal sets</div>
            </div>
          </div>

          <div style={{ background: 'linear-gradient(135deg, #320726, #200318)', border: '1px solid var(--line)', borderRadius: '16px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(212,175,55,0.15)', display: 'grid', placeItems: 'center', color: 'var(--gold2)', flexShrink: 0 }}>
              <Truck size={22} />
            </div>
            <div>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--gold)', letterSpacing: '0.1em' }}>FREE INSURED SHIPPING</div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#fff' }}>Pan-India Delivery in 3-5 Days</div>
              <div style={{ fontSize: '11px', color: 'var(--cream)', opacity: 0.7 }}>Tamper-evident luxury packaging</div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. REUSABLE PRODUCT HORIZONTAL RAIL COMPONENT */}
      {/* SECTION 1: TODAY'S DEALS (WITH LIVE COUNTDOWN TIMER) */}
      <ProductSectionRail
        title="Today's Deals"
        subtitle="Limited-time promotional prices on South Indian temple masterpieces"
        badge={`⚡ Ends in ${dealTimeLeft}`}
        badgeColor="#ef4444"
        items={todaysDeals}
        onAction={handleProductAction}
        isInWishlist={isInWishlist}
        viewAllLink="/shop?filter=deals"
      />

      {/* SECTION 2: BEST SELLERS */}
      <ProductSectionRail
        title="Best Sellers"
        subtitle="Our most loved heirloom necklaces, jhumkas, and antique kadas"
        badge="🔥 Most Popular"
        badgeColor="var(--gold)"
        items={bestSellers}
        onAction={handleProductAction}
        isInWishlist={isInWishlist}
        viewAllLink="/shop?filter=bestsellers"
      />

      {/* SECTION 3: TRENDING JEWELLERY */}
      <ProductSectionRail
        title="Trending Jewellery"
        subtitle="Popular pieces chosen by contemporary South Indian brides this season"
        badge="📈 Trending Now"
        badgeColor="#3b82f6"
        items={trendingJewellery}
        onAction={handleProductAction}
        isInWishlist={isInWishlist}
        viewAllLink="/shop?filter=trending"
      />

      {/* SECTION 4: BRIDAL JEWELLERY COLLECTION */}
      <ProductSectionRail
        title="Bridal Jewellery Collection"
        subtitle="Complete grand trousseau chokers, harams, and vaddanams for your wedding muhurtham"
        badge="👑 Royal Wedding"
        badgeColor="#ec4899"
        items={bridalCollection}
        onAction={handleProductAction}
        isInWishlist={isInWishlist}
        viewAllLink="/category/bridal-jewellery"
      />

      {/* SECTION 5: NEW ARRIVALS */}
      <ProductSectionRail
        title="New Arrivals"
        subtitle="Fresh artisan releases from our master goldsmith ateliers"
        badge="✨ Fresh Castings"
        badgeColor="#10b981"
        items={newArrivals}
        onAction={handleProductAction}
        isInWishlist={isInWishlist}
        viewAllLink="/shop?sort=newest"
      />

      {/* SECTION 6: BUDGET-FRIENDLY JEWELLERY (UNDER ₹15,000) */}
      <ProductSectionRail
        title="Budget-Friendly Jewellery"
        subtitle="Everyday luxury and festive studs under ₹15,000 without compromising on 24k finish"
        badge="🏷️ Under ₹15,000"
        badgeColor="#f59e0b"
        items={budgetFriendly}
        onAction={handleProductAction}
        isInWishlist={isInWishlist}
        viewAllLink="/shop?price=under-15000"
      />

      {/* SECTION 7: FESTIVE SPECIAL COLLECTION */}
      <ProductSectionRail
        title="Festive Special Collection"
        subtitle="Curated showstoppers for Diwali, Pongal, Navratri, and family celebrations"
        badge="🪔 Festive Special"
        badgeColor="#d4af37"
        items={festiveSpecial}
        onAction={handleProductAction}
        isInWishlist={isInWishlist}
        viewAllLink="/category/festive-collections"
      />

      {/* SECTION 8: EXCLUSIVE & PREMIUM JEWELLERY */}
      <ProductSectionRail
        title="Exclusive & Premium Heritage"
        subtitle="Heavy nakshi vaddanams and solid artisan-cast bridal harams"
        badge="💎 Signature Edition"
        badgeColor="#8b5cf6"
        items={exclusiveCollection}
        onAction={handleProductAction}
        isInWishlist={isInWishlist}
        viewAllLink="/shop?price=above-30000"
      />

      {/* SECTION 9: TOP-RATED PRODUCTS */}
      <ProductSectionRail
        title="Top-Rated Products"
        subtitle="Rated 4.8★ and above by verified patrons across India"
        badge="⭐ 4.8+ Stars"
        badgeColor="#f59e0b"
        items={topRated}
        onAction={handleProductAction}
        isInWishlist={isInWishlist}
        viewAllLink="/shop?sort=rating"
      />

      {/* SECTION 10: RECOMMENDED FOR YOU */}
      <ProductSectionRail
        title="Recommended For You"
        subtitle="Curated styling suggestions tailored to your bridal and festive preferences"
        badge="✦ Tailored For You"
        badgeColor="var(--gold)"
        items={recommendedForYou}
        onAction={handleProductAction}
        isInWishlist={isInWishlist}
        viewAllLink="/shop"
      />

      {/* SECTION 11: RECENTLY VIEWED PRODUCTS (DYNAMIC LOCALSTORAGE) */}
      {recentlyViewed && recentlyViewed.length > 0 && (
        <ProductSectionRail
          title="Recently Viewed Products"
          subtitle="Pieces you inspected during your current visit"
          badge="👁️ Your History"
          badgeColor="#06b6d4"
          items={recentlyViewed}
          onAction={handleProductAction}
          isInWishlist={isInWishlist}
          viewAllLink="/shop"
        />
      )}

      {/* 7. SHOP BY OCCASION & PRICE RANGE GRID */}
      <section style={{ maxWidth: '1440px', width: '100%', margin: '40px auto 0', padding: '0 20px', boxSizing: 'border-box' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div className="kick" style={{ color: 'var(--gold)', fontSize: '12px', letterSpacing: '0.25em', textTransform: 'uppercase' }}>
            Curated Navigation
          </div>
          <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '36px', color: 'var(--gold2)', margin: '4px 0 0' }}>
            Shop by Occasion &amp; Price Range
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px', marginBottom: '32px' }}>
          {[
            { title: 'Bridal Muhurtham', desc: 'Heavy chokers & vaddanams', link: '/shop?occasion=Bridal', img: 'var(--i-model)' },
            { title: 'Sangeet & Reception', desc: 'Pearl jhumkas & cocktail rings', link: '/shop?occasion=Festive', img: 'var(--i-ear)' },
            { title: 'Temple Festivals', desc: 'Antique Lakshmi coin jewellery', link: '/shop?category=temple-jewellery', img: 'var(--i-neck)' },
            { title: 'Daily Elegance', desc: 'Lightweight anti-tarnish wear', link: '/shop?category=daily-wear-jewellery', img: 'var(--i-ring)' },
            { title: 'Under ₹15,000', desc: 'Festive pieces within budget', link: '/shop?max_price=15000', img: 'var(--i-bang)' },
            { title: 'Above ₹40,000', desc: 'Heirloom bridal sets', link: '/shop?min_price=40000', img: 'var(--i-belt)' }
          ].map((card, idx) => (
            <Link
              key={idx}
              to={card.link}
              style={{
                textDecoration: 'none',
                background: 'linear-gradient(160deg, #320726, #200318)',
                border: '1px solid var(--line)',
                borderRadius: '16px',
                padding: '18px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                transition: 'transform 0.2s, border-color 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.borderColor = 'var(--gold)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'var(--line)';
              }}
            >
              <div
                style={{
                  width: '100%',
                  height: '110px',
                  borderRadius: '10px',
                  backgroundImage: getImageBg(card.img),
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundColor: '#1b0416'
                }}
              />
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--gold2)', margin: '0 0 4px' }}>
                  {card.title}
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--cream)', opacity: 0.7, margin: 0 }}>
                  {card.desc}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 8. CUSTOMER REVIEWS & TESTIMONIALS */}
      <section style={{ maxWidth: '1440px', width: '100%', margin: '40px auto 0', padding: '0 20px', boxSizing: 'border-box' }}>
        <div style={{ background: 'linear-gradient(160deg, #28051f, #180213)', border: '1px solid var(--line)', borderRadius: '24px', padding: '40px 32px' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div className="kick" style={{ color: 'var(--gold)', fontSize: '12px', letterSpacing: '0.25em', textTransform: 'uppercase' }}>
              Patron Testimonials
            </div>
            <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '34px', color: 'var(--gold2)', margin: '4px 0 0' }}>
              Loved by Brides Across India
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            {[
              {
                name: 'Kavitha Ramachandran',
                city: 'Chennai',
                comment: 'The Temple Lakshmi necklace looked indistinguishable from real 24k gold on my wedding day! The kemp stones are luminous.',
                rating: 5,
                product: 'Temple Lakshmi Necklace'
              },
              {
                name: 'Ananya Deshmukh',
                city: 'Bangalore',
                comment: 'The Pearl Jhumkas arrived in a royal velvet box with tamper-evident seal. Weight is comfortable for 8 hours of dancing!',
                rating: 5,
                product: 'Pearl Jhumka Earrings'
              },
              {
                name: 'Meera Venkataraman',
                city: 'Hyderabad',
                comment: 'The heirloom chest is a work of art. The secret drawers and brass latches keep my entire wedding jewellery collection tarnishing-free.',
                rating: 5,
                product: 'Heirloom Jewellery Chest'
              }
            ].map((rev, idx) => (
              <div key={idx} style={{ background: 'rgba(255,240,208,0.04)', border: '1px solid var(--line)', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', color: 'var(--gold2)' }}>
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} size={15} fill="var(--gold2)" stroke="var(--gold2)" />
                  ))}
                </div>
                <p style={{ fontSize: '14px', lineHeight: 1.6, opacity: 0.9, margin: 0, fontStyle: 'italic' }}>
                  "{rev.comment}"
                </p>
                <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(212,175,55,0.15)', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ fontSize: '13px', color: 'var(--gold2)' }}>{rev.name}</strong>
                    <div style={{ fontSize: '11px', opacity: 0.6 }}>{rev.city} · Verified Purchase</div>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--gold)', fontWeight: 600 }}>{rev.product}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. BRAND BENEFITS */}
      <section style={{ maxWidth: '1440px', width: '100%', margin: '48px auto', padding: '0 20px', boxSizing: 'border-box' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
          {[
            { icon: <Award size={24} />, title: '24k Matte Gold Finish', desc: 'Artisan micro-plating with authentic South Indian patina' },
            { icon: <Truck size={24} />, title: 'Insured Pan-India Delivery', desc: 'Secure tamper-evident shipping with live SMS tracking' },
            { icon: <RotateCcw size={24} />, title: '7-Day Easy Exchange', desc: 'Hassle-free replacement policy for perfect bridal peace of mind' },
            { icon: <ShieldCheck size={24} />, title: 'Hallmark Craft Standard', desc: 'Hypoallergenic skin-friendly alloy certified nickel & lead free' }
          ].map((b, idx) => (
            <div key={idx} style={{ background: 'linear-gradient(160deg, #320726, #200318)', border: '1px solid var(--line)', borderRadius: '16px', padding: '24px 20px', textAlign: 'center' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(212,175,55,0.15)', color: 'var(--gold2)', display: 'grid', placeItems: 'center', margin: '0 auto 14px' }}>
                {b.icon}
              </div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--gold2)', margin: '0 0 6px' }}>{b.title}</h3>
              <p style={{ fontSize: '12px', opacity: 0.75, margin: 0, lineHeight: 1.5 }}>{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 10. NEWSLETTER SUBSCRIPTION */}
      <section style={{ background: 'linear-gradient(180deg, #1b0315 0%, #12020e 100%)', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', padding: '48px 20px' }}>
        <div style={{ maxWidth: '640px', margin: '0 auto', textAlign: 'center' }}>
          <div className="kick" style={{ color: 'var(--gold)', fontSize: '12px', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: '8px' }}>
            Exclusive Privileges
          </div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '32px', color: 'var(--gold2)', margin: '0 0 10px' }}>
            Join {storeName} Royal Circle
          </h2>
          <p style={{ fontSize: '14px', opacity: 0.8, marginBottom: '24px', lineHeight: 1.5 }}>
            Subscribe to receive private preview access to our seasonal bridal releases, artisan trunk shows, and an instant ₹1,000 welcome voucher.
          </p>
          <form onSubmit={handleNewsletterSubmit} style={{ display: 'flex', gap: '8px', maxWidth: '440px', margin: '0 auto' }}>
            <input
              type="email"
              required
              placeholder="Enter your email address..."
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              style={{ flex: 1, padding: '12px 16px', borderRadius: '999px', background: 'rgba(255,240,208,0.08)', border: '1px solid var(--line)', color: '#fff', fontSize: '13px', outline: 'none' }}
            />
            <button type="submit" className="gbtn" style={{ padding: '12px 24px', fontSize: '13px' }}>
              Subscribe
            </button>
          </form>
        </div>
      </section>

      {/* 11. COMPLETE FOOTER (WITH POWERED BY AMINOID LINK) */}
      <footer id="about" style={{ background: '#0e010b', color: 'var(--cream)', padding: '48px 20px 24px' }}>
        <div style={{ maxWidth: '1440px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '36px', paddingBottom: '36px', borderBottom: '1px solid rgba(212,175,55,0.2)' }}>
          {/* Col 1 */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <span className="logo" style={{ width: '32px', height: '32px' }}></span>
              <strong style={{ fontSize: '18px', color: 'var(--gold2)', fontFamily: 'var(--font-serif)', letterSpacing: '0.06em' }}>{storeName}</strong>
            </div>
            <p style={{ fontSize: '13px', opacity: 0.75, lineHeight: 1.6, margin: '0 0 16px' }}>
              Single-vendor flagship online portal for premium imitation jewellery, handcrafted temple chokers, antique gold kadas, and Basra pearl earrings.
            </p>
            <div style={{ display: 'flex', gap: '12px', color: 'var(--gold)' }}>
              <Instagram size={18} style={{ cursor: 'pointer' }} />
              <Facebook size={18} style={{ cursor: 'pointer' }} />
              <Twitter size={18} style={{ cursor: 'pointer' }} />
            </div>
          </div>

          {/* Col 2 */}
          <div>
            <h4 style={{ color: 'var(--gold2)', fontSize: '15px', margin: '0 0 14px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Collections</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', opacity: 0.8 }}>
              <Link to="/category/necklaces" style={{ color: 'inherit', textDecoration: 'none' }}>Temple Necklaces</Link>
              <Link to="/category/earrings" style={{ color: 'inherit', textDecoration: 'none' }}>Pearl Jhumkas</Link>
              <Link to="/category/bangles" style={{ color: 'inherit', textDecoration: 'none' }}>Antique Kadas</Link>
              <Link to="/category/bridal-jewellery" style={{ color: 'inherit', textDecoration: 'none' }}>Bridal Vaddanams</Link>
              <Link to="/category/festive-collections" style={{ color: 'inherit', textDecoration: 'none' }}>Jewellery Chests</Link>
            </div>
          </div>

          {/* Col 3 */}
          <div>
            <h4 style={{ color: 'var(--gold2)', fontSize: '15px', margin: '0 0 14px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Customer Service</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', opacity: 0.8 }}>
              <Link to="/orders" style={{ color: 'inherit', textDecoration: 'none' }}>Track Your Order</Link>
              <Link to="/cart" style={{ color: 'inherit', textDecoration: 'none' }}>Shipping Rates &amp; Policy</Link>
              <Link to="/account" style={{ color: 'inherit', textDecoration: 'none' }}>Manage Account</Link>
              <span style={{ cursor: 'pointer' }}>Returns &amp; Exchanges</span>
              <span style={{ cursor: 'pointer' }}>Authenticity Certificate</span>
            </div>
          </div>

          {/* Col 4 */}
          <div>
            <h4 style={{ color: 'var(--gold2)', fontSize: '15px', margin: '0 0 14px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Concierge &amp; Help</h4>
            <p style={{ fontSize: '13px', opacity: 0.75, lineHeight: 1.6, margin: '0 0 8px' }}>
              Mon–Sat, 10:00 AM – 7:00 PM IST
            </p>
            <div style={{ fontSize: '13px', color: 'var(--gold2)', marginBottom: '4px' }}>
              support@theethnicedit.com
            </div>
            <div style={{ fontSize: '13px', opacity: 0.75 }}>
              +91 98765 43210
            </div>
            <div style={{ marginTop: '12px' }}>
              
            </div>
          </div>
        </div>

        {/* Footer Credit Powered By Aminoid */}
        <div style={{ maxWidth: '1440px', margin: '20px auto 0', textAlign: 'center', fontSize: '13px', color: 'var(--cream)', opacity: 0.8 }}>
          <p style={{ margin: 0 }}>
            © 2026 {storeName} · Single Vendor Imitation Jewellery Platform ·{' '}
            <strong style={{ color: '#fff' }}>Powered by </strong>
            <a
              href="https://www.aminoid.in/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--gold2)', textDecoration: 'underline', fontWeight: 700 }}
            >
              Aminoid
            </a>
          </p>
        </div>
      </footer>

      {/* Product Quick Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}

// HORIZONTALLY SCROLLABLE PRODUCT SECTION RAIL COMPONENT
function ProductSectionRail({ title, subtitle, badge, badgeColor, items, onAction, isInWishlist, viewAllLink }) {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -340 : 340;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const getImageBg = (img) => {
    if (!img) return 'var(--i-neck)';
    if (img.startsWith('var(')) return img;
    if (img.startsWith('/uploads/') || img.startsWith('http')) {
      return `url(${img})`;
    }
    return `url(${img})`;
  };

  if (!items || items.length === 0) return null;

  return (
    <section style={{ maxWidth: '1440px', width: '100%', margin: '32px auto 0', padding: '0 20px', boxSizing: 'border-box' }}>
      <div style={{ background: 'linear-gradient(160deg, #2a0520, #190214)', border: '1px solid var(--line)', borderRadius: '20px', padding: '24px 20px', position: 'relative' }}>
        {/* Rail Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '26px', color: 'var(--gold2)', margin: 0 }}>
                {title}
              </h2>
              {badge && (
                <span style={{ background: 'rgba(255,255,255,0.08)', border: `1px solid ${badgeColor}`, color: badgeColor, fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '12px' }}>
                  {badge}
                </span>
              )}
            </div>
            {subtitle && (
              <p style={{ fontSize: '13px', opacity: 0.75, margin: 0 }}>{subtitle}</p>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {viewAllLink && (
              <Link to={viewAllLink} style={{ color: 'var(--gold)', fontSize: '13px', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                View All <ArrowRight size={14} />
              </Link>
            )}
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                onClick={() => scroll('left')}
                style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,240,208,0.1)', border: '1px solid var(--line)', color: 'var(--gold2)', display: 'grid', placeItems: 'center', cursor: 'pointer', padding: 0 }}
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => scroll('right')}
                style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,240,208,0.1)', border: '1px solid var(--line)', color: 'var(--gold2)', display: 'grid', placeItems: 'center', cursor: 'pointer', padding: 0 }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Horizontal Scroll Track */}
        <div
          ref={scrollRef}
          style={{
            display: 'flex',
            gap: '18px',
            overflowX: 'auto',
            paddingBottom: '8px',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
        >
          {items.map((prod) => {
            const price = parseFloat(prod.selling_price || prod.price || 0);
            const original = parseFloat(prod.original_price || price * 1.15);
            const discountPct = original > price ? Math.round(((original - price) / original) * 100) : 12;
            const inWish = isInWishlist(prod.id);

            return (
              <div
                key={prod.id}
                style={{
                  flex: '0 0 250px',
                  background: 'linear-gradient(160deg, #320726, #200318)',
                  border: '1px solid var(--line)',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 12px 28px rgba(0,0,0,0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Product Image Box */}
                <div
                  onClick={() => onAction(prod, 'view')}
                  style={{
                    width: '100%',
                    aspectRatio: '1',
                    backgroundImage: getImageBg(prod.image_url),
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundColor: '#1b0416',
                    cursor: 'pointer',
                    position: 'relative'
                  }}
                >
                  {/* Discount tag badge */}
                  {discountPct > 0 && (
                    <span style={{ position: 'absolute', top: '10px', left: '10px', background: '#e11d48', color: '#fff', fontSize: '10px', fontWeight: 800, padding: '2px 7px', borderRadius: '4px' }}>
                      {discountPct}% OFF
                    </span>
                  )}

                  {/* Wishlist toggle button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAction(prod, 'wishlist');
                    }}
                    style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'rgba(20,2,16,0.7)',
                      border: '1px solid var(--line)',
                      color: inWish ? '#f87171' : 'var(--gold2)',
                      display: 'grid',
                      placeItems: 'center',
                      cursor: 'pointer',
                      backdropFilter: 'blur(4px)'
                    }}
                  >
                    <Heart size={16} fill={inWish ? '#f87171' : 'none'} />
                  </button>
                </div>

                {/* Product Details Box */}
                <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <div style={{ fontSize: '11px', color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
                    {prod.category?.name || 'Jewellery'}
                  </div>

                  <h3
                    onClick={() => onAction(prod, 'view')}
                    style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: 'var(--cream)',
                      margin: '0 0 8px',
                      cursor: 'pointer',
                      lineHeight: 1.3,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    {prod.name}
                  </h3>

                  {/* Ratings */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', color: 'var(--gold2)' }}>
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={12} fill="var(--gold2)" stroke="var(--gold2)" />
                      ))}
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--gold2)', fontWeight: 600 }}>{prod.rating || 4.9}</span>
                    <span style={{ fontSize: '11px', opacity: 0.6 }}>({prod.reviews_count || 75})</span>
                  </div>

                  {/* Price */}
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '12px' }}>
                    <span style={{ fontSize: '17px', fontWeight: 700, color: 'var(--gold2)' }}>
                      {inr(price)}
                    </span>
                    {original > price && (
                      <span style={{ fontSize: '12px', opacity: 0.5, textDecoration: 'line-through' }}>
                        {inr(original)}
                      </span>
                    )}
                  </div>

                  {/* Quick Action Buttons */}
                  <div style={{ marginTop: 'auto', display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => onAction(prod, 'cart')}
                      style={{
                        flex: 1,
                        padding: '8px',
                        borderRadius: '8px',
                        background: 'linear-gradient(135deg, #f6dda0, #d4af37)',
                        border: 'none',
                        color: '#1a0418',
                        fontWeight: 700,
                        fontSize: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px'
                      }}
                    >
                      <ShoppingBag size={13} /> Add to Cart
                    </button>
                    <button
                      onClick={() => onAction(prod, 'view')}
                      style={{
                        padding: '8px 10px',
                        borderRadius: '8px',
                        background: 'rgba(255,240,208,0.08)',
                        border: '1px solid var(--line)',
                        color: 'var(--gold2)',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                      title="View Details"
                    >
                      <Eye size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
