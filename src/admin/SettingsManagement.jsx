import React, { useState, useEffect } from 'react';
import { ArrowLeft, Cloud, CheckCircle, AlertCircle, RefreshCw, Key, Shield, Eye, EyeOff } from 'lucide-react';
import { adminService } from '../services/api';

export default function SettingsManagement({ onBack }) {
  const [settings, setSettings] = useState({
    store_name: 'The Ethnic Edit',
    tagline: 'Tradition, Beautifully Curated.',
    contact_email: 'hello@theethnicedit.com',
    contact_phone: '+91 98765 43210',
    contact_hours: 'Mon–Sat, 10am–7pm IST',
    about_story: 'The Ethnic Edit brings together temple-inspired designs, antique gold finishes and delicate pearl work, curated for weddings, festivals and every moment worth celebrating.',
    cloudinary_cloud_name: 'website',
    cloudinary_api_key: '486688659448394',
    cloudinary_api_secret: 'q-NN6HwWCnFEN26AVMM9YTiIIcw'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [toastType, setToastType] = useState('success');
  const [showSecret, setShowSecret] = useState(false);

  // Cloudinary testing state
  const [testingCloud, setTestingCloud] = useState(false);
  const [cloudStatus, setCloudStatus] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast(msg);
    setToastType(type);
    setTimeout(() => setToast(''), 4000);
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await adminService.getSettings();
        if (res.success && res.settings) {
          setSettings((prev) => ({ ...prev, ...res.settings }));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleChange = (e) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
    // Reset cloud status when credentials change
    if (e.target.name.startsWith('cloudinary_')) {
      setCloudStatus(null);
    }
  };

  const handleTestCloudinary = async () => {
    setTestingCloud(true);
    setCloudStatus(null);
    try {
      const res = await adminService.testCloudinary({
        cloud_name: settings.cloudinary_cloud_name,
        api_key: settings.cloudinary_api_key,
        api_secret: settings.cloudinary_api_secret
      });
      if (res.success) {
        setCloudStatus({
          type: 'success',
          message: `✓ Connected to Cloudinary! Cloud: "${res.cloud_name}". Image uploads will be hosted on Cloudinary CDN.`
        });
      } else {
        setCloudStatus({
          type: 'error',
          message: res.message || 'Cloudinary connection failed.'
        });
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to connect to Cloudinary.';
      setCloudStatus({
        type: 'error',
        message: errorMsg
      });
    } finally {
      setTestingCloud(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await adminService.updateSettings(settings);
      if (res.success) {
        showToast('Store settings & Cloudinary configuration saved! User page updated.');
        // Broadcast custom event so all active tabs and pages update immediately
        try {
          window.dispatchEvent(new Event('store_settings_updated'));
          localStorage.setItem('ethnic_store_settings', JSON.stringify(settings));
        } catch (e) {}
      }
    } catch (err) {
      showToast(err.response?.data?.message || err.message || 'Failed to save settings.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: '860px' }}>
      {toast && (
        <div style={{ position: 'fixed', top: '84px', right: '28px', background: toastType === 'error' ? 'rgba(239,68,68,0.95)' : 'linear-gradient(135deg, #f6dda0, #d4af37)', color: toastType === 'error' ? '#fff' : '#1a0418', padding: '12px 22px', borderRadius: '999px', fontWeight: 600, fontSize: '14px', zIndex: 9999, border: toastType === 'error' ? '1px solid #fca5a5' : 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
          {toastType === 'error' ? '⚠ ' : '✓ '} {toast}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
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
            Store Settings &amp; Cloudinary Storage
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--cream)', opacity: 0.75, margin: '4px 0 0' }}>
            Updates here automatically sync across the user storefront header, navigation brand, footer, and image hosting.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Store Brand & Profile Card */}
        <div style={{ background: '#1c0418', padding: '28px', borderRadius: '16px', border: '1px solid var(--line)' }}>
          <h3 style={{ fontSize: '16px', color: 'var(--gold2)', margin: '0 0 16px', fontWeight: 600 }}>
            🏪 Store Identity &amp; Contact Details
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--gold)', display: 'block', marginBottom: '6px' }}>
                Store Name (Customer Storefront Title)
              </label>
              <input
                type="text"
                name="store_name"
                value={settings.store_name}
                onChange={handleChange}
                required
                style={{ width: '100%', background: '#24061d', border: '1px solid var(--line)', color: '#fff', padding: '10px 14px', borderRadius: '8px', fontSize: '14px' }}
                placeholder="e.g. The Ethnic Edit"
              />
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginTop: '4px', display: 'block' }}>
                Reflected immediately in navbar brand, page titles, and footers.
              </span>
            </div>

            <div>
              <label style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--gold)', display: 'block', marginBottom: '6px' }}>
                Store Tagline
              </label>
              <input
                type="text"
                name="tagline"
                value={settings.tagline}
                onChange={handleChange}
                style={{ width: '100%', background: '#24061d', border: '1px solid var(--line)', color: '#fff', padding: '10px 14px', borderRadius: '8px', fontSize: '14px' }}
                placeholder="e.g. Tradition, Beautifully Curated."
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--gold)', display: 'block', marginBottom: '6px' }}>
                Customer Care Email
              </label>
              <input
                type="email"
                name="contact_email"
                value={settings.contact_email}
                onChange={handleChange}
                style={{ width: '100%', background: '#24061d', border: '1px solid var(--line)', color: '#fff', padding: '10px 14px', borderRadius: '8px', fontSize: '14px' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--gold)', display: 'block', marginBottom: '6px' }}>
                Customer Care Phone
              </label>
              <input
                type="text"
                name="contact_phone"
                value={settings.contact_phone}
                onChange={handleChange}
                style={{ width: '100%', background: '#24061d', border: '1px solid var(--line)', color: '#fff', padding: '10px 14px', borderRadius: '8px', fontSize: '14px' }}
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--gold)', display: 'block', marginBottom: '6px' }}>
                Concierge &amp; Working Hours
              </label>
              <input
                type="text"
                name="contact_hours"
                value={settings.contact_hours}
                onChange={handleChange}
                style={{ width: '100%', background: '#24061d', border: '1px solid var(--line)', color: '#fff', padding: '10px 14px', borderRadius: '8px', fontSize: '14px' }}
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--gold)', display: 'block', marginBottom: '6px' }}>
                About the Brand Story (Landing Page Narrative)
              </label>
              <textarea
                name="about_story"
                rows={3}
                value={settings.about_story}
                onChange={handleChange}
                style={{ width: '100%', background: '#24061d', border: '1px solid var(--line)', color: '#fff', padding: '10px 14px', borderRadius: '8px', fontSize: '14px', lineHeight: 1.5 }}
              />
            </div>
          </div>
        </div>

        {/* Cloudinary Integration Card */}
        <div style={{ background: '#1c0418', padding: '28px', borderRadius: '16px', border: '1px solid var(--line)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Cloud size={22} color="var(--gold2)" />
              <div>
                <h3 style={{ fontSize: '16px', color: 'var(--gold2)', margin: 0, fontWeight: 600 }}>
                  Cloudinary Image Storage Integration
                </h3>
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>
                  All product and review images upload directly to Cloudinary CDN with high-res delivery.
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleTestCloudinary}
              disabled={testingCloud}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(212,175,55,0.15)',
                border: '1px solid var(--gold)',
                color: 'var(--gold2)',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: testingCloud ? 'not-allowed' : 'pointer'
              }}
            >
              {testingCloud ? <RefreshCw size={14} className="spin" /> : <Shield size={14} />}
              {testingCloud ? 'Testing Connection...' : 'Test Cloudinary Connection'}
            </button>
          </div>

          {/* Test Status Banner */}
          {cloudStatus && (
            <div
              style={{
                padding: '14px 18px',
                borderRadius: '10px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                background: cloudStatus.type === 'success' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                border: `1px solid ${cloudStatus.type === 'success' ? '#22c55e' : '#ef4444'}`,
                color: cloudStatus.type === 'success' ? '#86efac' : '#fca5a5',
                fontSize: '13px',
                lineHeight: 1.5
              }}
            >
              {cloudStatus.type === 'success' ? <CheckCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} /> : <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />}
              <div>{cloudStatus.message}</div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--gold)', display: 'block', marginBottom: '6px' }}>
                Cloud Name *
              </label>
              <input
                type="text"
                name="cloudinary_cloud_name"
                value={settings.cloudinary_cloud_name || ''}
                onChange={handleChange}
                placeholder="e.g. dxxxxxxxx (From Cloudinary Dashboard)"
                style={{ width: '100%', background: '#24061d', border: '1px solid var(--line)', color: '#fff', padding: '10px 14px', borderRadius: '8px', fontSize: '14px' }}
              />
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', marginTop: '4px', display: 'block' }}>
                Note: In your Cloudinary console, check your exact Cloud Name (often a short alphanumeric code).
              </span>
            </div>

            <div>
              <label style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--gold)', display: 'block', marginBottom: '6px' }}>
                API Key *
              </label>
              <input
                type="text"
                name="cloudinary_api_key"
                value={settings.cloudinary_api_key || ''}
                onChange={handleChange}
                placeholder="e.g. 486688659448394"
                style={{ width: '100%', background: '#24061d', border: '1px solid var(--line)', color: '#fff', padding: '10px 14px', borderRadius: '8px', fontSize: '14px' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--gold)', display: 'block', marginBottom: '6px' }}>
                API Secret *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showSecret ? 'text' : 'password'}
                  name="cloudinary_api_secret"
                  value={settings.cloudinary_api_secret || ''}
                  onChange={handleChange}
                  placeholder="Cloudinary API Secret"
                  style={{ width: '100%', background: '#24061d', border: '1px solid var(--line)', color: '#fff', padding: '10px 40px 10px 14px', borderRadius: '8px', fontSize: '14px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowSecret(!showSecret)}
                  style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--gold)', cursor: 'pointer' }}
                  title={showSecret ? 'Hide Secret' : 'Show Secret'}
                >
                  {showSecret ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '14px' }}>
          <button
            type="submit"
            disabled={saving}
            style={{
              background: 'linear-gradient(135deg, #f6dda0, #d4af37)',
              color: '#1a0418',
              border: 'none',
              padding: '12px 28px',
              borderRadius: '999px',
              fontWeight: 600,
              fontSize: '14px',
              cursor: saving ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {saving ? 'Saving & Syncing...' : 'Save Settings & Update Store'}
          </button>
        </div>
      </form>
    </div>
  );
}
