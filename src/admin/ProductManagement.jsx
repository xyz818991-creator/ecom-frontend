import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { productService, categoryService, adminService } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

const inr = (n) => '₹' + Number(n).toLocaleString('en-IN');

export const ALL_COLLECTIONS = [
  { id: 1, name: 'Earrings', slug: 'earrings' },
  { id: 2, name: 'Necklaces', slug: 'necklaces' },
  { id: 3, name: 'Necklace Sets', slug: 'necklace-sets' },
  { id: 4, name: 'Bangles', slug: 'bangles' },
  { id: 5, name: 'Bracelets', slug: 'bracelets' },
  { id: 6, name: 'Rings', slug: 'rings' },
  { id: 7, name: 'Anklets', slug: 'anklets' },
  { id: 8, name: 'Mangalsutra', slug: 'mangalsutra' },
  { id: 9, name: 'Bridal Jewellery', slug: 'bridal-jewellery' },
  { id: 10, name: 'Temple Jewellery', slug: 'temple-jewellery' },
  { id: 11, name: 'Antique Jewellery', slug: 'antique-jewellery' },
  { id: 12, name: 'American Diamond Jewellery', slug: 'american-diamond-jewellery' },
  { id: 13, name: 'Daily Wear Jewellery', slug: 'daily-wear-jewellery' },
  { id: 14, name: 'Festive Collections', slug: 'festive-collections' }
];

export default function ProductManagement({ initialCategory = '', onClearCategory, onBack }) {
  const { t, isTamil, translateCategory } = useLanguage();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(ALL_COLLECTIONS);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState(initialCategory === 'all' ? '' : initialCategory);

  useEffect(() => {
    if (initialCategory !== undefined) {
      setCategoryFilter(initialCategory === 'all' ? '' : initialCategory);
    }
  }, [initialCategory]);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    short_description: '',
    description: '',
    original_price: '',
    selling_price: '',
    sku: '',
    stock: 10,
    is_featured: false,
    is_published: true,
    images: []
  });

  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);
  const [toast, setToast] = useState('');
  const [toastType, setToastType] = useState('success');

  const showToast = (msg, type = 'success') => {
    setToast(msg);
    setToastType(type);
    setTimeout(() => setToast(''), 3500);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (categoryFilter && categoryFilter !== 'all') params.category_id = categoryFilter;

      const [prodRes, catRes] = await Promise.allSettled([
        productService.adminGetProducts(params),
        categoryService.getCategories()
      ]);

      if (catRes.status === 'fulfilled' && catRes.value?.success && Array.isArray(catRes.value.categories) && catRes.value.categories.length > 0) {
        setCategories(catRes.value.categories);
      }
      if (prodRes.status === 'fulfilled' && prodRes.value?.success) {
        setProducts(prodRes.value.products);
      }
    } catch (err) {
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [categoryFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadData();
  };

  const openAddModal = () => {
    setEditingProduct(null);
    const catList = (categories && categories.length > 0) ? categories : ALL_COLLECTIONS;
    const defaultCat = (categoryFilter && categoryFilter !== 'all') ? categoryFilter : (catList[0]?.id || 1);
    setFormData({
      name: '',
      category_id: defaultCat,
      short_description: '',
      description: '',
      original_price: '15000',
      selling_price: '12500',
      sku: `TEE-${Date.now().toString().slice(-6)}`,
      stock: 12,
      is_featured: false,
      is_published: true,
      images: []
    });
    setCustomImageUrl('');
    setModalOpen(true);
  };

  const openEditModal = (p) => {
    setEditingProduct(p);
    const existingImages = p.images ? p.images.map((im) => im.image_url) : [];
    setFormData({
      name: p.name,
      category_id: p.category_id || '',
      short_description: p.short_description || '',
      description: p.description || '',
      original_price: p.original_price,
      selling_price: p.selling_price,
      sku: p.sku || '',
      stock: p.stock !== undefined ? p.stock : 10,
      is_featured: !!p.is_featured,
      is_published: !!p.is_published,
      images: existingImages
    });
    setCustomImageUrl('');
    setModalOpen(true);
  };

  // Multiple Image File Upload handler
  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingFiles(true);
    const form = new FormData();
    for (let i = 0; i < files.length; i++) {
      form.append('images', files[i]);
    }

    try {
      const res = await adminService.uploadMultiple(form);
      if (res.success && res.files) {
        const uploadedUrls = res.files.map((f) => f.url);
        const isCloudinary = res.files.some((f) => f.url?.startsWith('http'));
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, ...uploadedUrls]
        }));
        showToast(`Uploaded ${res.files.length} image(s) successfully ${isCloudinary ? 'to Cloudinary CDN' : 'to storage'}.`);
      }
    } catch (err) {
      showToast(err.message || 'Image upload failed.', 'error');
    } finally {
      setUploadingFiles(false);
      e.target.value = '';
    }
  };

  const handleAddImageUrl = (e) => {
    e.preventDefault();
    if (!customImageUrl.trim()) return;
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, customImageUrl.trim()]
    }));
    setCustomImageUrl('');
  };

  const handleRemoveImage = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setSaveLoading(true);

    try {
      const activeCatId = formData.category_id || ((categories && categories.length > 0) ? categories[0]?.id : 1);
      const payload = { ...formData, category_id: activeCatId };
      if (editingProduct) {
        const res = await productService.updateProduct(editingProduct.id, payload);
        if (res.success) {
          showToast(`"${res.product.name}" updated successfully! Changes are live.`);
        }
      } else {
        const res = await productService.createProduct(payload);
        if (res.success) {
          showToast(`"${res.product.name}" published! It is now live on the customer website.`);
        }
      }
      try { window.dispatchEvent(new Event('products_updated')); } catch (e) {}
      setModalOpen(false);
      loadData();
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to save product.';
      showToast(errMsg, 'error');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleTogglePublish = async (id, currentStatus) => {
    try {
      const res = await productService.togglePublish(id);
      if (res.success) {
        setProducts((prev) =>
          prev.map((p) => (p.id === id ? { ...p, is_published: res.is_published } : p))
        );
        showToast(
          res.is_published
            ? 'Product published! Visible on customer storefront.'
            : 'Product unpublished! Hidden from customer storefront.'
        );
        try { window.dispatchEvent(new Event('products_updated')); } catch (e) {}
      }
    } catch (err) {
      showToast(err.message || 'Failed to toggle visibility.', 'error');
    }
  };

  const handleDeleteProduct = async (id, name) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${name}"?`)) return;

    try {
      const res = await productService.deleteProduct(id);
      if (res.success) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
        showToast(`Product "${name}" deleted.`);
        try { window.dispatchEvent(new Event('products_updated')); } catch (e) {}
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete product.', 'error');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Toast popup */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            top: '84px',
            right: '28px',
            background: toastType === 'error' ? 'rgba(239,68,68,0.95)' : 'linear-gradient(135deg, #f6dda0, #d4af37)',
            color: toastType === 'error' ? '#fff' : '#1a0418',
            padding: '12px 22px',
            borderRadius: '999px',
            fontWeight: 600,
            fontSize: '14px',
            zIndex: 9999,
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
            border: toastType === 'error' ? '1px solid #fca5a5' : 'none'
          }}
        >
          {toastType === 'error' ? '⚠ ' : '✓ '} {toast}
        </div>
      )}

      {/* Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            onClick={() => {
              if (modalOpen) {
                setModalOpen(false);
                setEditingProduct(null);
              } else {
                if (onClearCategory) onClearCategory();
                if (onBack) onBack();
              }
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(212,175,55,0.1)',
              border: '1px solid var(--gold)',
              color: 'var(--gold2)',
              padding: '8px 16px',
              borderRadius: '999px',
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            title="Go Back"
          >
            <ArrowLeft size={16} /> {t('adminBack', 'Back')}
          </button>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 500, color: 'var(--gold2)', margin: 0 }}>
              Jewellery Product Management
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--cream)', opacity: 0.75, margin: '4px 0 0' }}>
              Published products automatically appear on the customer-facing website and collections rail.
            </p>
          </div>
        </div>

        <button className="gbtn" onClick={openAddModal}>
          {t('adminAddNewProduct', '+ Add New Product')}
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', background: '#1c0418', padding: '16px', borderRadius: '12px', border: '1px solid var(--line)' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '8px', flex: 1, minWidth: '240px' }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, SKU or keyword..."
            style={{ flex: 1, background: 'rgba(255,240,208,0.06)', border: '1px solid var(--line)', padding: '10px 14px', borderRadius: '8px', color: '#fff', fontSize: '13px' }}
          />
          <button type="submit" style={{ background: 'var(--gold)', color: 'var(--ink)', border: 0, padding: '10px 18px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '13px' }}>
            Filter
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{ background: '#24061d', border: '1px solid var(--line)', padding: '10px 14px', borderRadius: '8px', color: 'var(--cream)', fontSize: '13px', minWidth: '160px' }}
          >
            <option value="">{t('allCollections', 'All Collections')}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {categoryFilter && (
            <button
              type="button"
              onClick={() => {
                setCategoryFilter('');
                if (onClearCategory) onClearCategory();
              }}
              style={{
                background: 'rgba(239,68,68,0.15)',
                border: '1px solid rgba(239,68,68,0.4)',
                color: '#fca5a5',
                padding: '8px 12px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
              title="Clear Category Filter"
            >
              ✕ Clear Filter
            </button>
          )}
        </div>
      </div>

      {/* Product List Table */}
      <div style={{ background: '#1c0418', border: '1px solid var(--line)', borderRadius: '16px', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: 'rgba(229,189,114,0.08)', borderBottom: '1px solid var(--line)', color: 'var(--gold)' }}>
                <th style={{ padding: '12px 16px' }}>Item</th>
                <th style={{ padding: '12px 16px' }}>Category</th>
                <th style={{ padding: '12px 16px' }}>SKU</th>
                <th style={{ padding: '12px 16px' }}>Price</th>
                <th style={{ padding: '12px 16px' }}>Stock</th>
                <th style={{ padding: '12px 16px' }}>Status</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ padding: '40px', textAlign: 'center', opacity: 0.7 }}>
                    Loading products...
                  </td>
                </tr>
              ) : products.length > 0 ? (
                products.map((p) => {
                  let img = p.images && p.images[0]?.image_url;
                  if (!img && p.image_url) img = p.image_url;
                  const isCssVar = img && img.startsWith('var(');
                  const bgStyle = isCssVar ? img : img ? `url("${encodeURI(img)}")` : 'var(--i-neck)';

                  return (
                    <tr key={p.id} style={{ borderBottom: '1px solid rgba(229,189,114,0.1)' }}>
                      <td style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                          style={{
                            width: '46px',
                            height: '46px',
                            borderRadius: '8px',
                            backgroundImage: bgStyle,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            border: '1px solid var(--line)',
                            backgroundColor: '#2c0823',
                            flexShrink: 0
                          }}
                        />
                        <div>
                          <b style={{ color: 'var(--cream)', fontSize: '14px', display: 'block' }}>{p.name}</b>
                          {p.is_featured ? (
                            <span style={{ fontSize: '11px', color: 'var(--gold2)', background: 'rgba(212,175,55,0.2)', padding: '1px 6px', borderRadius: '4px' }}>
                              ★ Featured
                            </span>
                          ) : null}
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--cream)', opacity: 0.85 }}>
                        {p.category?.name || 'Unassigned'}
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--gold)', fontFamily: 'monospace' }}>
                        {p.sku || '—'}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <b style={{ color: 'var(--gold2)' }}>{inr(p.selling_price)}</b>
                        {parseFloat(p.original_price) > parseFloat(p.selling_price) && (
                          <small style={{ display: 'block', textDecoration: 'line-through', opacity: 0.5 }}>
                            {inr(p.original_price)}
                          </small>
                        )}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span
                          style={{
                            padding: '3px 8px',
                            borderRadius: '999px',
                            fontSize: '11px',
                            background: p.stock <= 5 ? 'rgba(239,68,68,0.2)' : 'rgba(74,222,128,0.15)',
                            color: p.stock <= 5 ? '#fca5a5' : '#4ade80'
                          }}
                        >
                          {p.stock} units
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <button
                          onClick={() => handleTogglePublish(p.id, p.is_published)}
                          style={{
                            padding: '4px 10px',
                            borderRadius: '999px',
                            border: 0,
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: 600,
                            background: p.is_published ? 'rgba(74, 222, 128, 0.2)' : 'rgba(156, 163, 175, 0.2)',
                            color: p.is_published ? '#4ade80' : '#9ca3af'
                          }}
                        >
                          {p.is_published ? '● Live' : '○ Hidden'}
                        </button>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <button
                          onClick={() => openEditModal(p)}
                          style={{ background: 'none', border: 0, color: 'var(--gold)', cursor: 'pointer', marginRight: '10px', fontSize: '13px', textDecoration: 'underline' }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id, p.name)}
                          style={{ background: 'none', border: 0, color: '#f87171', cursor: 'pointer', fontSize: '13px', textDecoration: 'underline' }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" style={{ padding: '40px', textAlign: 'center', opacity: 0.7 }}>
                    No products found. Click "+ Add New Product" above to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {modalOpen && (
        <div className="ov on" onClick={(e) => e.target.classList.contains('ov') && setModalOpen(false)}>
          <div className="box" style={{ maxWidth: '820px', maxHeight: '90vh', overflowY: 'auto', padding: '32px' }}>
            <button className="x" aria-label="Close" onClick={() => setModalOpen(false)}>
              ×
            </button>

            <h3 style={{ fontSize: '24px', color: 'var(--gold2)', marginBottom: '4px' }}>
              {editingProduct ? 'Edit Jewellery Product' : 'Add New Jewellery Product'}
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--cream)', opacity: 0.75, marginBottom: '20px' }}>
              When published, this piece will immediately be visible in the customer storefront.
            </p>

            <form onSubmit={handleSaveProduct} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--gold)', display: 'block', marginBottom: '6px' }}>
                    Product Name *
                  </label>
                  <input
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Royal Antique Kundan Choker"
                    style={{ width: '100%', background: 'rgba(255,240,208,0.06)', border: '1px solid var(--line)', padding: '10px 14px', borderRadius: '8px', color: '#fff' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--gold)', display: 'block', marginBottom: '6px' }}>
                    Collection / Category *
                  </label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    style={{ width: '100%', background: '#24061d', border: '1px solid var(--line)', padding: '10px 14px', borderRadius: '8px', color: '#fff' }}
                  >
                    <option value="">Select Collection</option>
                    {(categories && categories.length > 0 ? categories : ALL_COLLECTIONS).map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--gold)', display: 'block', marginBottom: '6px' }}>
                    Original Price (₹) *
                  </label>
                  <input
                    required
                    type="number"
                    min="0"
                    value={formData.original_price}
                    onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
                    placeholder="e.g. 52000"
                    style={{ width: '100%', background: 'rgba(255,240,208,0.06)', border: '1px solid var(--line)', padding: '10px 14px', borderRadius: '8px', color: '#fff' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--gold)', display: 'block', marginBottom: '6px' }}>
                    Selling Price (₹) *
                  </label>
                  <input
                    required
                    type="number"
                    min="0"
                    value={formData.selling_price}
                    onChange={(e) => setFormData({ ...formData, selling_price: e.target.value })}
                    placeholder="e.g. 46500"
                    style={{ width: '100%', background: 'rgba(255,240,208,0.06)', border: '1px solid var(--line)', padding: '10px 14px', borderRadius: '8px', color: '#fff' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--gold)', display: 'block', marginBottom: '6px' }}>
                    SKU Code
                  </label>
                  <input
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="TEE-NCK-007"
                    style={{ width: '100%', background: 'rgba(255,240,208,0.06)', border: '1px solid var(--line)', padding: '10px 14px', borderRadius: '8px', color: '#fff' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--gold)', display: 'block', marginBottom: '6px' }}>
                    Stock Available
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    placeholder="10"
                    style={{ width: '100%', background: 'rgba(255,240,208,0.06)', border: '1px solid var(--line)', padding: '10px 14px', borderRadius: '8px', color: '#fff' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--gold)', display: 'block', marginBottom: '6px' }}>
                  Short Tagline
                </label>
                <input
                  value={formData.short_description}
                  onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                  placeholder="Intricately handcrafted temple motif with rubies and freshwater pearls"
                  style={{ width: '100%', background: 'rgba(255,240,208,0.06)', border: '1px solid var(--line)', padding: '10px 14px', borderRadius: '8px', color: '#fff' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--gold)', display: 'block', marginBottom: '6px' }}>
                  Full Description
                </label>
                <textarea
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed craftsmanship notes, styling tips, metal details, warranty..."
                  style={{ width: '100%', background: 'rgba(255,240,208,0.06)', border: '1px solid var(--line)', padding: '10px 14px', borderRadius: '8px', color: '#fff', minHeight: '80px' }}
                />
              </div>

              {/* Multiple Image Upload Component */}
              <div style={{ background: 'rgba(20,2,16,0.6)', border: '1px solid var(--line)', borderRadius: '12px', padding: '16px' }}>
                <label style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--gold2)', display: 'block', marginBottom: '8px' }}>
                  Product Images (Upload Multiple or Add URL)
                </label>

                {/* Upload Buttons */}
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '14px' }}>
                  <label
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      background: 'var(--gold)',
                      color: 'var(--ink)',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontSize: '13px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    📁 Upload Image Files
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileUpload}
                      style={{ display: 'none' }}
                    />
                  </label>
                  {uploadingFiles && <span style={{ fontSize: '13px', color: 'var(--gold)' }}>Uploading images...</span>}

                  <span style={{ fontSize: '12px', opacity: 0.6 }}>or</span>

                  <div style={{ display: 'flex', gap: '6px', flex: 1, minWidth: '220px' }}>
                    <input
                      value={customImageUrl}
                      onChange={(e) => setCustomImageUrl(e.target.value)}
                      placeholder="Paste image URL (/uploads/... or https://...)"
                      style={{ flex: 1, background: 'rgba(255,240,208,0.06)', border: '1px solid var(--line)', padding: '6px 12px', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                    />
                    <button
                      type="button"
                      onClick={handleAddImageUrl}
                      style={{ background: 'rgba(229,189,114,0.2)', border: '1px solid var(--gold)', color: 'var(--gold2)', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' }}
                    >
                      Add URL
                    </button>
                  </div>
                </div>

                {/* Image Thumbnails Previews */}
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {formData.images.map((img, idx) => {
                    const isCss = img && img.startsWith('var(');
                    const bg = isCss ? img : img ? `url("${encodeURI(img)}")` : 'var(--i-neck)';
                    return (
                      <div
                        key={idx}
                        style={{
                          width: '74px',
                          height: '74px',
                          borderRadius: '8px',
                          backgroundImage: bg,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          border: idx === 0 ? '2px solid var(--gold)' : '1px solid var(--line)',
                          position: 'relative'
                        }}
                      >
                        {idx === 0 && (
                          <span style={{ position: 'absolute', bottom: '2px', left: '2px', background: 'var(--gold)', color: '#1a0418', fontSize: '9px', fontWeight: 700, padding: '1px 4px', borderRadius: '3px' }}>
                            Primary
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          style={{
                            position: 'absolute',
                            top: '-6px',
                            right: '-6px',
                            background: '#ef4444',
                            color: '#fff',
                            border: 0,
                            borderRadius: '50%',
                            width: '18px',
                            height: '18px',
                            display: 'grid',
                            placeItems: 'center',
                            fontSize: '11px',
                            cursor: 'pointer'
                          }}
                        >
                          ×
                        </button>
                      </div>
                    );
                  })}
                  {formData.images.length === 0 && (
                    <div style={{ fontSize: '12px', opacity: 0.6, padding: '10px 0' }}>
                      No images attached yet. Upload at least one image.
                    </div>
                  )}
                </div>
              </div>

              {/* Toggles */}
              <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', padding: '10px 0' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', color: 'var(--cream)' }}>
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                  />
                  Mark as Featured Product
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', color: 'var(--gold2)', fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={formData.is_published}
                    onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                  />
                  Publish Immediately (Display on Customer Website)
                </label>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  style={{ padding: '12px 24px', borderRadius: '999px', border: '1px solid var(--line)', background: 'none', color: '#fff', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="gbtn"
                  disabled={saveLoading}
                >
                  {saveLoading ? 'Saving...' : editingProduct ? 'Save Changes' : 'Publish Product →'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

