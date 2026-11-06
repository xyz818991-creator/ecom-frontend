import React, { createContext, useContext, useState, useEffect } from 'react';
import { couponService } from '../services/api';

const CartContext = createContext();

const DEFAULT_ADDRESSES = [
  {
    id: 'addr_1',
    name: 'Nivetha Priyadharshini',
    phone: '9876543210',
    flat: 'No. 42, Heritage Enclave',
    street: 'T. Nagar, Usman Road',
    landmark: 'Near Panagal Park',
    city: 'Chennai',
    state: 'Tamil Nadu',
    pincode: '600017',
    type: 'Home',
    isDefault: true
  }
];

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const stored = localStorage.getItem('tee_cart');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  });

  const [wishlistItems, setWishlistItems] = useState(() => {
    try {
      const stored = localStorage.getItem('tee_wishlist');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  });

  const [recentlyViewed, setRecentlyViewed] = useState(() => {
    try {
      const stored = localStorage.getItem('tee_recently_viewed');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  });

  const [savedAddresses, setSavedAddresses] = useState(() => {
    try {
      const stored = localStorage.getItem('tee_saved_addresses');
      return stored ? JSON.parse(stored) : DEFAULT_ADDRESSES;
    } catch (e) {
      return DEFAULT_ADDRESSES;
    }
  });

  const [selectedAddress, setSelectedAddress] = useState(() => {
    try {
      const stored = localStorage.getItem('tee_selected_address');
      if (stored) return JSON.parse(stored);
      return DEFAULT_ADDRESSES[0];
    } catch (e) {
      return DEFAULT_ADDRESSES[0];
    }
  });

  const [appliedCoupon, setAppliedCoupon] = useState(() => {
    try {
      const stored = localStorage.getItem('tee_applied_coupon');
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  // Sync with localStorage
  useEffect(() => {
    localStorage.setItem('tee_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem('tee_wishlist', JSON.stringify(wishlistItems));
  }, [wishlistItems]);

  useEffect(() => {
    localStorage.setItem('tee_recently_viewed', JSON.stringify(recentlyViewed));
  }, [recentlyViewed]);

  useEffect(() => {
    localStorage.setItem('tee_saved_addresses', JSON.stringify(savedAddresses));
  }, [savedAddresses]);

  useEffect(() => {
    if (selectedAddress) {
      localStorage.setItem('tee_selected_address', JSON.stringify(selectedAddress));
    }
  }, [selectedAddress]);

  useEffect(() => {
    if (appliedCoupon) {
      localStorage.setItem('tee_applied_coupon', JSON.stringify(appliedCoupon));
    } else {
      localStorage.removeItem('tee_applied_coupon');
    }
  }, [appliedCoupon]);

  const addToCart = (product, quantity = 1, variant = null) => {
    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.id === product.id && item.variant?.id === variant?.id
      );

      let imageUrl = product.image_url;
      if (!imageUrl && product.images && product.images.length > 0) {
        imageUrl = product.images[0].image_url;
      }
      if (!imageUrl && product.i) {
        imageUrl = product.i;
      }

      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex].quantity += quantity;
        return next;
      }

      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          category: product.category?.name || product.c || 'Jewellery',
          price: parseFloat(product.selling_price || product.price || product.p || 0),
          original_price: parseFloat(product.original_price || product.selling_price || product.price || product.p || 0),
          image_url: imageUrl || 'var(--i-neck)',
          quantity,
          variant,
          stock: product.stock !== undefined ? product.stock : 99
        }
      ];
    });
  };

  const updateQuantity = (id, delta) => {
    setCartItems((prev) => {
      return prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean);
    });
  };

  const removeFromCart = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setCartItems([]);
    setAppliedCoupon(null);
  };

  // Wishlist actions
  const toggleWishlist = (product) => {
    setWishlistItems((prev) => {
      const exists = prev.some((item) => item.id === product.id);
      if (exists) {
        return prev.filter((item) => item.id !== product.id);
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          category: product.category?.name || product.c || 'Jewellery',
          price: parseFloat(product.selling_price || product.price || product.p || 0),
          original_price: parseFloat(product.original_price || product.selling_price || product.price || 0),
          image_url: product.image_url || product.images?.[0]?.image_url || product.i || 'var(--i-neck)',
          stock: product.stock !== undefined ? product.stock : 15
        }
      ];
    });
  };

  const isInWishlist = (productId) => {
    return wishlistItems.some((item) => item.id === productId);
  };

  const removeFromWishlist = (productId) => {
    setWishlistItems((prev) => prev.filter((item) => item.id !== productId));
  };

  const moveWishlistToCart = (product) => {
    addToCart(product, 1);
    removeFromWishlist(product.id);
  };

  // Recently Viewed
  const addRecentlyViewed = (product) => {
    if (!product || !product.id) return;
    setRecentlyViewed((prev) => {
      const filtered = prev.filter((p) => p.id !== product.id);
      return [
        {
          id: product.id,
          name: product.name,
          category: product.category?.name || product.c || 'Jewellery',
          price: parseFloat(product.selling_price || product.price || product.p || 0),
          original_price: parseFloat(product.original_price || product.selling_price || product.price || 0),
          image_url: product.image_url || product.images?.[0]?.image_url || product.i || 'var(--i-neck)',
          rating: product.rating || 4.9,
          reviews_count: product.reviews_count || 85
        },
        ...filtered
      ].slice(0, 10);
    });
  };

  // Saved Addresses
  const addSavedAddress = (addr) => {
    const newId = 'addr_' + Date.now();
    const created = { ...addr, id: newId, isDefault: savedAddresses.length === 0 };
    setSavedAddresses((prev) => [created, ...prev]);
    setSelectedAddress(created);
    return created;
  };

  const removeSavedAddress = (id) => {
    setSavedAddresses((prev) => {
      const remaining = prev.filter((a) => a.id !== id);
      if (selectedAddress?.id === id) {
        setSelectedAddress(remaining[0] || null);
      }
      return remaining;
    });
  };

  const applyCouponCode = async (code) => {
    const cleanCode = code.trim().toUpperCase();
    if (cleanCode === 'WELCOME10') {
      const discountVal = Math.round(cartSubtotal * 0.1);
      const couponObj = { code: cleanCode, discount: discountVal, message: '10% Welcome Discount applied!' };
      setAppliedCoupon(couponObj);
      return { success: true, message: couponObj.message, discount: discountVal };
    }
    if (cleanCode === 'ETHNIC20') {
      const discountVal = Math.round(cartSubtotal * 0.2);
      const couponObj = { code: cleanCode, discount: discountVal, message: '20% Royal Festive Discount applied!' };
      setAppliedCoupon(couponObj);
      return { success: true, message: couponObj.message, discount: discountVal };
    }

    try {
      const res = await couponService.applyCoupon({ code: cleanCode, subtotal: cartSubtotal });
      if (res.success && res.coupon) {
        setAppliedCoupon(res.coupon);
        return { success: true, message: res.message, discount: res.coupon.discount };
      }
      return { success: false, message: res.message || 'Invalid coupon' };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to apply coupon';
      return { success: false, message: msg };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const discount = appliedCoupon ? appliedCoupon.discount || 0 : 0;
  const cartTotal = Math.max(0, cartSubtotal - discount);
  const wishlistCount = wishlistItems.length;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        cartSubtotal,
        discount,
        cartTotal,
        appliedCoupon,
        wishlistItems,
        wishlistCount,
        recentlyViewed,
        savedAddresses,
        selectedAddress,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        toggleWishlist,
        isInWishlist,
        removeFromWishlist,
        moveWishlistToCart,
        addRecentlyViewed,
        addSavedAddress,
        removeSavedAddress,
        setSelectedAddress,
        applyCouponCode,
        removeCoupon
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
