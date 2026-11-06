import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { categoryService, adminService } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

export default function CategoryManagement({ onViewProducts, onBack }) {
  const { t, isTamil, translateCategory } = useLanguage();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image_url: '',
    display_order: 1,
    is_published: true
  });
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState('');
  const [toastType, setToastType] = useState('success');
  const [search, setSearch] = useState('');

  const showToast = (msg, type = 'success') => {
    setToast(msg);
    setToastType(type);
    setTimeout(() => setToast(''), 3500);
  };

  const loadCategories = async () => {
    try {
      setLoading(true);
      const res = await categoryService.adminGetCategories();
      if (res.success) setCategories(res.categories);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const openAdd = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
      image_url: '',
      display_order: categories.length + 1,
      is_published: true
    });
    setModalOpen(true);
  };

  const openEdit = (cat) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      description: cat.description || '',
      image_url: cat.image_url || '',
      display_order: cat.display_order || 1,
      is_published: cat.is_published !== false
    });
    setModalOpen(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const form = new FormData();
    form.append('image', file);
    try {
      const res = await adminService.uploadSingle(form);
      if (res.success && res.url) {
        setFormData((prev) => ({ ...prev, image_url: res.url }));
        showToast('Category image uploaded.');
      }
    } catch (err) {
      showToast(err.message || 'Image upload failed', 'error');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await categoryService.updateCategory(editingCategory.id, formData);
        showToast(`Category "${formData.name}" updated.`);
      } else {
        await categoryService.createCategory(formData);
        showToast(`Category "${formData.name}" created.`);
      }
      try { window.dispatchEvent(new Event('categories_updated')); } catch (e) {}
      setModalOpen(false);
      loadCategories();
    } catch (err) {
      showToast(err.message || 'Failed to save category', 'error');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete category "${name}"? Products will become unassigned.`)) return;
    try {
      await categoryService.deleteCategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      showToast(`Category "${name}" removed.`);
      try { window.dispatchEvent(new Event('categories_updated')); } catch (e) {}
    } catch (err) {
      showToast(err.message || 'Failed to delete category', 'error');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {toast && (
        <div style={{ position: 'fixed', top: '84px', right: '28px', background: toastType === 'error' ? 'rgba(239,68,68,0.95)' : 'linear-gradient(135deg, #f6dda0, #d4af37)', color: toastType === 'error' ? '#fff' : '#1a0418', padding: '12px 22px', borderRadius: '999px', fontWeight: 600, fontSize: '14px', zIndex: 9999, border: toastType === 'error' ? '1px solid #fca5a5' : 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
          {toastType === 'error' ? '⚠ ' : '✓ '} {toast}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            onClick={() => {
              if (modalOpen) {
                setModalOpen(false);
                setEditingCategory(null);
              } else if (onBack) {
                onBack();
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
              Jewellery Collections / Categories
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--cream)', opacity: 0.75, margin: '4px 0 0' }}>
              Manage the carousel collections and product filter groups.
            </p>
          </div>
        </div>

        <button className="gbtn" onClick={openAdd}>
          {t('adminAddNewCollection', '+ New Collection')}
        </button>
      </div>

      {/* Search Bar */}
      <div style={{ display: 'flex', gap: '10px', maxWidth: '420px' }}>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={isTamil ? 'தொகுப்புப் பெயரைத் தேடுங்கள்...' : 'Search collection or description...'}
          style={{
            flex: 1,
            background: 'rgba(255,240,208,0.06)',
            border: '1px solid var(--line)',
            borderRadius: '999px',
            padding: '9px 18px',
            color: 'var(--cream)',
            fontSize: '13px',
            outline: 'none'
          }}
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            style={{
              background: 'rgba(255,240,208,0.08)',
              border: '1px solid var(--line)',
              color: 'var(--gold2)',
              borderRadius: '999px',
              padding: '0 16px',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            Clear
          </button>
        )}
      </div>

      <div style={{ background: '#1c0418', border: '1px solid var(--line)', borderRadius: '16px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: 'rgba(229,189,114,0.08)', borderBottom: '1px solid var(--line)', color: 'var(--gold)' }}>
              <th style={{ padding: '12px 16px' }}>Collection</th>
              <th style={{ padding: '12px 16px' }}>Description</th>
              <th style={{ padding: '12px 16px' }}>Products</th>
              <th style={{ padding: '12px 16px' }}>Order</th>
              <th style={{ padding: '12px 16px' }}>Status</th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" style={{ padding: '30px', textAlign: 'center', opacity: 0.7 }}>
                  Loading categories...
                </td>
              </tr>
            ) : (
              categories
                .filter((c) => {
                  if (!search.trim()) return true;
                  const q = search.toLowerCase();
                  return (
                    (c.name && c.name.toLowerCase().includes(q)) ||
                    (c.description && c.description.toLowerCase().includes(q)) ||
                    (c.slug && c.slug.toLowerCase().includes(q))
                  );
                })
                .map((c) => {
                  const img = c.image_url;
                  const bg = img
                    ? (img.startsWith('var(') ? img : `url("${encodeURI(img)}")`)
                    : 'var(--i-neck)';
              return (
                <tr key={c.id} style={{ borderBottom: '1px solid rgba(229,189,114,0.1)' }}>
                  <td style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '8px',
                        backgroundImage: bg,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundColor: '#270620',
                        border: '1px solid var(--line)'
                      }}
                    />
                    <button
                      onClick={() => onViewProducts && onViewProducts(c.id)}
                      style={{ background: 'none', border: 0, padding: 0, color: 'var(--cream)', fontSize: '14px', fontWeight: 'bold', textAlign: 'left', cursor: 'pointer', textDecoration: 'underline' }}
                      title={`View all products in ${c.name}`}
                    >
                      {c.name} ↗
                    </button>
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--cream)', opacity: 0.8, maxWidth: '300px' }}>
                    {c.description || '—'}
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--gold2)' }}>
                    <button
                      onClick={() => onViewProducts && onViewProducts(c.id)}
                      style={{
                        background: 'rgba(212,175,55,0.12)',
                        border: '1px solid rgba(212,175,55,0.3)',
                        borderRadius: '999px',
                        padding: '3px 10px',
                        color: 'var(--gold2)',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                      title="Filter products by this collection"
                    >
                      {c.product_count || 0} pieces →
                    </button>
                  </td>
                  <td style={{ padding: '12px 16px', opacity: 0.8 }}>
                    #{c.display_order}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ color: c.is_published ? '#4ade80' : '#888' }}>
                      {c.is_published ? '● Active' : '○ Draft'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <button
                      onClick={() => onViewProducts && onViewProducts(c.id)}
                      style={{ background: 'none', border: 0, color: 'var(--gold2)', cursor: 'pointer', marginRight: '10px', fontSize: '12px', textDecoration: 'underline', fontWeight: 600 }}
                    >
                      View ({c.product_count || 0})
                    </button>
                    <button
                      onClick={() => openEdit(c)}
                      style={{ background: 'none', border: 0, color: 'var(--gold)', cursor: 'pointer', marginRight: '10px', textDecoration: 'underline' }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(c.id, c.name)}
                      style={{ background: 'none', border: 0, color: '#f87171', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
              }))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="ov on" onClick={(e) => e.target.classList.contains('ov') && setModalOpen(false)}>
          <div className="box" style={{ maxWidth: '540px', padding: '32px' }}>
            <button className="x" aria-label="Close" onClick={() => setModalOpen(false)}>
              ×
            </button>
            <h3 style={{ fontSize: '22px', color: 'var(--gold2)', marginBottom: '16px' }}>
              {editingCategory ? 'Edit Collection' : 'Create New Collection'}
            </h3>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--gold)', display: 'block', marginBottom: '6px' }}>
                  Collection Name *
                </label>
                <input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Waist Belts"
                  style={{ width: '100%', background: 'rgba(255,240,208,0.06)', border: '1px solid var(--line)', padding: '10px 14px', borderRadius: '8px', color: '#fff' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--gold)', display: 'block', marginBottom: '6px' }}>
                  Description
                </label>
                <textarea
                  rows="2"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Temple ottiyanams and bridal waist ornaments..."
                  style={{ width: '100%', background: 'rgba(255,240,208,0.06)', border: '1px solid var(--line)', padding: '10px 14px', borderRadius: '8px', color: '#fff' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--gold)', display: 'block', marginBottom: '6px' }}>
                  Collection Image (Upload or URL)
                </label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="/uploads/waist belt.png"
                    style={{ flex: 1, background: 'rgba(255,240,208,0.06)', border: '1px solid var(--line)', padding: '8px 12px', borderRadius: '8px', color: '#fff', fontSize: '13px' }}
                  />
                  <label style={{ background: 'var(--gold)', color: 'var(--ink)', padding: '8px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                    Browse...
                    <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                  </label>
                </div>
                {uploading && <small style={{ color: 'var(--gold)' }}>Uploading image...</small>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--gold)', display: 'block', marginBottom: '6px' }}>
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: e.target.value })}
                    style={{ width: '100%', background: 'rgba(255,240,208,0.06)', border: '1px solid var(--line)', padding: '10px 14px', borderRadius: '8px', color: '#fff' }}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', paddingTop: '20px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
                    <input
                      type="checkbox"
                      checked={formData.is_published}
                      onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                    />
                    Published Live
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button type="button" onClick={() => setModalOpen(false)} style={{ padding: '10px 20px', borderRadius: '999px', border: '1px solid var(--line)', background: 'none', color: '#fff', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" className="gbtn">
                  {editingCategory ? 'Update Collection' : 'Create Collection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

