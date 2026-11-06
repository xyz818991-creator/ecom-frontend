import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { bannerService, adminService } from '../services/api';

export default function BannerManagement({ onBack }) {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    kick: 'The Ethnic Edit',
    button_text: 'Shop the Collection',
    button_link: '#shop',
    desktop_image: '',
    mobile_image: '',
    type: 'hero',
    display_order: 1,
    is_active: true
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

  const loadBanners = async () => {
    try {
      setLoading(true);
      const res = await bannerService.adminGetBanners();
      if (res.success) setBanners(res.banners);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBanners();
  }, []);

  const openAdd = () => {
    setEditingBanner(null);
    setFormData({
      title: '',
      subtitle: '',
      kick: 'The Ethnic Edit',
      button_text: 'Shop the Collection',
      button_link: '#shop',
      desktop_image: '',
      mobile_image: '',
      type: 'hero',
      display_order: banners.length + 1,
      is_active: true
    });
    setModalOpen(true);
  };

  const openEdit = (b) => {
    setEditingBanner(b);
    setFormData({
      title: b.title,
      subtitle: b.subtitle || '',
      kick: b.kick || 'The Ethnic Edit',
      button_text: b.button_text || 'Shop the Collection',
      button_link: b.button_link || '#shop',
      desktop_image: b.desktop_image || '',
      mobile_image: b.mobile_image || '',
      type: b.type || 'hero',
      display_order: b.display_order || 1,
      is_active: b.is_active !== false
    });
    setModalOpen(true);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const form = new FormData();
    form.append('image', file);
    try {
      const res = await adminService.uploadSingle(form);
      if (res.success && res.url) {
        setFormData((prev) => ({
          ...prev,
          desktop_image: res.url,
          mobile_image: prev.mobile_image || res.url
        }));
        showToast('Banner image uploaded.');
      }
    } catch (err) {
      showToast(err.response?.data?.message || err.message || 'Image upload failed', 'error');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingBanner) {
        await bannerService.updateBanner(editingBanner.id, formData);
        showToast('Banner updated.');
      } else {
        await bannerService.createBanner(formData);
        showToast('Banner created and added to homepage rotation.');
      }
      setModalOpen(false);
      loadBanners();
    } catch (err) {
      showToast(err.response?.data?.message || err.message || 'Failed to save banner', 'error');
    }
  };

  const handleToggle = async (id) => {
    try {
      const res = await bannerService.toggleBanner(id);
      if (res.success) {
        setBanners((prev) =>
          prev.map((b) => (b.id === id ? { ...b, is_active: res.is_active } : b))
        );
        showToast(res.is_active ? 'Banner activated live!' : 'Banner deactivated.');
      }
    } catch (err) {
      showToast(err.response?.data?.message || err.message || 'Failed to toggle banner status', 'error');
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete banner "${title}"?`)) return;
    try {
      await bannerService.deleteBanner(id);
      setBanners((prev) => prev.filter((b) => b.id !== id));
      showToast('Banner deleted.');
    } catch (err) {
      showToast(err.response?.data?.message || err.message || 'Failed to delete banner', 'error');
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
            onClick={() => (onBack ? onBack() : window.history.back())}
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
            <ArrowLeft size={16} /> Back
          </button>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 500, color: 'var(--gold2)', margin: 0 }}>
              Homepage Banners &amp; Hero Showcase
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--cream)', opacity: 0.75, margin: '4px 0 0' }}>
              Active banners dynamically display on the customer carousel and promotional panels.
            </p>
          </div>
        </div>

        <button className="gbtn" onClick={openAdd}>
          + Upload New Banner
        </button>
      </div>

      {/* Search Bar */}
      <div style={{ display: 'flex', gap: '10px', maxWidth: '420px' }}>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search banner headline, subtitle or CTA..."
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
              <th style={{ padding: '12px 16px' }}>Banner Preview</th>
              <th style={{ padding: '12px 16px' }}>Headline / Text</th>
              <th style={{ padding: '12px 16px' }}>Type</th>
              <th style={{ padding: '12px 16px' }}>CTA Link</th>
              <th style={{ padding: '12px 16px' }}>Order</th>
              <th style={{ padding: '12px 16px' }}>Live</th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={{ padding: '30px', textAlign: 'center', opacity: 0.7 }}>
                  Loading banners...
                </td>
              </tr>
            ) : (
              banners
                .filter((b) => {
                  if (!search.trim()) return true;
                  const q = search.toLowerCase();
                  return (
                    (b.title && b.title.toLowerCase().includes(q)) ||
                    (b.subtitle && b.subtitle.toLowerCase().includes(q)) ||
                    (b.button_text && b.button_text.toLowerCase().includes(q)) ||
                    (b.type && b.type.toLowerCase().includes(q))
                  );
                })
                .map((b) => {
                  const img = b.desktop_image;
                  const isCss = img && img.startsWith('var(');
                  const bg = isCss ? img : img ? `url("${encodeURI(img)}")` : 'var(--i-chest)';
              return (
                <tr key={b.id} style={{ borderBottom: '1px solid rgba(229,189,114,0.1)' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div
                      style={{
                        width: '80px',
                        height: '48px',
                        borderRadius: '6px',
                        backgroundImage: bg,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundColor: '#270620',
                        border: '1px solid var(--line)'
                      }}
                    />
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <b style={{ color: 'var(--cream)', fontSize: '14px', display: 'block' }}>{b.title}</b>
                    <small style={{ color: 'var(--gold)', opacity: 0.8 }}>{b.subtitle}</small>
                  </td>
                  <td style={{ padding: '12px 16px', textTransform: 'uppercase', fontSize: '11px', color: 'var(--gold2)' }}>
                    {b.type}
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--cream)', opacity: 0.75 }}>
                    {b.button_text} ({b.button_link})
                  </td>
                  <td style={{ padding: '12px 16px', opacity: 0.8 }}>
                    #{b.display_order}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <button
                      onClick={() => handleToggle(b.id)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '999px',
                        border: 0,
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 600,
                        background: b.is_active ? 'rgba(74, 222, 128, 0.2)' : 'rgba(156, 163, 175, 0.2)',
                        color: b.is_active ? '#4ade80' : '#9ca3af'
                      }}
                    >
                      {b.is_active ? '● Active' : '○ Inactive'}
                    </button>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <button
                      onClick={() => openEdit(b)}
                      style={{ background: 'none', border: 0, color: 'var(--gold)', cursor: 'pointer', marginRight: '10px', textDecoration: 'underline' }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(b.id, b.title)}
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

      {/* Add / Edit Banner Modal */}
      {modalOpen && (
        <div className="ov on" onClick={(e) => e.target.classList.contains('ov') && setModalOpen(false)}>
          <div className="box" style={{ maxWidth: '640px', padding: '32px' }}>
            <button className="x" aria-label="Close" onClick={() => setModalOpen(false)}>
              ×
            </button>
            <h3 style={{ fontSize: '22px', color: 'var(--gold2)', marginBottom: '16px' }}>
              {editingBanner ? 'Edit Banner' : 'Upload New Banner'}
            </h3>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--gold)', display: 'block', marginBottom: '6px' }}>
                  Tagline / Overline (Kick)
                </label>
                <input
                  value={formData.kick}
                  onChange={(e) => setFormData({ ...formData, kick: e.target.value })}
                  placeholder="The Ethnic Edit"
                  style={{ width: '100%', background: 'rgba(255,240,208,0.06)', border: '1px solid var(--line)', padding: '10px 14px', borderRadius: '8px', color: '#fff' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--gold)', display: 'block', marginBottom: '6px' }}>
                  Main Title Headline *
                </label>
                <input
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Tradition, Beautifully Curated."
                  style={{ width: '100%', background: 'rgba(255,240,208,0.06)', border: '1px solid var(--line)', padding: '10px 14px', borderRadius: '8px', color: '#fff' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--gold)', display: 'block', marginBottom: '6px' }}>
                  Subtitle / Description
                </label>
                <textarea
                  rows="2"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  placeholder="Timeless jewellery for every celebration, crafted with elegance."
                  style={{ width: '100%', background: 'rgba(255,240,208,0.06)', border: '1px solid var(--line)', padding: '10px 14px', borderRadius: '8px', color: '#fff' }}
                />
              </div>

              {/* Banner Image */}
              <div>
                <label style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--gold)', display: 'block', marginBottom: '6px' }}>
                  Desktop Image (Upload or URL) *
                </label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input
                    required
                    value={formData.desktop_image}
                    onChange={(e) => setFormData({ ...formData, desktop_image: e.target.value })}
                    placeholder="/uploads/jewels.png or https://..."
                    style={{ flex: 1, background: 'rgba(255,240,208,0.06)', border: '1px solid var(--line)', padding: '8px 12px', borderRadius: '8px', color: '#fff', fontSize: '13px' }}
                  />
                  <label style={{ background: 'var(--gold)', color: 'var(--ink)', padding: '8px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                    Upload File
                    <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
                  </label>
                </div>
                {uploading && <small style={{ color: 'var(--gold)' }}>Uploading image...</small>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--gold)', display: 'block', marginBottom: '6px' }}>
                    Button Label
                  </label>
                  <input
                    value={formData.button_text}
                    onChange={(e) => setFormData({ ...formData, button_text: e.target.value })}
                    placeholder="Shop the Collection"
                    style={{ width: '100%', background: 'rgba(255,240,208,0.06)', border: '1px solid var(--line)', padding: '10px 14px', borderRadius: '8px', color: '#fff' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--gold)', display: 'block', marginBottom: '6px' }}>
                    Button Link Destination
                  </label>
                  <input
                    value={formData.button_link}
                    onChange={(e) => setFormData({ ...formData, button_link: e.target.value })}
                    placeholder="#shop or /collections"
                    style={{ width: '100%', background: 'rgba(255,240,208,0.06)', border: '1px solid var(--line)', padding: '10px 14px', borderRadius: '8px', color: '#fff' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--gold)', display: 'block', marginBottom: '6px' }}>
                    Banner Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    style={{ width: '100%', background: '#24061d', border: '1px solid var(--line)', padding: '10px 14px', borderRadius: '8px', color: '#fff' }}
                  >
                    <option value="hero">Hero Carousel</option>
                    <option value="promo">Mid-page Promo Banner</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--gold)', display: 'block', marginBottom: '6px' }}>
                    Order
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
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    />
                    Active Live
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button type="button" onClick={() => setModalOpen(false)} style={{ padding: '10px 20px', borderRadius: '999px', border: '1px solid var(--line)', background: 'none', color: '#fff', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" className="gbtn">
                  {editingBanner ? 'Update Banner' : 'Publish Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

