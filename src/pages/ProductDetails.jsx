import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { productService } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useStore } from '../context/StoreContext';
import {
  ArrowLeft,
  Star,
  ShieldCheck,
  Truck,
  RefreshCw,
  ShoppingBag,
  Heart,
  Share2,
  Tag,
  Check,
  CheckCircle2,
  Clock,
  MapPin,
  ChevronRight,
  MessageSquare,
  Sparkles,
  Eye,
  X,
  Globe,
  Settings
} from 'lucide-react';
import '../EthnicEdit.css';

const inr = (n) => '₹' + Number(n).toLocaleString('en-IN');

const SAMPLE_REVIEWS = [
  {
    id: 1,
    name: 'Radhika Sundaram',
    rating: 5,
    date: '24 Oct 2026',
    title: 'Breathtaking craftsmanship! Indistinguishable from real 22k gold.',
    comment: 'Wore this for my cousin’s wedding and received non-stop compliments. The antique matte gold finish and kemp stones look completely authentic.',
    verified: true
  },
  {
    id: 2,
    name: 'Priyanka Nambiar',
    rating: 5,
    date: '18 Oct 2026',
    title: 'Substantial weight and luxurious packaging.',
    comment: 'The piece has an heirloom presence. The micro seed pearls are strung very firmly and the velvet box ensures it stays tarnish-free.',
    verified: true
  },
  {
    id: 3,
    name: 'Ananya Deshmukh',
    rating: 4,
    date: '05 Oct 2026',
    title: 'Exquisite detailing, prompt dispatch.',
    comment: 'Delivered in 3 days in Mumbai. The adjustable back dori makes it very comfortable to drape.',
    verified: true
  }
];

const CORE_PRODUCTS = [
  {
    id: 'neck',
    name: 'Temple Lakshmi Choker & Long Mala Set',
    category: { name: 'Necklaces', slug: 'necklaces' },
    selling_price: 48500,
    original_price: 54900,
    sku: 'TEE-NCK-001',
    stock: 8,
    image_url: 'var(--i-neck)',
    additional_images: ['var(--i-neck)', 'var(--i-ear)', 'var(--i-chest)'],
    rating: 4.9,
    reviews_count: 128,
    badge: '👑 Bestseller',
    jewellery_type: 'Temple Jewellery',
    material: '24k Antique Gold Plated over Cast Brass',
    stones: 'South Indian Synthetic Kemp Stones & Basra Seed Pearls',
    colour: 'Antique Matte Gold & Deep Ruby',
    occasion: 'Bridal & Grand Wedding Festivities',
    weight: '82 grams',
    dimensions: 'Necklace length: 22 cm, Pendant: 6.5 cm × 5.0 cm',
    closure: 'Traditional Silk Zari Adjustable Dori',
    care: 'Store in moisture-free velvet box. Strictly avoid contact with perfume, water, and hair sprays.',
    description: 'This temple necklace is an ode to timeless South Indian bridal grandeur. Featuring an ornate central pendant of Goddess Lakshmi flanked by dancing peacocks, accented with deep red kemp stones and natural freshwater pearls. Plated in 24k antique matte gold finish.'
  },
  {
    id: 'ear',
    name: 'South Indian Antique Pearl Tiered Jhumkas',
    category: { name: 'Earrings', slug: 'earrings' },
    selling_price: 18900,
    original_price: 21500,
    sku: 'TEE-EAR-002',
    stock: 15,
    image_url: 'var(--i-ear)',
    additional_images: ['var(--i-ear)', 'var(--i-neck)', 'var(--i-ring)'],
    rating: 4.8,
    reviews_count: 94,
    badge: '✨ Trending',
    jewellery_type: 'Antique Jewellery',
    material: 'Cast Artisan Brass with 24k Gold Layering',
    stones: 'Micro Seed Pearls & Cabochon Ruby Simulants',
    colour: 'Antique Gold & Basra Pearl White',
    occasion: 'Festive & Family Celebrations',
    weight: '34 grams per pair',
    dimensions: 'Length: 7.2 cm, Bell Diameter: 3.0 cm',
    closure: 'Push-back post with secure South Indian Bombay screw',
    care: 'Wipe gently with soft cotton cloth after use. Keep sealed in provided pouch.',
    description: 'Classic bell-shaped tiered jhumkas suspended from an intricate floral ear stud with micro seed pearls that sway gently with every step.'
  },
  {
    id: 'bang',
    name: 'Royal Heritage Antique Gold Filigree Bangles',
    category: { name: 'Bangles', slug: 'bangles' },
    selling_price: 32400,
    original_price: 36000,
    sku: 'TEE-BNG-003',
    stock: 6,
    image_url: 'var(--i-bang)',
    additional_images: ['var(--i-bang)', 'var(--i-belt)', 'var(--i-ring)'],
    rating: 4.9,
    reviews_count: 76,
    badge: '⭐ Royal Heritage',
    jewellery_type: 'Temple Jewellery',
    material: '24k Antique Gold Plated Brass Alloy',
    stones: 'Micro un-cut polki crystals and emerald paste',
    colour: 'Antique Gold & Emerald Accents',
    occasion: 'Bridal & Festive',
    weight: '64 grams (Pair)',
    dimensions: 'Available Sizes: 2.4, 2.6, 2.8',
    closure: 'Side hinge screw-lock for easy wearing',
    care: 'Keep away from moisture and chemical disinfectants.',
    description: 'Pair of solid kada bangles showcasing openwork filigree craft inspired by temple architecture.'
  },
  {
    id: 'ring',
    name: 'Kemp Gemstone Floral Cocktail Ring',
    category: { name: 'Rings', slug: 'rings' },
    selling_price: 12600,
    original_price: 14500,
    sku: 'TEE-RNG-004',
    stock: 22,
    image_url: 'var(--i-ring)',
    additional_images: ['var(--i-ring)', 'var(--i-ear)', 'var(--i-neck)'],
    rating: 4.7,
    reviews_count: 54,
    badge: '🔥 Deal of Day',
    jewellery_type: 'Kundan & Polki',
    material: 'Copper-Brass Alloy with Micro Gold Finish',
    stones: 'Oval Cabochon Synthetic Ruby & Uncut Polki Crystals',
    colour: 'Ruby Red & Polki White',
    occasion: 'Party & Cocktail',
    weight: '16 grams',
    dimensions: 'Top motif diameter: 3.4 cm',
    closure: 'Free-size adjustable inner comfort band',
    care: 'Avoid wearing during hand sanitizing or dishwashing.',
    description: 'Centred with an oval cabochon synthetic ruby surrounded by floral petals encrusted with un-cut polki crystals.'
  },
  {
    id: 'belt',
    name: 'Temple Goddess Lakshmi Bridal Vaddanam Waist Belt',
    category: { name: 'Bridal Jewellery', slug: 'bridal-jewellery' },
    selling_price: 54900,
    original_price: 62000,
    sku: 'TEE-BLT-005',
    stock: 4,
    image_url: 'var(--i-belt)',
    additional_images: ['var(--i-belt)', 'var(--i-neck)', 'var(--i-bang)'],
    rating: 5.0,
    reviews_count: 45,
    badge: '👑 Heirloom Bridal',
    jewellery_type: 'Temple Jewellery',
    material: '24k Antique Gold Plated over Cast Brass',
    stones: 'Kemp Rubies, Emerald Cabochons & Pearl Hangings',
    colour: 'Antique Matte Gold',
    occasion: 'Bridal Muhurtham',
    weight: '140 grams',
    dimensions: 'Carved Belt Length: 32 inches + 10 inches adjustable chain',
    closure: 'Heavy hook clasp with adjustable link extension',
    care: 'Wrap in clean cotton cloth; preserve flat in jewellery chest.',
    description: 'An heirloom vaddanam waist belt crafted for the contemporary bride. The central panel depicts Goddess Lakshmi surrounded by miniature carved deities.'
  },
  {
    id: 'box',
    name: 'Heirloom Handcrafted Velvet Jewellery Chest',
    category: { name: 'Festive Collections', slug: 'festive-collections' },
    selling_price: 8900,
    original_price: 10500,
    sku: 'TEE-BOX-006',
    stock: 14,
    image_url: 'var(--i-chest)',
    additional_images: ['var(--i-chest)', 'var(--i-neck)', 'var(--i-ring)'],
    rating: 4.9,
    reviews_count: 83,
    badge: '🎁 Patron Favorite',
    jewellery_type: 'Antique Jewellery',
    material: 'Seasoned Teak Wood, Brass Mounts & Crimson Velvet',
    stones: 'N/A',
    colour: 'Deep Burgundy Velvet & Cast Brass',
    occasion: 'Gifting & Preservation',
    weight: '1.2 kg',
    dimensions: '30 cm × 20 cm × 12 cm',
    closure: 'Vintage brass hasp lock mechanism',
    care: 'Dust with soft brush.',
    description: 'Designed exclusively for keeping your precious temple jewellery tarnishing-free. Featuring carved brass fittings and modular compartments.'
  }
];

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, cartCount, toggleWishlist, isInWishlist, addRecentlyViewed, recentlyViewed } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { lang, setLang, t, isTamil, translateCategory } = useLanguage();
  const { storeSettings, storeName } = useStore();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [toastMessage, setToastMessage] = useState('');
  const [pincode, setPincode] = useState('');
  const [deliveryResult, setDeliveryResult] = useState(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [categorySimilar, setCategorySimilar] = useState([]);

  // Reviews state
  const [reviews, setReviews] = useState(SAMPLE_REVIEWS);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, title: '', comment: '' });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2600);
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        // Try Backend API first
        let res = null;
        try {
          res = await productService.getProductById(id);
        } catch (apiErr) {
          // If not found in API, will check core products below
        }

        if (res && res.success && res.product) {
          const p = res.product;

          // Collect ALL images from backend p.images or fallback
          let allImgs = [];
          if (Array.isArray(p.images) && p.images.length > 0) {
            allImgs = p.images
              .map((im) => (typeof im === 'string' ? im.trim() : im?.image_url))
              .filter(Boolean);
          }
          if (allImgs.length === 0 && p.image_url) {
            allImgs = [p.image_url];
          }
          if (allImgs.length === 0) {
            allImgs = ['var(--i-neck)'];
          }

          const enhanced = {
            ...p,
            image_url: allImgs[0],
            additional_images: allImgs,
            jewellery_type: p.jewellery_type || p.collection_type || 'Temple Jewellery',
            material: p.material || '24k Antique Gold Plated Brass',
            stones: p.stones || 'Synthetic Kemp & Seed Pearls',
            colour: p.colour || 'Antique Gold',
            occasion: p.occasion || 'Bridal & Festive',
            weight: p.weight || '58 grams',
            dimensions: p.dimensions || 'Standard Bridal Specification',
            closure: 'Adjustable Traditional Clasp',
            care: 'Keep in airtight pouch away from perfumes and sprays.',
            rating: p.rating || 4.9,
            reviews_count: p.reviews_count || 64
          };
          setProduct(enhanced);
          setSelectedImage(allImgs[0]);
          addRecentlyViewed(enhanced);

          // Fetch other items STRICTLY from this category
          const catKey = p.category?.slug || p.category_id || p.category?.name;
          if (catKey) {
            productService.getProducts({ category: catKey, limit: 12 })
              .then((resp) => {
                if (resp.success && Array.isArray(resp.products)) {
                  const filteredRelated = resp.products
                    .filter((item) => item.id !== p.id)
                    .map((item) => ({
                      ...item,
                      image_url: item.images?.[0]?.image_url || item.image_url || 'var(--i-neck)'
                    }))
                    .slice(0, 4);
                  setCategorySimilar(filteredRelated);
                }
              })
              .catch(() => {});
          }
        } else {
          // Check core products fallback
          const coreMatch = CORE_PRODUCTS.find((p) => p.id === id || p.sku === id);
          const fallbackProduct = coreMatch || CORE_PRODUCTS[0];
          setProduct(fallbackProduct);
          setSelectedImage(fallbackProduct.image_url);
          addRecentlyViewed(fallbackProduct);
        }
      } catch (e) {
        setProduct(CORE_PRODUCTS[0]);
        setSelectedImage(CORE_PRODUCTS[0].image_url);
        addRecentlyViewed(CORE_PRODUCTS[0]);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
    window.scrollTo(0, 0);
  }, [id]);

  // Protected actions check
  const checkAuth = () => {
    if (!isAuthenticated) {
      showToast('Please sign in to start shopping.');
      setTimeout(() => navigate('/login'), 600);
      return false;
    }
    return true;
  };

  const handleAddToCart = () => {
    if (!checkAuth()) return;
    if (!product) return;
    for (let i = 0; i < quantity; i++) {
      addToCart({
        ...product,
        image_url: selectedImage
      });
    }
    showToast(`Added ${quantity} × ${product.name} to your bag!`);
    // Navigate directly to cart page as user requested
    navigate('/cart');
  };

  const handleBuyNow = () => {
    if (!checkAuth()) return;
    const checkoutItem = {
      ...product,
      quantity,
      image_url: selectedImage,
      price: product.selling_price || product.price
    };
    sessionStorage.setItem('tee_buy_now_item', JSON.stringify(checkoutItem));
    // Navigate directly to buynow page as user requested
    navigate('/buy-now', { state: { product: checkoutItem, quantity } });
  };

  const handleWishlistToggle = () => {
    if (!checkAuth()) return;
    toggleWishlist(product);
    showToast('Added to Wishlist!');
    // Navigate directly to wishlist page as user requested
    navigate('/wishlist');
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Masterpiece link copied to clipboard!');
    } else {
      showToast('Link copied!');
    }
  };

  const handleCheckPincode = (e) => {
    e.preventDefault();
    if (pincode.length !== 6 || isNaN(pincode)) {
      setDeliveryResult({ success: false, message: 'Please enter a valid 6-digit Indian PIN code.' });
      return;
    }
    const days = 3 + (parseInt(pincode) % 3);
    const date = new Date(Date.now() + days * 86400000);
    const formatted = date.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });
    setDeliveryResult({
      success: true,
      message: `Delivering to ${pincode} by ${formatted}. Complimentary Insured Shipping & COD available.`
    });
  };

  const handleImageMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - left) / width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - top) / height) * 100));
    setZoomPos({ x, y });
  };

  const handleAddReview = (e) => {
    e.preventDefault();
    if (!newReview.title || !newReview.comment) {
      showToast('Please fill all review fields.');
      return;
    }
    const created = {
      id: Date.now(),
      name: user?.name || 'Verified Patron',
      rating: newReview.rating,
      date: 'Just now',
      title: newReview.title,
      comment: newReview.comment,
      verified: true
    };
    setReviews([created, ...reviews]);
    setIsReviewModalOpen(false);
    setNewReview({ rating: 5, title: '', comment: '' });
    showToast('Thank you! Your verified review has been published.');
  };

  if (loading || !product) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'var(--bg)', color: 'var(--gold2)' }}>
        Loading heirloom masterpiece...
      </div>
    );
  }

  const isCss = selectedImage && selectedImage.startsWith('var(');
  const bg = isCss ? selectedImage : selectedImage ? `url("${encodeURI(selectedImage)}")` : 'var(--i-neck)';

  const sellingPrice = parseFloat(product.selling_price || product.price || 0);
  const originalPrice = parseFloat(product.original_price || sellingPrice * 1.15);
  const discountPct = originalPrice > sellingPrice ? Math.round(((originalPrice - sellingPrice) / originalPrice) * 100) : 0;
  const wishlisted = isInWishlist(product.id);
  const imagesList = product.additional_images?.length ? product.additional_images : [product.image_url];

  // Similar products strictly matching this jewellery collection
  const similarProducts = categorySimilar.length > 0
    ? categorySimilar
    : CORE_PRODUCTS.filter((p) => p.id !== product.id && (p.category?.slug === product.category?.slug || p.jewellery_type === product.jewellery_type)).slice(0, 4);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)', color: 'var(--cream)' }}>
      {/* Toast Notification */}
      <div className={`tst ${toastMessage ? 'on' : ''}`} style={{ display: toastMessage ? 'block' : 'none' }}>
        {toastMessage}
      </div>

      {/* Top Banner */}
      <div style={{ background: 'linear-gradient(90deg, #2a0520, #420833, #2a0520)', color: 'var(--gold2)', padding: '7px 16px', fontSize: '11px', textAlign: 'center', letterSpacing: '0.1em', textTransform: 'uppercase', borderBottom: '1px solid rgba(212,175,55,0.2)' }}>
        ✨ Special Festive Deal · Extra 10% off with coupon <b>WELCOME10</b> at checkout
      </div>

      {/* Navigation Header */}
      <header className="nav sc" style={{ position: 'sticky', top: 0, zIndex: 100 }}>
        <Link className="brand" to="/" aria-label={`${storeName} home`}>
          <span className="logo"></span>
          <span>
            <b>{storeName}</b>
            <small>{storeSettings.tagline || t('heroSubtitle', 'Tradition, Beautifully Curated.')}</small>
          </span>
        </Link>
        <nav className="menu open" style={{ display: 'flex', alignItems: 'center' }}>
          <Link to="/">{t('home', 'Overview')}</Link>
          <Link to="/shop">{t('catalogue', 'Catalogue')}</Link>
          <Link to="/wishlist">{t('wishlist', 'Wishlist')}</Link>
          {isAuthenticated && <Link to="/orders" style={{ color: "var(--gold2)" }}>{t('myOrders', 'My Orders')}</Link>}
          {isAuthenticated && <Link to="/settings">{t('settings', 'Settings')}</Link>}
          <Link to={isAuthenticated ? '/account' : '/login'}>
            {isAuthenticated ? user?.name : t('signIn', 'Sign In')}
          </Link>
        </nav>
        <div className="tools" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Quick Language Toggle */}
          {isAuthenticated && (
            <Link to="/settings" title={t('settings', 'Settings')} style={{ color: 'var(--gold)', display: 'flex', alignItems: 'center' }}>
              <Settings size={18} />
            </Link>
          )}

          <button onClick={handleWishlistToggle} style={{ color: wishlisted ? '#f87171' : 'var(--gold)', background: 'none', border: 'none', cursor: 'pointer', padding: '6px' }} title={t('wishlist', 'Wishlist')}>
            <Heart size={20} fill={wishlisted ? '#f87171' : 'none'} />
          </button>
          <Link to="/cart" style={{ position: 'relative', background: 'transparent', border: 0, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center' }} title={t('bag', 'Bag')}>
            <ShoppingBag size={20} />
            <span id="cnt" style={{ marginLeft: '4px' }}>{cartCount}</span>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ flex: 1, maxWidth: '1360px', width: '100%', margin: '0 auto', padding: '32px 20px' }}>
        {/* Back Button & Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', marginBottom: '24px' }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(255,240,208,0.08)',
              border: '1px solid var(--line)',
              color: 'var(--gold2)',
              padding: '8px 18px',
              borderRadius: '999px',
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            title={t('adminBack', 'Go Back')}
          >
            <ArrowLeft size={16} /> {t('adminBack', 'Back')}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', opacity: 0.75 }}>
            <Link to="/" style={{ color: 'var(--gold)', textDecoration: 'none' }}>Home</Link>
            <ChevronRight size={14} />
            <Link to="/shop" style={{ color: 'var(--gold)', textDecoration: 'none' }}>Catalogue</Link>
            <ChevronRight size={14} />
            <Link to={`/category/${product.category?.slug || 'necklaces'}`} style={{ color: 'var(--gold)', textDecoration: 'none' }}>
              {product.category?.name || 'Jewellery'}
            </Link>
            <ChevronRight size={14} />
            <span style={{ color: 'var(--gold2)' }}>{product.name}</span>
          </div>
        </div>

        {/* Product Hero Grid (Left Gallery + Right Purchase Module) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '48px', alignItems: 'start', marginBottom: '60px' }}>
          {/* Left Column: Image Gallery with Interactive Hover Zoom */}
          <div style={{ display: 'flex', gap: '16px', position: 'sticky', top: '90px' }}>
            {/* Thumbnail Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {imagesList.map((im, idx) => {
                const isSelected = selectedImage === im;
                const isC = im && im.startsWith('var(');
                const thumbBg = isC ? im : im ? `url("${encodeURI(im)}")` : 'var(--i-neck)';

                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(im)}
                    style={{
                      width: '68px',
                      height: '68px',
                      borderRadius: '12px',
                      border: isSelected ? '2px solid var(--gold2)' : '1px solid var(--line)',
                      backgroundImage: thumbBg,
                      backgroundColor: '#24061d',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      cursor: 'pointer',
                      padding: 0,
                      opacity: isSelected ? 1 : 0.6,
                      transition: 'all 0.2s',
                      boxShadow: isSelected ? '0 0 12px rgba(212,175,55,0.4)' : 'none'
                    }}
                    aria-label={`Thumbnail ${idx + 1}`}
                  />
                );
              })}
            </div>

            {/* Main Image with Zoom Container */}
            <div style={{ flex: 1, position: 'relative' }}>
              <div
                style={{
                  width: '100%',
                  aspectRatio: '1',
                  borderRadius: '24px',
                  backgroundImage: bg,
                  backgroundColor: '#24061d',
                  backgroundSize: isZoomed ? '220%' : 'cover',
                  backgroundPosition: isZoomed ? `${zoomPos.x}% ${zoomPos.y}%` : 'center',
                  border: '1px solid var(--line)',
                  boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
                  cursor: 'crosshair',
                  transition: isZoomed ? 'none' : 'background-size 0.3s ease',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={() => setIsZoomed(true)}
                onMouseLeave={() => setIsZoomed(false)}
                onMouseMove={handleImageMouseMove}
                role="img"
                aria-label={product.name}
              >
                {/* Wishlist Top Right */}
                <button
                  onClick={handleWishlistToggle}
                  style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    background: 'rgba(20,2,16,0.7)',
                    border: '1px solid var(--line)',
                    color: wishlisted ? '#f87171' : 'var(--gold)',
                    display: 'grid',
                    placeItems: 'center',
                    cursor: 'pointer',
                    zIndex: 10
                  }}
                  title={wishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
                >
                  <Heart size={20} fill={wishlisted ? '#f87171' : 'none'} />
                </button>

                {/* Share Button */}
                <button
                  onClick={handleShare}
                  style={{
                    position: 'absolute',
                    top: '66px',
                    right: '16px',
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    background: 'rgba(20,2,16,0.7)',
                    border: '1px solid var(--line)',
                    color: 'var(--gold)',
                    display: 'grid',
                    placeItems: 'center',
                    cursor: 'pointer',
                    zIndex: 10
                  }}
                  title="Share this Piece"
                >
                  <Share2 size={18} />
                </button>

                {/* Badge */}
                {product.badge && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '16px',
                      left: '16px',
                      background: 'rgba(212,175,55,0.95)',
                      color: '#12020e',
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '4px 10px',
                      borderRadius: '999px',
                      letterSpacing: '0.04em'
                    }}
                  >
                    {product.badge}
                  </div>
                )}

                {/* Hover zoom tip overlay */}
                {!isZoomed && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '12px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: 'rgba(20,2,16,0.75)',
                      padding: '4px 12px',
                      borderRadius: '999px',
                      fontSize: '11px',
                      color: 'var(--cream)',
                      pointerEvents: 'none',
                      border: '1px solid var(--line)'
                    }}
                  >
                    🔍 Roll over image to zoom
                  </div>
                )}
              </div>

              {/* Multi-angle Views Gallery Directly Under Main Product Item */}
              {imagesList.length > 1 && (
                <div style={{ marginTop: '16px', background: 'rgba(255,240,208,0.04)', border: '1px solid var(--line)', borderRadius: '16px', padding: '14px 18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--gold2)', fontWeight: 600 }}>
                      ✦ Multiple Angles &amp; Views ({imagesList.length} Views)
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--cream)', opacity: 0.6 }}>Click thumbnail to switch preview</span>
                  </div>
                  <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '4px' }}>
                    {imagesList.map((im, idx) => {
                      const isSelected = selectedImage === im;
                      const isC = im && im.startsWith('var(');
                      const thumbBg = isC ? im : im ? `url(${im})` : 'var(--i-neck)';
                      return (
                        <button
                          key={idx}
                          onClick={() => setSelectedImage(im)}
                          style={{
                            flex: '0 0 72px',
                            width: '72px',
                            height: '72px',
                            borderRadius: '12px',
                            border: isSelected ? '2px solid var(--gold2)' : '1px solid var(--line)',
                            backgroundImage: thumbBg,
                            backgroundColor: '#24061d',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            cursor: 'pointer',
                            padding: 0,
                            opacity: isSelected ? 1 : 0.65,
                            transition: 'all 0.2s',
                            boxShadow: isSelected ? '0 0 16px rgba(212,175,55,0.45)' : 'none',
                            position: 'relative'
                          }}
                          title={`View angle ${idx + 1}`}
                        >
                          {isSelected && (
                            <span style={{ position: 'absolute', bottom: '2px', right: '4px', background: 'var(--gold2)', color: '#1a0418', borderRadius: '4px', fontSize: '9px', fontWeight: 'bold', padding: '1px 3px' }}>
                              Active
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Product Info & Purchase Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--gold)', fontWeight: 600 }}>
                  {product.category?.name || 'Temple Jewellery'}
                </span>
                <span style={{ opacity: 0.4 }}>•</span>
                <span style={{ fontSize: '11px', opacity: 0.7, color: 'var(--gold2)' }}>
                  SKU: {product.sku || 'TEE-0982'}
                </span>
              </div>

              <h1 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '38px', color: 'var(--gold2)', margin: '0 0 12px', lineHeight: 1.15 }}>
                {product.name}
              </h1>

              {/* Ratings and Reviews */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(34,197,94,0.18)', border: '1px solid rgba(34,197,94,0.4)', padding: '3px 10px', borderRadius: '6px', color: '#4ade80', fontSize: '13px', fontWeight: 700 }}>
                  <span>{product.rating || 4.9}</span>
                  <Star size={13} fill="#4ade80" />
                </div>
                <span style={{ fontSize: '13px', opacity: 0.8 }}>
                  <b>{product.reviews_count || 128}</b> Ratings &amp; <b>{reviews.length}</b> Verified Reviews
                </span>
                <span style={{ color: '#4ade80', fontSize: '12px', fontWeight: 600 }}>
                  ✓ Assured Authentic Imitation
                </span>
              </div>
            </div>

            {/* Price Box */}
            <div style={{ background: 'linear-gradient(160deg, #2e0824, #1c0316)', border: '1px solid var(--line)', borderRadius: '18px', padding: '18px 22px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '14px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '34px', fontWeight: 700, color: 'var(--gold2)' }}>
                  {inr(sellingPrice)}
                </span>
                {originalPrice > sellingPrice && (
                  <span style={{ fontSize: '18px', textDecoration: 'line-through', opacity: 0.5 }}>
                    {inr(originalPrice)}
                  </span>
                )}
                {discountPct > 0 && (
                  <span style={{ background: 'rgba(34,197,94,0.2)', border: '1px solid #22c55e', color: '#4ade80', padding: '2px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 600 }}>
                    {discountPct}% OFF
                  </span>
                )}
              </div>
              <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '4px' }}>
                Inclusive of all taxes · Free insured courier transit
              </div>

              {/* Stock status */}
              <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#4ade80', fontWeight: 500 }}>
                <CheckCircle2 size={16} /> In Stock · Only {product.stock || 8} pieces available for immediate dispatch
              </div>
            </div>

            {/* Available Flipkart-style Bank & Coupon Offers */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--gold2)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Available Offers &amp; Discounts
              </div>
              <div style={{ background: 'rgba(255,240,208,0.04)', border: '1px solid var(--line)', borderRadius: '12px', padding: '10px 14px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Tag size={15} style={{ color: 'var(--gold)' }} />
                <span><b>Special Price:</b> Get extra 10% off with coupon code <b style={{ color: 'var(--gold2)' }}>WELCOME10</b> at checkout.</span>
              </div>
              <div style={{ background: 'rgba(255,240,208,0.04)', border: '1px solid var(--line)', borderRadius: '12px', padding: '10px 14px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={15} style={{ color: 'var(--gold)' }} />
                <span><b>Heritage Privilege:</b> Complimentary velvet jewellery preservation pouch with every order.</span>
              </div>
            </div>

            {/* Quantity Selector & Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ fontSize: '13px', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Quantity:</span>
                <div style={{ display: 'inline-flex', alignItems: 'center', background: 'rgba(255,240,208,0.06)', border: '1px solid var(--line)', borderRadius: '10px' }}>
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    style={{ padding: '6px 14px', background: 'none', border: 'none', color: 'var(--gold)', fontSize: '16px', cursor: 'pointer' }}
                  >
                    −
                  </button>
                  <span style={{ padding: '0 10px', fontSize: '14px', fontWeight: 600 }}>{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(10, quantity + 1))}
                    style={{ padding: '6px 14px', background: 'none', border: 'none', color: 'var(--gold)', fontSize: '16px', cursor: 'pointer' }}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Main Action Buttons */}
              <div style={{ display: 'flex', gap: '14px' }}>
                <button
                  className="gbtn"
                  onClick={handleAddToCart}
                  style={{ flex: 1, justifyContent: 'center', padding: '14px', fontSize: '14px', fontWeight: 600 }}
                >
                  <ShoppingBag size={18} style={{ marginRight: '6px' }} /> {t('addToBag', 'Add to Bag')}
                </button>
                <button
                  onClick={handleBuyNow}
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    padding: '14px',
                    fontSize: '14px',
                    borderRadius: '999px',
                    border: '1px solid var(--gold2)',
                    background: 'linear-gradient(135deg, #d4af37, #996515)',
                    color: '#12020e',
                    fontFamily: 'var(--font-sans)',
                    fontWeight: 700,
                    cursor: 'pointer',
                    letterSpacing: '0.04em'
                  }}
                >
                  ⚡ {t('buyNow', 'Buy Now')}
                </button>
              </div>
            </div>

            {/* Pincode & Delivery Date Checker */}
            <div style={{ background: 'rgba(255,240,208,0.03)', border: '1px solid var(--line)', borderRadius: '16px', padding: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', fontSize: '13px', fontWeight: 600, color: 'var(--gold2)' }}>
                <Truck size={16} /> Delivery &amp; Services
              </div>
              <form onSubmit={handleCheckPincode} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="Enter 6-digit delivery PIN code"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                  style={{
                    flex: 1,
                    padding: '9px 14px',
                    borderRadius: '10px',
                    background: 'rgba(255,240,208,0.06)',
                    border: '1px solid var(--line)',
                    color: '#fff',
                    fontSize: '13px'
                  }}
                />
                <button type="submit" className="gbtn" style={{ padding: '9px 18px', fontSize: '13px' }}>
                  Check
                </button>
              </form>

              {deliveryResult && (
                <div style={{ fontSize: '12px', color: deliveryResult.success ? '#4ade80' : '#f87171', marginTop: '6px' }}>
                  {deliveryResult.message}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '14px', fontSize: '12px', opacity: 0.8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldCheck size={14} style={{ color: 'var(--gold)' }} />
                  <span>100% Certified Imitation</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <RefreshCw size={14} style={{ color: 'var(--gold)' }} />
                  <span>7-Day Return &amp; Exchange</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Specifications Table (Flipkart Style) */}
        <section style={{ marginBottom: '60px', background: 'linear-gradient(160deg, #27051e, #170213)', border: '1px solid var(--line)', borderRadius: '24px', padding: '36px' }}>
          <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '28px', color: 'var(--gold2)', margin: '0 0 20px', borderBottom: '1px solid var(--line)', paddingBottom: '12px' }}>
            Product Specifications
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            {[
              { label: 'Category', value: product.category?.name || 'Jewellery' },
              { label: 'Style / Collection', value: product.jewellery_type || 'Temple Imitation' },
              { label: 'Base Metal', value: product.material || '24k Antique Gold Plated over Cast Brass' },
              { label: 'Embellishments', value: product.stones || 'Synthetic Kemp Stones & Micro Pearls' },
              { label: 'Colour Palette', value: product.colour || 'Antique Gold & Ruby Red' },
              { label: 'Occasion', value: product.occasion || 'Bridal & Grand Festivities' },
              { label: 'Net Weight', value: product.weight || '82 grams approx.' },
              { label: 'Dimensions', value: product.dimensions || 'Standard Bridal Size' },
              { label: 'Closure Type', value: product.closure || 'Traditional Adjustable Dori' },
              { label: 'Care Instructions', value: product.care || 'Keep away from moisture & perfumes. Store in velvet pouch.' }
            ].map((spec, i) => (
              <div key={i} style={{ display: 'flex', borderBottom: '1px solid rgba(212,175,55,0.08)', paddingBottom: '10px' }}>
                <span style={{ width: '150px', fontSize: '13px', opacity: 0.65, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {spec.label}
                </span>
                <span style={{ flex: 1, fontSize: '13px', color: 'var(--cream)', fontWeight: 500 }}>
                  {spec.value}
                </span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid rgba(212,175,55,0.1)' }}>
            <h4 style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--gold2)', margin: '0 0 8px' }}>
              Artisan Description
            </h4>
            <p style={{ margin: 0, opacity: 0.8, fontSize: '14px', lineHeight: 1.7 }}>
              {product.description}
            </p>
          </div>
        </section>

        {/* Customer Ratings & Reviews Breakdown */}
        <section style={{ marginBottom: '60px', background: 'linear-gradient(160deg, #27051e, #170213)', border: '1px solid var(--line)', borderRadius: '24px', padding: '36px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '28px', borderBottom: '1px solid var(--line)', paddingBottom: '16px' }}>
            <div>
              <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '28px', color: 'var(--gold2)', margin: '0 0 4px' }}>
                Ratings &amp; Customer Reviews
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(34,197,94,0.18)', padding: '4px 10px', borderRadius: '6px', color: '#4ade80', fontWeight: 700 }}>
                  <span>{product.rating || 4.9}</span>
                  <Star size={13} fill="#4ade80" />
                </div>
                <span style={{ opacity: 0.8 }}>Based on {product.reviews_count || 128} verified purchases</span>
              </div>
            </div>

            <button
              onClick={() => {
                if (checkAuth()) setIsReviewModalOpen(true);
              }}
              className="gbtn"
              style={{ padding: '10px 20px', fontSize: '13px' }}
            >
              <MessageSquare size={14} style={{ marginRight: '6px' }} /> Rate Product
            </button>
          </div>

          {/* List of Reviews */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {reviews.map((rev) => (
              <div key={rev.id} style={{ borderBottom: '1px solid rgba(212,175,55,0.08)', paddingBottom: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '2px', background: 'rgba(34,197,94,0.15)', padding: '2px 6px', borderRadius: '4px', color: '#4ade80', fontSize: '11px', fontWeight: 600 }}>
                    <span>{rev.rating}</span>
                    <Star size={10} fill="#4ade80" />
                  </div>
                  <b style={{ fontSize: '14px', color: 'var(--gold2)' }}>{rev.title}</b>
                </div>
                <p style={{ margin: '0 0 8px', fontSize: '13px', opacity: 0.85, lineHeight: 1.5 }}>
                  {rev.comment}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', opacity: 0.6 }}>
                  <span>{rev.name}</span>
                  <span>•</span>
                  <span>{rev.date}</span>
                  {rev.verified && <span style={{ color: '#4ade80' }}>✓ Certified Buyer</span>}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Similar Masterpieces Rail */}
        <section style={{ marginBottom: '60px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <div className="kick" style={{ color: 'var(--gold2)', fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                Curated Suggestions
              </div>
              <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '30px', color: 'var(--gold2)', margin: 0 }}>
                Similar Pieces You May Admire
              </h2>
            </div>
            <Link to="/shop" style={{ color: 'var(--gold)', textDecoration: 'none', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              View All <ChevronRight size={14} />
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
            {similarProducts.map((p) => {
              const pImg = p.image_url;
              const isC = pImg && pImg.startsWith('var(');
              const pBg = isC ? pImg : `url(${pImg})`;
              const pr = parseFloat(p.selling_price || 0);

              return (
                <div
                  key={p.id}
                  onClick={() => navigate(`/product/${p.id}`)}
                  style={{
                    background: 'linear-gradient(160deg, #27051e, #170213)',
                    border: '1px solid var(--line)',
                    borderRadius: '18px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <div
                    style={{
                      width: '100%',
                      aspectRatio: '1',
                      backgroundImage: pBg,
                      backgroundColor: '#24061d',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  />
                  <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <small style={{ color: 'var(--gold)', fontSize: '11px', textTransform: 'uppercase' }}>{p.category?.name}</small>
                      <h4 style={{ margin: '4px 0 8px', fontSize: '15px', fontFamily: '"Cormorant Garamond", serif', color: 'var(--gold2)' }}>
                        {p.name}
                      </h4>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                      <span style={{ fontWeight: 600, color: 'var(--gold2)' }}>{inr(pr)}</span>
                      <span style={{ fontSize: '11px', color: 'var(--gold)' }}>View Details →</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Recently Viewed Products Rail */}
        {recentlyViewed.length > 1 && (
          <section style={{ marginBottom: '40px' }}>
            <div style={{ marginBottom: '16px' }}>
              <div className="kick" style={{ color: 'var(--gold2)', fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                Your Browsing History
              </div>
              <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '26px', color: 'var(--gold2)', margin: 0 }}>
                Recently Viewed Masterpieces
              </h2>
            </div>
            <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '12px' }}>
              {recentlyViewed
                .filter((rv) => rv.id !== product.id)
                .slice(0, 6)
                .map((rv, idx) => {
                  const img = rv.image_url;
                  const isC = img && img.startsWith('var(');
                  const bg = isC ? img : img ? `url("${encodeURI(img)}")` : 'var(--i-neck)';
                  return (
                    <div
                      key={idx}
                      onClick={() => navigate(`/product/${rv.id}`)}
                      style={{
                        minWidth: '180px',
                        background: 'linear-gradient(160deg, #27051e, #170213)',
                        border: '1px solid var(--line)',
                        borderRadius: '14px',
                        overflow: 'hidden',
                        cursor: 'pointer'
                      }}
                    >
                      <div
                        style={{
                          width: '100%',
                          height: '140px',
                          backgroundImage: bg,
                          backgroundColor: '#24061d',
                          backgroundSize: 'cover',
                          backgroundPosition: 'center'
                        }}
                      />
                      <div style={{ padding: '10px' }}>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--gold2)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {rv.name}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--cream)', opacity: 0.8, marginTop: '2px' }}>
                          {inr(rv.selling_price || rv.price || 0)}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </section>
        )}
      </main>

      {/* Review Modal */}
      {isReviewModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(0,0,0,0.7)', display: 'grid', placeItems: 'center', padding: '20px' }}>
          <div style={{ width: '100%', maxWidth: '500px', background: 'linear-gradient(160deg, #3a0b2d, #230419)', border: '1px solid var(--line)', borderRadius: '24px', padding: '32px', position: 'relative' }}>
            <button
              onClick={() => setIsReviewModalOpen(false)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>
            <h3 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '24px', color: 'var(--gold2)', margin: '0 0 16px' }}>
              Write a Patron Review
            </h3>
            <form onSubmit={handleAddReview} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--gold)', display: 'block', marginBottom: '6px' }}>
                  Your Rating
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setNewReview({ ...newReview, rating: star })}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                    >
                      <Star size={24} fill={star <= newReview.rating ? 'var(--gold)' : 'none'} color="var(--gold)" />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--gold)', display: 'block', marginBottom: '6px' }}>
                  Headline / Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Stunning South Indian Craftsmanship!"
                  value={newReview.title}
                  onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: 'rgba(255,240,208,0.06)', border: '1px solid var(--line)', color: '#fff', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--gold)', display: 'block', marginBottom: '6px' }}>
                  Review Details
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe the finish, weight, and wearing experience..."
                  value={newReview.comment}
                  onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: 'rgba(255,240,208,0.06)', border: '1px solid var(--line)', color: '#fff', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>
              <button type="submit" className="gbtn" style={{ justifyContent: 'center', padding: '12px', marginTop: '6px' }}>
                Submit Verified Review →
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Footer with Powered by Aminoid */}
      <footer style={{ marginTop: 'auto', borderTop: '1px solid var(--line)', padding: '24px', background: 'var(--panel)', fontSize: '13px' }}>
        <div style={{ maxWidth: '1360px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <span>© {new Date().getFullYear()} {storeName} · Handcrafted Imitation Jewellery.</span>
          <span>
            Powered by{' '}
            <a href="https://www.aminoid.in/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--gold2)', textDecoration: 'underline', fontWeight: 500 }}>
              Aminoid
            </a>
          </span>
          <div style={{ display: 'flex', gap: '16px' }}>
            <Link to="/shop" style={{ color: 'var(--gold)', textDecoration: 'none' }}>All Jewellery</Link>
            <Link to="/cart" style={{ color: 'var(--gold)', textDecoration: 'none' }}>Shopping Bag</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
