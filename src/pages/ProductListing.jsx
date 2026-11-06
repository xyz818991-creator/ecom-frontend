import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation, useParams } from 'react-router-dom';
import { productService, categoryService } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useStore } from '../context/StoreContext';
import ProductDetailModal from '../components/ProductDetailModal';
import {
  Search,
  SlidersHorizontal,
  ArrowLeft,
  ShoppingBag,
  Heart,
  Star,
  Eye,
  Grid,
  List,
  Filter,
  X,
  Check,
  ChevronDown,
  Sparkles,
  ShieldCheck,
  RotateCcw,
  Globe,
  Settings
} from 'lucide-react';
import '../EthnicEdit.css';

const inr = (n) => '₹' + Number(n).toLocaleString('en-IN');

export const IMITATION_CATEGORIES = [
  { id: 'all', name: 'All Pieces', slug: 'all' },
  { id: 'earrings', name: 'Earrings', slug: 'earrings' },
  { id: 'necklaces', name: 'Necklaces', slug: 'necklaces' },
  { id: 'necklace-sets', name: 'Necklace Sets', slug: 'necklace-sets' },
  { id: 'bangles', name: 'Bangles', slug: 'bangles' },
  { id: 'bracelets', name: 'Bracelets', slug: 'bracelets' },
  { id: 'rings', name: 'Rings', slug: 'rings' },
  { id: 'anklets', name: 'Anklets', slug: 'anklets' },
  { id: 'mangalsutra', name: 'Mangalsutra', slug: 'mangalsutra' },
  { id: 'bridal-jewellery', name: 'Bridal Jewellery', slug: 'bridal-jewellery' },
  { id: 'temple-jewellery', name: 'Temple Jewellery', slug: 'temple-jewellery' },
  { id: 'antique-jewellery', name: 'Antique Jewellery', slug: 'antique-jewellery' },
  { id: 'american-diamond', name: 'American Diamond Jewellery', slug: 'american-diamond' },
  { id: 'daily-wear', name: 'Daily Wear Jewellery', slug: 'daily-wear' },
  { id: 'festive-collections', name: 'Festive Collections', slug: 'festive-collections' }
];

export const CATALOGUE_PRODUCTS = [
  {
    id: 'neck',
    name: 'Temple Lakshmi Choker & Long Mala Set',
    category: { name: 'Necklaces', slug: 'necklaces' },
    selling_price: 48500,
    original_price: 54900,
    image_url: 'var(--i-neck)',
    rating: 4.9,
    reviews_count: 128,
    badge: '👑 Bestseller',
    jewellery_type: 'Temple Jewellery',
    material: '24k Antique Gold Plated',
    colour: 'Antique Gold',
    occasion: 'Bridal',
    in_stock: true,
    popularity: 98,
    is_new: false,
    description: 'This temple necklace is an ode to timeless South Indian bridal grandeur. Featuring an ornate central pendant of Goddess Lakshmi flanked by dancing peacocks.'
  },
  {
    id: 'ear',
    name: 'South Indian Antique Pearl Tiered Jhumkas',
    category: { name: 'Earrings', slug: 'earrings' },
    selling_price: 18900,
    original_price: 21500,
    image_url: 'var(--i-ear)',
    rating: 4.8,
    reviews_count: 94,
    badge: '✨ Trending',
    jewellery_type: 'Antique Jewellery',
    material: 'Cast Artisan Brass',
    colour: 'Basra Pearl White',
    occasion: 'Festive',
    in_stock: true,
    popularity: 92,
    is_new: false,
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
    badge: '⭐ Royal Heritage',
    jewellery_type: 'Temple Jewellery',
    material: '24k Antique Gold Plated',
    colour: 'Antique Gold',
    occasion: 'Bridal',
    in_stock: true,
    popularity: 95,
    is_new: true,
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
    badge: '🔥 Deal of Day',
    jewellery_type: 'Kundan & Polki',
    material: 'Copper-Brass Alloy',
    colour: 'Ruby Red & Polki White',
    occasion: 'Party & Cocktail',
    in_stock: true,
    popularity: 88,
    is_new: true,
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
    badge: '👑 Heirloom Bridal',
    jewellery_type: 'Temple Jewellery',
    material: '24k Antique Gold Plated',
    colour: 'Antique Gold',
    occasion: 'Bridal',
    in_stock: true,
    popularity: 99,
    is_new: false,
    description: 'An heirloom vaddanam waist belt crafted for the contemporary bride. The central panel depicts Goddess Lakshmi surrounded by miniature carved deities.'
  },
  {
    id: 'neck-set-1',
    name: 'Kundan Polki Bridal Choker Set with Matching Maang Tikka',
    category: { name: 'Necklace Sets', slug: 'necklace-sets' },
    selling_price: 42000,
    original_price: 48000,
    image_url: 'var(--i-neck)',
    rating: 4.9,
    reviews_count: 67,
    badge: '✨ Bridal Masterpiece',
    jewellery_type: 'Kundan & Polki',
    material: '24k Antique Gold Plated',
    colour: 'Ruby Red & Polki White',
    occasion: 'Bridal',
    in_stock: true,
    popularity: 94,
    is_new: true,
    description: 'Magnificent Kundan choker set paired with matching chandelier earrings and an ornate floral maang tikka.'
  },
  {
    id: 'ad-necklace',
    name: 'American Diamond Emerald Cut Solitaire Layered Necklace',
    category: { name: 'American Diamond Jewellery', slug: 'american-diamond' },
    selling_price: 24500,
    original_price: 29000,
    image_url: 'var(--i-neck)',
    rating: 4.8,
    reviews_count: 42,
    badge: '💎 CZ Sparkle',
    jewellery_type: 'American Diamond / CZ',
    material: 'Copper-Brass Alloy',
    colour: 'Emerald Green',
    occasion: 'Party & Cocktail',
    in_stock: true,
    popularity: 90,
    is_new: true,
    description: 'Glittering American Diamond cubic zirconia necklace featuring brilliant emerald-cut simulated stones in rhodium and gold plating.'
  },
  {
    id: 'mangalsutra-1',
    name: 'Traditional Woven Black Bead 24k Antique Gold Mangalsutra',
    category: { name: 'Mangalsutra', slug: 'mangalsutra' },
    selling_price: 16500,
    original_price: 19500,
    image_url: 'var(--i-neck)',
    rating: 4.9,
    reviews_count: 83,
    badge: '⭐ Sacred Vows',
    jewellery_type: 'Antique Jewellery',
    material: '24k Antique Gold Plated',
    colour: 'Antique Gold',
    occasion: 'Daily Wear',
    in_stock: true,
    popularity: 91,
    is_new: false,
    description: 'Hand-strung auspicious black beads interwoven with micro gold fluted beads, centred by an antique temple pendant.'
  },
  {
    id: 'bracelet-1',
    name: 'Nakshi Peacock Openable Cuff Bracelet',
    category: { name: 'Bracelets', slug: 'bracelets' },
    selling_price: 19800,
    original_price: 23000,
    image_url: 'var(--i-bang)',
    rating: 4.7,
    reviews_count: 38,
    badge: '✨ Artisan Crafted',
    jewellery_type: 'Antique Jewellery',
    material: 'Cast Artisan Brass',
    colour: 'Antique Gold',
    occasion: 'Festive',
    in_stock: true,
    popularity: 87,
    is_new: true,
    description: 'Intricately chased peacock heads facing a central cabochon gemstone with a side-hinge lock mechanism.'
  },
  {
    id: 'anklet-1',
    name: 'Ghungroo Antique Silver-Gold Dual Plated Bridal Payal',
    category: { name: 'Anklets', slug: 'anklets' },
    selling_price: 14200,
    original_price: 16800,
    image_url: 'var(--i-bang)',
    rating: 4.8,
    reviews_count: 51,
    badge: '🔔 Melodic Jingle',
    jewellery_type: 'Temple Jewellery',
    material: 'Copper-Brass Alloy',
    colour: 'Antique Gold',
    occasion: 'Bridal',
    in_stock: true,
    popularity: 89,
    is_new: false,
    description: 'Dual-toned antique payal with tinkling micro ghungroo bells and floral stamped motifs.'
  },
  {
    id: 'daily-studs',
    name: 'Micro Floral Daily Wear Kemp Ear Studs',
    category: { name: 'Daily Wear Jewellery', slug: 'daily-wear' },
    selling_price: 7800,
    original_price: 9200,
    image_url: 'var(--i-ear)',
    rating: 4.6,
    reviews_count: 64,
    badge: '🌸 Everyday Charm',
    jewellery_type: 'Antique Jewellery',
    material: 'Copper-Brass Alloy',
    colour: 'Ruby Red & Polki White',
    occasion: 'Daily Wear',
    in_stock: true,
    popularity: 85,
    is_new: false,
    description: 'Lightweight, everyday imitation ear studs featuring high-luster simulated rubies and durable screw-back posts.'
  },
  {
    id: 'festive-mala',
    name: 'Navratna Multi-Gemstone Grand Festive Haar',
    category: { name: 'Festive Collections', slug: 'festive-collections' },
    selling_price: 38500,
    original_price: 44000,
    image_url: 'var(--i-neck)',
    rating: 4.9,
    reviews_count: 59,
    badge: '✨ Festive Grandeur',
    jewellery_type: 'Temple Jewellery',
    material: '24k Antique Gold Plated',
    colour: 'Antique Gold',
    occasion: 'Festive',
    in_stock: true,
    popularity: 96,
    is_new: true,
    description: 'Celebratory nine-gemstone representation set in antique matte gold prongs, strung with pearl tassels.'
  }
];

export default function ProductListing() {
  const { addToCart, cartCount, toggleWishlist, isInWishlist, wishlistCount } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { lang, setLang, t, isTamil, translateCategory } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();

  // Core Data - strictly from Live Database
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(IMITATION_CATEGORIES);
  const { storeSettings, storeName } = useStore();

  // Filters State
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [priceBucket, setPriceBucket] = useState('all'); // all, under-15, 15-30, 30-50, above-50
  const [selectedJewelleryType, setSelectedJewelleryType] = useState('all');
  const [selectedMaterial, setSelectedMaterial] = useState('all');
  const [selectedColour, setSelectedColour] = useState('all');
  const [selectedOccasion, setSelectedOccasion] = useState('all');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [minRating, setMinRating] = useState(0); // 0, 3.5, 4.0, 4.5
  const [minDiscount, setMinDiscount] = useState(0); // 0, 10, 15, 20

  // UI States
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [sortBy, setSortBy] = useState('popularity'); // 'popularity', 'price-low', 'price-high', 'newest', 'rating', 'discount'
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2500);
  };

  // Sync category param from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const catQuery = urlParams.get('category') || params.categorySlug;
    const searchParam = urlParams.get('search');

    if (searchParam) {
      setSearchQuery(searchParam);
    }

    if (catQuery) {
      let normalized = catQuery.toLowerCase();
      if (normalized === 'neck') normalized = 'necklaces';
      if (normalized === 'ear') normalized = 'earrings';
      if (normalized === 'bang') normalized = 'bangles';
      if (normalized === 'ring') normalized = 'rings';
      if (normalized === 'belt' || normalized === 'waist-belts') normalized = 'bridal-jewellery';
      if (normalized === 'gifting') normalized = 'festive-collections';
      setSelectedCategory(normalized);
    }
  }, [location.search, params.categorySlug]);

  // Load from backend dynamically
  const loadData = useCallback(async () => {
    try {
      const [prodRes, catRes] = await Promise.allSettled([
        productService.getProducts(),
        categoryService.getCategories()
      ]);

      if (prodRes.status === 'fulfilled' && prodRes.value?.success && Array.isArray(prodRes.value.products)) {
        const dbProducts = prodRes.value.products.map((p) => ({
          ...p,
          selling_price: parseFloat(p.selling_price || p.price || 0),
          original_price: parseFloat(p.original_price || (p.selling_price || 0) * 1.15),
          image_url: p.images?.[0]?.image_url || p.image_url || 'var(--i-neck)',
          jewellery_type: p.jewellery_type || p.collection_type || 'Temple Jewellery',
          material: p.material || '24k Antique Gold Plated',
          colour: p.colour || 'Antique Gold',
          occasion: p.occasion || 'Bridal & Festive',
          in_stock: p.stock > 0,
          popularity: p.popularity || p.reviews_count || 90,
          rating: parseFloat(p.rating || 4.8),
          reviews_count: p.reviews_count || 65
        }));
        setProducts(dbProducts);
      }

      if (catRes.status === 'fulfilled' && catRes.value?.success && Array.isArray(catRes.value.categories) && catRes.value.categories.length > 0) {
        const dbCats = catRes.value.categories.map((c) => ({
          id: c.slug || c.id.toString(),
          name: c.name,
          slug: c.slug || c.id.toString(),
          img: c.image_url || 'var(--i-neck)',
          tag: 'Collection'
        }));
        setCategories(dbCats);
      }
    } catch (e) {
      console.warn('API fetch notice:', e.message);
    }
  }, []);

  useEffect(() => {
    loadData();

    window.addEventListener('products_updated', loadData);
    window.addEventListener('categories_updated', loadData);

    return () => {
      window.removeEventListener('products_updated', loadData);
      window.removeEventListener('categories_updated', loadData);
    };
  }, [loadData]);

  // Strict Navigation Rule: Redirect unauthenticated customers
  const handleProtectedAction = (product, action = 'view') => {
    if (!isAuthenticated) {
      showToast('Please sign in to view product details and start shopping.');
      setTimeout(() => navigate('/login'), 600);
      return;
    }

    if (action === 'wishlist') {
      toggleWishlist(product);
      showToast(isInWishlist(product.id) ? 'Removed from Wishlist' : 'Saved to Wishlist!');
    } else if (action === 'cart') {
      addToCart(product, 1);
      showToast(`${product.name} added to your bag`);
    } else if (action === 'quickview') {
      setSelectedProduct(product);
    } else {
      navigate(`/product/${product.id}`);
    }
  };

  const handleClearFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setPriceBucket('all');
    setSelectedJewelleryType('all');
    setSelectedMaterial('all');
    setSelectedColour('all');
    setSelectedOccasion('all');
    setInStockOnly(false);
    setMinRating(0);
    setMinDiscount(0);
    setSortBy('popularity');
  };

  // Filter Logic
  const filtered = products.filter((p) => {
    const catName = (p.category?.name || '').toLowerCase();
    const catSlug = (p.category?.slug || '').toLowerCase();
    const targetCat = selectedCategory.toLowerCase();

    // Strict Category Isolation: Each category shows ONLY its dedicated items
    const matchesCategory = (() => {
      if (targetCat === 'all' || !targetCat) return true;

      // Match by exact Category ID or exact Slug
      if (p.category_id?.toString() === targetCat) return true;
      if (catSlug === targetCat) return true;
      if (catName === targetCat) return true;

      // 1. Earrings Collection
      if (targetCat === 'earrings' || targetCat === 'ear') {
        return catSlug === 'earrings' || catName.includes('earring') || catName.includes('jhumka') || catName.includes('stud');
      }

      // 2. Rings Collection (MUST explicitly exclude earrings/jhumkas)
      if (targetCat === 'rings' || targetCat === 'ring') {
        const isEarring = catSlug === 'earrings' || catName.includes('earring') || catName.includes('jhumka') || catName.includes('stud');
        if (isEarring) return false;
        return catSlug === 'rings' || catName === 'rings' || catName.includes('finger ring') || catName.includes('cocktail ring');
      }

      // 3. Necklaces Collection (excludes necklace sets)
      if (targetCat === 'necklaces' || targetCat === 'neck') {
        return (catSlug === 'necklaces' || catName.includes('necklace') || catName.includes('choker') || catName.includes('mala')) && catSlug !== 'necklace-sets';
      }

      // 4. Necklace Sets Collection
      if (targetCat === 'necklace-sets') {
        return catSlug === 'necklace-sets' || catName.includes('necklace set');
      }

      // 5. Bangles Collection (excludes bracelets)
      if (targetCat === 'bangles' || targetCat === 'bang') {
        return (catSlug === 'bangles' || catName.includes('bangle') || catName.includes('valayal') || catName.includes('kada')) && catSlug !== 'bracelets';
      }

      // 6. Bracelets Collection
      if (targetCat === 'bracelets') {
        return catSlug === 'bracelets' || catName.includes('bracelet');
      }

      // 7. Anklets / Payal
      if (targetCat === 'anklets' || targetCat === 'payal') {
        return catSlug === 'anklets' || catName.includes('anklet') || catName.includes('payal');
      }

      // 8. Mangalsutra
      if (targetCat === 'mangalsutra') {
        return catSlug === 'mangalsutra' || catName.includes('mangalsutra');
      }

      // 9. Bridal Jewellery / Waist Belts / Vaddanam
      if (targetCat === 'bridal-jewellery' || targetCat === 'belt' || targetCat === 'waist-belts') {
        return catSlug === 'bridal-jewellery' || catName.includes('bridal') || catName.includes('vaddanam') || catName.includes('waist belt');
      }

      // 10. American Diamond / CZ
      if (targetCat.includes('american-diamond')) {
        return catSlug.includes('american-diamond') || catName.includes('diamond');
      }

      // 11. Temple Jewellery
      if (targetCat === 'temple-jewellery') {
        return catSlug === 'temple-jewellery' || catName.includes('temple');
      }

      // 12. Antique Jewellery
      if (targetCat === 'antique-jewellery') {
        return catSlug === 'antique-jewellery' || catName.includes('antique');
      }

      // 13. Daily Wear
      if (targetCat.includes('daily-wear')) {
        return catSlug.includes('daily-wear') || catName.includes('daily');
      }

      // 14. Festive / Gifting
      if (targetCat.includes('festive') || targetCat === 'gifting') {
        return catSlug.includes('festive') || catName.includes('festive') || catName.includes('chest');
      }

      return catSlug === targetCat || catName === targetCat;
    })();

    // Search Query
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      catName.includes(q) ||
      (p.material && p.material.toLowerCase().includes(q)) ||
      (p.jewellery_type && p.jewellery_type.toLowerCase().includes(q));

    // Price Bucket
    const price = parseFloat(p.selling_price || p.price || 0);
    let matchesPrice = true;
    if (priceBucket === 'under-15') matchesPrice = price < 15000;
    else if (priceBucket === '15-30') matchesPrice = price >= 15000 && price <= 30000;
    else if (priceBucket === '30-50') matchesPrice = price > 30000 && price <= 50000;
    else if (priceBucket === 'above-50') matchesPrice = price > 50000;

    // Jewellery Type
    const matchesType =
      selectedJewelleryType === 'all' ||
      (p.jewellery_type && p.jewellery_type.toLowerCase().includes(selectedJewelleryType.toLowerCase()));

    // Material
    const matchesMaterial =
      selectedMaterial === 'all' ||
      (p.material && p.material.toLowerCase().includes(selectedMaterial.toLowerCase()));

    // Colour
    const matchesColour =
      selectedColour === 'all' ||
      (p.colour && p.colour.toLowerCase().includes(selectedColour.toLowerCase()));

    // Occasion
    const matchesOccasion =
      selectedOccasion === 'all' ||
      (p.occasion && p.occasion.toLowerCase().includes(selectedOccasion.toLowerCase()));

    // Stock
    const matchesStock = !inStockOnly || p.in_stock !== false;

    // Rating
    const rating = parseFloat(p.rating || 4.5);
    const matchesRating = minRating === 0 || rating >= minRating;

    // Discount
    const origPrice = parseFloat(p.original_price || price * 1.15);
    const discountPct = origPrice > price ? Math.round(((origPrice - price) / origPrice) * 100) : 0;
    const matchesDiscount = minDiscount === 0 || discountPct >= minDiscount;

    return (
      matchesCategory &&
      matchesSearch &&
      matchesPrice &&
      matchesType &&
      matchesMaterial &&
      matchesColour &&
      matchesOccasion &&
      matchesStock &&
      matchesRating &&
      matchesDiscount
    );
  });

  // Sort Logic
  const sorted = [...filtered].sort((a, b) => {
    const pa = parseFloat(a.selling_price || a.price || 0);
    const pb = parseFloat(b.selling_price || b.price || 0);
    const ra = parseFloat(a.rating || 4.5);
    const rb = parseFloat(b.rating || 4.5);
    const da = a.original_price ? (a.original_price - pa) / a.original_price : 0;
    const db = b.original_price ? (b.original_price - pb) / b.original_price : 0;

    if (sortBy === 'price-low') return pa - pb;
    if (sortBy === 'price-high') return pb - pa;
    if (sortBy === 'rating') return rb - ra;
    if (sortBy === 'discount') return db - da;
    if (sortBy === 'newest') return (b.is_new ? 1 : 0) - (a.is_new ? 1 : 0);
    return (b.popularity || 90) - (a.popularity || 90);
  });

  const categoryName =
    categories.find((c) => c.slug === selectedCategory || c.id === selectedCategory)?.name ||
    (selectedCategory !== 'all' ? selectedCategory.replace('-', ' ') : 'All Pieces');

  // Count active filters
  const activeFiltersCount =
    (selectedCategory !== 'all' ? 1 : 0) +
    (priceBucket !== 'all' ? 1 : 0) +
    (selectedJewelleryType !== 'all' ? 1 : 0) +
    (selectedMaterial !== 'all' ? 1 : 0) +
    (selectedColour !== 'all' ? 1 : 0) +
    (selectedOccasion !== 'all' ? 1 : 0) +
    (inStockOnly ? 1 : 0) +
    (minRating > 0 ? 1 : 0) +
    (minDiscount > 0 ? 1 : 0) +
    (searchQuery.trim() ? 1 : 0);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)', color: 'var(--cream)' }}>
      {/* Toast Notification */}
      <div className={`tst ${toastMessage ? 'on' : ''}`} style={{ display: toastMessage ? 'block' : 'none' }}>
        {toastMessage}
      </div>

      {/* Header */}
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
          <span style={{ color: 'var(--gold2)', borderBottom: '2px solid var(--gold2)', paddingBottom: '4px' }}>
            {t('catalogue', 'Catalogue')}
          </span>
          <Link to="/wishlist">{t('wishlist', 'Wishlist')} ({wishlistCount})</Link>
          <Link to="/orders" style={{ whiteSpace: 'nowrap' }}>{t('myOrders', 'My Orders')}</Link>
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

          <Link to="/wishlist" style={{ color: 'var(--gold)', display: 'flex', alignItems: 'center' }} title={t('wishlist', 'Wishlist')}>
            <Heart size={20} />
            {wishlistCount > 0 && <span id="cnt" style={{ background: '#f87171' }}>{wishlistCount}</span>}
          </Link>
          <Link to="/cart" style={{ position: 'relative', background: 'transparent', border: 0, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center' }} title={t('bag', 'Bag')}>
            <ShoppingBag size={20} />
            <span id="cnt" style={{ marginLeft: '4px' }}>{cartCount}</span>
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ flex: 1, maxWidth: '1400px', width: '100%', margin: '0 auto', padding: '28px 20px' }}>
        {/* Breadcrumb & Title */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', opacity: 0.7, marginBottom: '8px' }}>
            <button onClick={() => navigate('/')} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(255,240,208,0.08)', border: '1px solid var(--line)', color: 'var(--gold2)', padding: '4px 12px', borderRadius: '999px', fontSize: '12px', cursor: 'pointer', marginRight: '8px' }}><ArrowLeft size={13} /> {t('adminBack', 'Back')}</button><Link to="/" style={{ color: 'var(--gold)', textDecoration: 'none' }}>{t('home', 'Home')}</Link>
            <span>/</span>
            <Link to="/shop" style={{ color: 'var(--gold)', textDecoration: 'none' }}>{t('catalogue', 'Catalogue')}</Link>
            <span>/</span>
            <span style={{ color: 'var(--gold2)' }}>{translateCategory(categoryName)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '36px', color: 'var(--gold2)', margin: '0 0 4px', textTransform: 'capitalize' }}>
                {translateCategory(categoryName)}
              </h1>
              <p style={{ margin: 0, opacity: 0.8, fontSize: '14px' }}>
                {isTamil ? `காட்டப்படும் நகைகள்: ${sorted.length} · பாரம்பரிய தரம்` : `Showing ${sorted.length} handcrafted pieces · Authentic Heritage Collection`}
              </p>
            </div>

            {/* Quick Action Buttons on Mobile */}
            <button
              onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
              className="gbtn"
              style={{ display: 'none', padding: '8px 16px', fontSize: '13px' }}
              id="filterToggleBtn"
            >
              <Filter size={14} /> {isTamil ? 'வடிகட்டிகள்' : 'Filters'} ({activeFiltersCount})
            </button>
          </div>
        </div>

        {/* Top Control Bar: Search + Sorting + Grid/List View */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '16px',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'linear-gradient(160deg, #320726, #200318)',
            border: '1px solid var(--line)',
            borderRadius: '16px',
            padding: '14px 18px',
            marginBottom: '24px'
          }}
        >
          {/* Live Search */}
          <div style={{ position: 'relative', minWidth: '240px', flex: '1 1 280px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gold)', opacity: 0.7 }} />
            <input
              type="text"
              placeholder={t('searchPlaceholder', 'Search necklace, earrings, kada, CZ, bridal...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 14px 9px 36px',
                borderRadius: '10px',
                background: 'rgba(255,240,208,0.06)',
                border: '1px solid var(--line)',
                color: '#fff',
                fontSize: '13px',
                boxSizing: 'border-box'
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#fff', opacity: 0.6, cursor: 'pointer' }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Controls Right: Sort by + Grid/List View Toggles */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            {/* Sorting Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <SlidersHorizontal size={14} style={{ color: 'var(--gold)' }} />
              <span style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.7 }}>
                {t('sortBy', 'Sort By')}:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  padding: '7px 12px',
                  borderRadius: '10px',
                  background: '#24061d',
                  border: '1px solid var(--line)',
                  color: 'var(--cream)',
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                <option value="popularity">{t('popularity', 'Popularity')}</option>
                <option value="price-low">{t('priceLowHigh', 'Price: Low to High')}</option>
                <option value="price-high">{t('priceHighLow', 'Price: High to Low')}</option>
                <option value="newest">{t('newestFirst', 'Newest First')}</option>
                <option value="rating">{t('customerRating', 'Customer Rating')}</option>
                <option value="discount">{t('specialDiscount', 'Special Discount %')}</option>
              </select>
            </div>

            {/* View Mode Toggle: Grid vs List */}
            <div style={{ display: 'flex', background: 'rgba(255,240,208,0.05)', border: '1px solid var(--line)', borderRadius: '10px', padding: '3px' }}>
              <button
                onClick={() => setViewMode('grid')}
                aria-label="Grid View"
                title="Grid View"
                style={{
                  background: viewMode === 'grid' ? 'var(--gold)' : 'transparent',
                  color: viewMode === 'grid' ? '#12020e' : 'var(--cream)',
                  border: 'none',
                  borderRadius: '7px',
                  padding: '6px 10px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'all 0.2s'
                }}
              >
                <Grid size={15} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                aria-label="List View"
                title="List View"
                style={{
                  background: viewMode === 'list' ? 'var(--gold)' : 'transparent',
                  color: viewMode === 'list' ? '#12020e' : 'var(--cream)',
                  border: 'none',
                  borderRadius: '7px',
                  padding: '6px 10px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'all 0.2s'
                }}
              >
                <List size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* Category Pill Horizontal Rail */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '24px', scrollbarWidth: 'none' }}>
          <button
            onClick={() => {
              setSelectedCategory('all');
              navigate('/shop', { replace: true });
            }}
            style={{
              padding: '7px 18px',
              borderRadius: '999px',
              whiteSpace: 'nowrap',
              border: selectedCategory === 'all' ? '1px solid var(--gold2)' : '1px solid var(--line)',
              background: selectedCategory === 'all' ? 'linear-gradient(135deg, rgba(212,175,55,0.3), rgba(66,8,51,0.6))' : 'rgba(255,240,208,0.04)',
              color: selectedCategory === 'all' ? 'var(--gold2)' : 'var(--cream)',
              fontSize: '12px',
              cursor: 'pointer',
              fontWeight: selectedCategory === 'all' ? 600 : 400,
              transition: 'all 0.2s'
            }}
          >
            {isTamil ? '✨ அனைத்து நகைகள்' : '✨ All Pieces'}
          </button>
          {categories
            .filter((c) => c.slug !== 'all' && c.id !== 'all')
            .map((c) => {
              const isSelected = selectedCategory === (c.slug || c.id);
              return (
                <button
                  key={c.id}
                  onClick={() => {
                    const targetSlug = c.slug || c.id;
                    setSelectedCategory(targetSlug);
                    navigate(`/category/${targetSlug}`, { replace: true });
                  }}
                  style={{
                    padding: '7px 16px',
                    borderRadius: '999px',
                    whiteSpace: 'nowrap',
                    border: isSelected ? '1px solid var(--gold2)' : '1px solid var(--line)',
                    background: isSelected ? 'linear-gradient(135deg, rgba(212,175,55,0.3), rgba(66,8,51,0.6))' : 'rgba(255,240,208,0.04)',
                    color: isSelected ? 'var(--gold2)' : 'var(--cream)',
                    fontSize: '12px',
                    cursor: 'pointer',
                    fontWeight: isSelected ? 600 : 400,
                    transition: 'all 0.2s'
                  }}
                >
                  {translateCategory(c.name)}
                </button>
              );
            })}
        </div>

        {/* Layout: Sidebar Filter + Product Content */}
        <div style={{ display: 'grid', gridTemplateColumns: '270px 1fr', gap: '28px', alignItems: 'start' }}>
          {/* Flipkart-Style Imitation Jewellery Filter Sidebar */}
          <aside
            style={{
              background: 'linear-gradient(160deg, #27051e, #170213)',
              border: '1px solid var(--line)',
              borderRadius: '20px',
              padding: '20px',
              position: 'sticky',
              top: '90px',
              maxHeight: 'calc(100vh - 110px)',
              overflowY: 'auto',
              boxShadow: '0 12px 32px rgba(0,0,0,0.4)'
            }}
          >
            {/* Filter Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '14px', borderBottom: '1px solid var(--line)', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Filter size={16} style={{ color: 'var(--gold)' }} />
                <span style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '18px', fontWeight: 600, color: 'var(--gold2)' }}>
                  {t('filters', 'Filters')}
                </span>
                {activeFiltersCount > 0 && (
                  <span style={{ background: 'var(--gold)', color: '#12020e', borderRadius: '50%', width: '18px', height: '18px', fontSize: '10px', display: 'grid', placeItems: 'center', fontWeight: 'bold' }}>
                    {activeFiltersCount}
                  </span>
                )}
              </div>
              {activeFiltersCount > 0 && (
                <button
                  onClick={handleClearFilters}
                  style={{ background: 'none', border: 'none', color: '#f87171', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'underline' }}
                >
                  <RotateCcw size={11} /> {t('clearAll', 'Clear All')}
                </button>
              )}
            </div>

            {/* Filter 1: Price Range */}
            <div style={{ marginBottom: '20px', borderBottom: '1px solid rgba(212,175,55,0.1)', paddingBottom: '16px' }}>
              <h4 style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--gold2)', margin: '0 0 10px' }}>
                {t('priceRange', 'Price Range')}
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
                {[
                  { id: 'all', label: t('allPrices', 'All Prices') },
                  { id: 'under-15', label: t('under15k', 'Under ₹15,000') },
                  { id: '15-30', label: t('from15kTo30k', '₹15,000 – ₹30,000') },
                  { id: '30-50', label: t('from30kTo50k', '₹30,000 – ₹50,000') },
                  { id: 'above-50', label: t('above50k', 'Above ₹50,000') }
                ].map((p) => (
                  <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="priceBucket"
                      checked={priceBucket === p.id}
                      onChange={() => setPriceBucket(p.id)}
                      style={{ accentColor: 'var(--gold)' }}
                    />
                    <span style={{ opacity: priceBucket === p.id ? 1 : 0.8, color: priceBucket === p.id ? 'var(--gold2)' : 'var(--cream)' }}>
                      {p.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Filter 2: Jewellery Style / Type */}
            <div style={{ marginBottom: '20px', borderBottom: '1px solid rgba(212,175,55,0.1)', paddingBottom: '16px' }}>
              <h4 style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--gold2)', margin: '0 0 10px' }}>
                {t('jewelleryStyle', 'Jewellery Style')}
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
                {[
                  { id: 'all', label: t('allStyles', 'All Styles') },
                  { id: 'Temple Jewellery', label: t('templeJewellery', 'Temple Jewellery') },
                  { id: 'Antique Jewellery', label: t('antiqueJewellery', 'Antique Jewellery') },
                  { id: 'American Diamond / CZ', label: t('americanDiamond', 'American Diamond / CZ') },
                  { id: 'Kundan & Polki', label: t('kundanPolki', 'Kundan & Polki') },
                  { id: 'Basra Pearl', label: t('basraPearl', 'Basra Pearl') }
                ].map((item) => (
                  <label key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="jewelleryType"
                      checked={selectedJewelleryType === item.id}
                      onChange={() => setSelectedJewelleryType(item.id)}
                      style={{ accentColor: 'var(--gold)' }}
                    />
                    <span style={{ opacity: selectedJewelleryType === item.id ? 1 : 0.8, color: selectedJewelleryType === item.id ? 'var(--gold2)' : 'var(--cream)' }}>
                      {item.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Filter 3: Material */}
            <div style={{ marginBottom: '20px', borderBottom: '1px solid rgba(212,175,55,0.1)', paddingBottom: '16px' }}>
              <h4 style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--gold2)', margin: '0 0 10px' }}>
                {isTamil ? 'உலோகம்' : 'Base Material'}
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
                {[
                  { id: 'all', label: isTamil ? 'அனைத்து உலோகங்களும்' : 'All Materials' },
                  { id: '24k Antique Gold Plated', label: isTamil ? '24k ஆண்டிக் தங்க பூச்சு' : '24k Antique Gold Plated' },
                  { id: 'Cast Artisan Brass', label: isTamil ? 'பாரம்பரிய பித்தளை' : 'Cast Artisan Brass' },
                  { id: 'Copper-Brass Alloy', label: isTamil ? 'செம்பு-பித்தளை கலவை' : 'Copper-Brass Alloy' }
                ].map((mat) => (
                  <label key={mat.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="material"
                      checked={selectedMaterial === mat.id}
                      onChange={() => setSelectedMaterial(mat.id)}
                      style={{ accentColor: 'var(--gold)' }}
                    />
                    <span style={{ opacity: selectedMaterial === mat.id ? 1 : 0.8, color: selectedMaterial === mat.id ? 'var(--gold2)' : 'var(--cream)' }}>
                      {mat.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Filter 4: Occasion */}
            <div style={{ marginBottom: '20px', borderBottom: '1px solid rgba(212,175,55,0.1)', paddingBottom: '16px' }}>
              <h4 style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--gold2)', margin: '0 0 10px' }}>
                {isTamil ? 'நிகழ்வு / பயன்பாடு' : 'Occasion'}
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
                {[
                  { id: 'all', label: isTamil ? 'அனைத்து நிகழ்வுகளும்' : 'All Occasions' },
                  { id: 'Bridal', label: isTamil ? 'திருமணம் / முகூர்த்தம்' : 'Bridal' },
                  { id: 'Festive', label: isTamil ? 'பண்டிகை கொண்டாட்டம்' : 'Festive' },
                  { id: 'Party & Cocktail', label: isTamil ? 'வரவேற்பு & விருந்து' : 'Party & Cocktail' },
                  { id: 'Daily Wear', label: isTamil ? 'தினசரி பயன்பாடு' : 'Daily Wear' }
                ].map((occ) => (
                  <label key={occ.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="occasion"
                      checked={selectedOccasion === occ.id}
                      onChange={() => setSelectedOccasion(occ.id)}
                      style={{ accentColor: 'var(--gold)' }}
                    />
                    <span style={{ opacity: selectedOccasion === occ.id ? 1 : 0.8, color: selectedOccasion === occ.id ? 'var(--gold2)' : 'var(--cream)' }}>
                      {occ.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Filter 5: Minimum Customer Rating */}
            <div style={{ marginBottom: '20px', borderBottom: '1px solid rgba(212,175,55,0.1)', paddingBottom: '16px' }}>
              <h4 style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--gold2)', margin: '0 0 10px' }}>
                {isTamil ? 'வாடிக்கையாளர் மதிப்பீடு' : 'Customer Rating'}
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
                {[
                  { val: 0, label: isTamil ? 'அனைத்து மதிப்பீடுகளும்' : 'All Ratings' },
                  { val: 4.5, label: isTamil ? '4.5★ & அதற்கு மேல்' : '4.5★ & Above' },
                  { val: 4.0, label: isTamil ? '4.0★ & அதற்கு மேல்' : '4.0★ & Above' },
                  { val: 3.5, label: isTamil ? '3.5★ & அதற்கு மேல்' : '3.5★ & Above' }
                ].map((r) => (
                  <label key={r.val} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="minRating"
                      checked={minRating === r.val}
                      onChange={() => setMinRating(r.val)}
                      style={{ accentColor: 'var(--gold)' }}
                    />
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', opacity: minRating === r.val ? 1 : 0.8, color: minRating === r.val ? 'var(--gold2)' : 'var(--cream)' }}>
                      {r.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Filter 6: Stock & Availability */}
            <div>
              <h4 style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--gold2)', margin: '0 0 10px' }}>
                {isTamil ? 'இருப்பு நிலை' : 'Availability'}
              </h4>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  style={{ accentColor: 'var(--gold)' }}
                />
                <span>{isTamil ? 'இருப்பில் உள்ளவை மட்டும்' : 'Exclude Out of Stock'}</span>
              </label>
            </div>
          </aside>

          {/* Product Cards Container: GRID or LIST view */}
          <div>
            {sorted.length === 0 ? (
              <div
                style={{
                  background: 'linear-gradient(160deg, #27051e, #170213)',
                  border: '1px solid var(--line)',
                  borderRadius: '20px',
                  padding: '60px 24px',
                  textAlign: 'center'
                }}
              >
                <Filter size={48} style={{ color: 'var(--gold)', opacity: 0.4, marginBottom: '16px' }} />
                <h3 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '24px', color: 'var(--gold2)', margin: '0 0 8px' }}>
                  No Pieces Match Your Selected Filters
                </h3>
                <p style={{ opacity: 0.75, maxWidth: '400px', margin: '0 auto 24px', fontSize: '14px' }}>
                  Try resetting your price range, material, or style filters to explore our full collection.
                </p>
                <button onClick={handleClearFilters} className="gbtn">
                  Reset All Filters
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              /* GRID VIEW: 4 CARDS PER ROW, CONTAINED BORDER-BOX IMAGES, ALIGNED BUTTONS */
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
                  gap: '16px',
                  minHeight: '300px'
                }}
                className="catalogue-grid"
              >
                {sorted.map((p) => {
                  const img = p.image_url || p.images?.[0]?.image_url;
                  const isCss = img && img.startsWith('var(');
                  const bg = isCss ? img : img ? `url("${encodeURI(img)}")` : 'var(--i-neck)';
                  const price = parseFloat(p.selling_price || p.price || 0);
                  const originalPrice = parseFloat(p.original_price || price * 1.15);
                  const discountPct = originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
                  const wishlisted = isInWishlist(p.id);

                  return (
                    <article
                      key={p.id}
                      onClick={() => handleProtectedAction(p, 'view')}
                      style={{
                        boxSizing: 'border-box',
                        background: 'linear-gradient(160deg, #27051e, #170213)',
                        border: '1px solid var(--line)',
                        borderRadius: '16px',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        position: 'relative',
                        transition: 'transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.borderColor = 'var(--gold)';
                        e.currentTarget.style.boxShadow = '0 12px 28px rgba(0,0,0,0.5)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'none';
                        e.currentTarget.style.borderColor = 'var(--line)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      {/* Heart Wishlist Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleProtectedAction(p, 'wishlist');
                        }}
                        style={{
                          position: 'absolute',
                          top: '10px',
                          right: '10px',
                          zIndex: 2,
                          background: 'rgba(20,2,16,0.75)',
                          border: '1px solid var(--line)',
                          borderRadius: '50%',
                          width: '32px',
                          height: '32px',
                          display: 'grid',
                          placeItems: 'center',
                          cursor: 'pointer',
                          color: wishlisted ? '#f87171' : 'var(--gold)'
                        }}
                        title={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
                      >
                        <Heart size={15} fill={wishlisted ? '#f87171' : 'none'} />
                      </button>

                      {/* Badge if available */}
                      {p.badge && (
                        <div
                          style={{
                            position: 'absolute',
                            top: '10px',
                            left: '10px',
                            zIndex: 2,
                            background: 'rgba(212,175,55,0.92)',
                            color: '#12020e',
                            fontSize: '9.5px',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: '999px',
                            letterSpacing: '0.04em'
                          }}
                        >
                          {p.badge}
                        </div>
                      )}

                      {/* Contained Image Box */}
                      <div
                        style={{
                          width: '100%',
                          height: '190px',
                          overflow: 'hidden',
                          backgroundColor: '#24061d',
                          position: 'relative'
                        }}
                      >
                        <div
                          style={{
                            width: '100%',
                            height: '100%',
                            backgroundImage: bg,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            transition: 'transform 0.5s ease'
                          }}
                          role="img"
                          aria-label={p.name}
                        />
                      </div>

                      {/* Card Content with border box padding */}
                      <div
                        style={{
                          padding: '12px 14px 14px',
                          display: 'flex',
                          flexDirection: 'column',
                          flex: 1,
                          justifyContent: 'space-between',
                          boxSizing: 'border-box'
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                            <span style={{ fontSize: '10.5px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 700 }}>
                              {p.category?.name || 'Imitation'}
                            </span>
                            <span style={{ fontSize: '10px', opacity: 0.6, color: 'var(--cream)' }}>
                              {p.material?.split(' ')[0] || 'Brass'}
                            </span>
                          </div>

                          <h3
                            style={{
                              fontFamily: 'var(--font-serif)',
                              fontWeight: 500,
                              fontSize: '15px',
                              lineHeight: 1.3,
                              color: 'var(--cream)',
                              margin: '0 0 6px',
                              minHeight: '38px',
                              overflow: 'hidden',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical'
                            }}
                          >
                            {p.name}
                          </h3>

                          {/* Rating row */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--gold)', marginBottom: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '2px', background: 'rgba(34,197,94,0.15)', padding: '2px 5px', borderRadius: '4px', color: '#4ade80', fontWeight: 600 }}>
                              <span>{p.rating || 4.9}</span>
                              <Star size={10} fill="#4ade80" />
                            </div>
                            <span style={{ opacity: 0.6 }}>({p.reviews_count || 50}+)</span>
                          </div>
                        </div>

                        <div>
                          {/* Price Row */}
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '10px' }}>
                            <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--gold2)' }}>
                              {inr(price)}
                            </span>
                            {originalPrice > price && (
                              <span style={{ fontSize: '11px', textDecoration: 'line-through', opacity: 0.5 }}>
                                {inr(originalPrice)}
                              </span>
                            )}
                            {discountPct > 0 && (
                              <span style={{ fontSize: '10.5px', color: '#4ade80', fontWeight: 600, marginLeft: 'auto' }}>
                                Save {discountPct}%
                              </span>
                            )}
                          </div>

                          {/* Full-width, Aligned Add to Bag Button (BUG-001 Fixed) */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleProtectedAction(p, 'cart');
                            }}
                            style={{
                              width: '100%',
                              padding: '9px 12px',
                              borderRadius: '999px',
                              background: 'rgba(212,175,55,0.12)',
                              border: '1px solid var(--gold)',
                              color: 'var(--gold2)',
                              fontWeight: 600,
                              fontSize: '12px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px',
                              transition: 'all 0.25s ease',
                              whiteSpace: 'nowrap'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'var(--gold)';
                              e.currentTarget.style.color = '#12020e';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'rgba(212,175,55,0.12)';
                              e.currentTarget.style.color = 'var(--gold2)';
                            }}
                          >
                            <ShoppingBag size={13} />
                            <span>Add to Bag</span>
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              /* LIST VIEW (Flipkart Style Wide Cards) */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {sorted.map((p) => {
                  const img = p.image_url || p.images?.[0]?.image_url;
                  const isCss = img && img.startsWith('var(');
                  const bg = isCss ? img : img ? `url("${encodeURI(img)}")` : 'var(--i-neck)';
                  const price = parseFloat(p.selling_price || p.price || 0);
                  const originalPrice = parseFloat(p.original_price || price * 1.15);
                  const discountPct = originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
                  const wishlisted = isInWishlist(p.id);

                  return (
                    <div
                      key={p.id}
                      onClick={() => handleProtectedAction(p, 'view')}
                      style={{
                        background: 'linear-gradient(160deg, #27051e, #170213)',
                        border: '1px solid var(--line)',
                        borderRadius: '20px',
                        padding: '20px',
                        display: 'grid',
                        gridTemplateColumns: '180px 1fr 200px',
                        gap: '24px',
                        alignItems: 'center',
                        cursor: 'pointer',
                        position: 'relative',
                        transition: 'transform 0.2s, border-color 0.2s'
                      }}
                    >
                      {/* Thumbnail */}
                      <div
                        style={{
                          width: '100%',
                          height: '180px',
                          borderRadius: '14px',
                          backgroundImage: bg,
                          backgroundColor: '#24061d',
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          border: '1px solid var(--line)',
                          position: 'relative'
                        }}
                      >
                        {p.badge && (
                          <div
                            style={{
                              position: 'absolute',
                              top: '8px',
                              left: '8px',
                              background: 'rgba(212,175,55,0.92)',
                              color: '#12020e',
                              fontSize: '9px',
                              fontWeight: 700,
                              padding: '2px 6px',
                              borderRadius: '999px'
                            }}
                          >
                            {p.badge}
                          </div>
                        )}
                      </div>

                      {/* Middle Details */}
                      <div>
                        <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--gold)', marginBottom: '4px' }}>
                          {p.category?.name || 'Jewellery'} · {p.jewellery_type || 'Temple Imitation'}
                        </div>
                        <h3 style={{ margin: '0 0 8px', fontSize: '20px', fontFamily: '"Cormorant Garamond", serif', color: 'var(--gold2)' }}>
                          {p.name}
                        </h3>

                        {/* Rating */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '3px', background: 'rgba(34,197,94,0.15)', padding: '2px 8px', borderRadius: '4px', color: '#4ade80', fontSize: '12px', fontWeight: 600 }}>
                            <span>{p.rating || 4.9}</span>
                            <Star size={11} fill="#4ade80" />
                          </div>
                          <span style={{ fontSize: '12px', opacity: 0.6 }}>({p.reviews_count || 85} Customer Reviews)</span>
                        </div>

                        {/* Key Specs */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '12px', opacity: 0.85, marginBottom: '8px' }}>
                          <span><b>Material:</b> {p.material || '24k Antique Gold Plated'}</span>
                          <span>•</span>
                          <span><b>Colour:</b> {p.colour || 'Antique Gold'}</span>
                          <span>•</span>
                          <span><b>Occasion:</b> {p.occasion || 'Bridal & Festive'}</span>
                        </div>

                        <p style={{ margin: 0, fontSize: '13px', opacity: 0.7, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {p.description}
                        </p>
                      </div>

                      {/* Right Price & Actions */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center', borderLeft: '1px solid rgba(212,175,55,0.1)', paddingLeft: '20px', height: '100%' }}>
                        <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--gold2)' }}>
                          {inr(price)}
                        </div>
                        {originalPrice > price && (
                          <div style={{ fontSize: '13px', textDecoration: 'line-through', opacity: 0.5, margin: '2px 0 4px' }}>
                            {inr(originalPrice)}
                          </div>
                        )}
                        {discountPct > 0 && (
                          <div style={{ fontSize: '11px', color: '#4ade80', fontWeight: 600, marginBottom: '14px' }}>
                            Save {discountPct}% off
                          </div>
                        )}

                        <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleProtectedAction(p, 'wishlist');
                            }}
                            style={{
                              background: 'rgba(255,240,208,0.06)',
                              border: '1px solid var(--line)',
                              borderRadius: '10px',
                              padding: '10px',
                              cursor: 'pointer',
                              color: wishlisted ? '#f87171' : 'var(--gold)',
                              display: 'grid',
                              placeItems: 'center'
                            }}
                            title="Wishlist"
                          >
                            <Heart size={16} fill={wishlisted ? '#f87171' : 'none'} />
                          </button>
                          <button
                            className="gbtn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleProtectedAction(p, 'cart');
                            }}
                            style={{ flex: 1, justifyContent: 'center', padding: '10px 14px', fontSize: '12px' }}
                          >
                            Add to Bag
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal Quick View */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onShowToast={showToast}
        />
      )}

      {/* Footer with Powered by Aminoid */}
      <footer style={{ marginTop: 'auto', borderTop: '1px solid var(--line)', padding: '24px', background: 'var(--panel)', fontSize: '13px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <span>© {new Date().getFullYear()} {storeName} · Luxury Imitation Jewellery.</span>
          <span>
            Powered by{' '}
            <a href="https://www.aminoid.in/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--gold2)', textDecoration: 'underline', fontWeight: 500 }}>
              Aminoid
            </a>
          </span>
          <div style={{ display: 'flex', gap: '16px' }}>
            <Link to="/wishlist" style={{ color: 'var(--gold)', textDecoration: 'none' }}>Wishlist</Link>
            <Link to="/cart" style={{ color: 'var(--gold)', textDecoration: 'none' }}>Cart</Link>
            
          </div>
        </div>
      </footer>
    </div>
  );
}

