import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useStore } from '../context/StoreContext';
import DashboardOverview from './DashboardOverview';
import ProductManagement from './ProductManagement';
import CategoryManagement from './CategoryManagement';
import BannerManagement from './BannerManagement';
import OrderManagement from './OrderManagement';
import InventoryManagement from './InventoryManagement';
import CustomerManagement from './CustomerManagement';
import CouponManagement from './CouponManagement';
import SettingsManagement from './SettingsManagement';

export default function AdminLayout() {
  const { user, isAdmin, loading, logout } = useAuth();
  const { lang, setLang, t, isTamil } = useLanguage();
  const { storeName } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('overview');
  const [tabHistory, setTabHistory] = useState(['overview']);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedCategoryForProducts, setSelectedCategoryForProducts] = useState('all');

  const handleSelectTab = (tabId) => {
    if (tabId !== activeTab) {
      setTabHistory((prev) => [...prev, tabId]);
      setActiveTab(tabId);
      navigate(`/admin/${tabId}`);
    }
  };

  const handleViewCategoryProducts = (catId) => {
    setSelectedCategoryForProducts(catId ? catId.toString() : 'all');
    handleSelectTab('products');
  };

  const handleAdminBack = () => {
    if (tabHistory.length > 1) {
      const nextHist = [...tabHistory];
      nextHist.pop(); // remove current active tab
      const prevTab = nextHist[nextHist.length - 1];
      setTabHistory(nextHist);
      setActiveTab(prevTab);
      navigate(`/admin/${prevTab}`);
    } else {
      // Already at root of admin dashboard; stay on overview, NEVER leave to '/'
      setActiveTab('overview');
      navigate('/admin/dashboard');
    }
  };

  const navItems = [
    { id: 'overview', label: t('adminDashboard', 'Dashboard'), icon: '📊' },
    { id: 'products', label: t('adminProducts', 'Products'), icon: '💎' },
    { id: 'categories', label: t('adminCategories', 'Collections / Categories'), icon: '📂' },
    { id: 'banners', label: t('adminBanners', 'Banners & Hero Media'), icon: '🖼️' },
    { id: 'orders', label: t('adminOrders', 'Orders & Shipments'), icon: '📦' },
    { id: 'inventory', label: t('adminInventory', 'Inventory & Stock'), icon: '📋' },
    { id: 'customers', label: t('adminCustomers', 'Customers'), icon: '👥' },
    { id: 'coupons', label: t('adminCoupons', 'Coupons & Offers'), icon: '🏷️' },
    { id: 'settings', label: t('adminSettings', 'Settings'), icon: '⚙️' }
  ];

  useEffect(() => {
    const segment = location.pathname.split('/').filter(Boolean)[1];
    if (segment && navItems.some((n) => n.id === segment)) {
      setActiveTab(segment);
    }
  }, [location.pathname]);

  useEffect(() => {
    // If not loading and not admin, redirect to admin login
    if (!loading && !isAdmin) {
      navigate('/admin/login');
    }
  }, [isAdmin, loading, navigate]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#12020e', color: 'var(--gold2)' }}>
        Loading Admin Management Console...
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#12020e', color: '#fff', fontFamily: 'var(--font-sans)' }}>
      {/* Sidebar */}
      <aside
        style={{
          width: '280px',
          background: 'linear-gradient(180deg, #24061d, #190314)',
          borderRight: '1px solid var(--line)',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          zIndex: 90,
          transition: 'transform 0.3s ease',
          transform: window.innerWidth < 900 && !sidebarOpen ? 'translateX(-100%)' : 'none'
        }}
      >
        {/* Brand header */}
        <div style={{ padding: '24px 20px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #f6dda0, #d4af37)', display: 'grid', placeItems: 'center', color: '#1a0418', fontWeight: 'bold' }}>
            ✦
          </div>
          <div>
            <b style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', color: 'var(--gold2)', letterSpacing: '0.08em', display: 'block' }}>
              {storeName}
            </b>
            <small style={{ color: 'var(--gold)', opacity: 0.75, fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              {t('adminConsole', 'Management Console')}
            </small>
          </div>
        </div>

        {/* Navigation list */}
        <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  handleSelectTab(item.id);
                  setSidebarOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: isActive ? '1px solid var(--gold)' : '1px solid transparent',
                  background: isActive ? 'rgba(212,175,55,0.18)' : 'none',
                  color: isActive ? 'var(--gold2)' : 'var(--cream)',
                  fontSize: '14px',
                  fontWeight: isActive ? 600 : 400,
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <span style={{ fontSize: '16px' }}>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer actions in sidebar */}
        <div style={{ padding: '14px 16px', borderTop: '1px solid var(--line)', display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={handleAdminBack}
            style={{
              flex: 1,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '9px 12px',
              borderRadius: '999px',
              border: '1px solid var(--gold)',
              background: 'rgba(212,175,55,0.08)',
              color: 'var(--gold2)',
              fontSize: '12px',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
            title={t('adminBack', 'Go Back')}
          >
            <ArrowLeft size={14} /> {t('adminBack', 'Back')}
          </button>
          <button
            onClick={() => {
              logout();
              navigate('/admin/login');
            }}
            style={{
              flex: 1,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '9px 12px',
              borderRadius: '999px',
              background: 'rgba(239,68,68,0.15)',
              border: '1px solid rgba(239,68,68,0.4)',
              color: '#fca5a5',
              fontSize: '12px',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
            title={t('adminSignOut', 'Sign Out')}
          >
            {t('adminSignOut', 'Sign Out')}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main
        style={{
          flex: 1,
          marginLeft: window.innerWidth < 900 ? 0 : '280px',
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          background: '#12020e'
        }}
      >
        {/* Top Navbar */}
        <header
          style={{
            height: '70px',
            background: 'rgba(28,4,22,0.95)',
            borderBottom: '1px solid var(--line)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 28px',
            position: 'sticky',
            top: 0,
            zIndex: 80
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{
                display: window.innerWidth < 900 ? 'block' : 'none',
                background: 'none',
                border: 0,
                color: 'var(--gold)',
                fontSize: '22px',
                cursor: 'pointer'
              }}
            >
              ☰
            </button>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', fontWeight: 500, color: 'var(--gold2)' }}>
              {navItems.find((n) => n.id === activeTab)?.label}
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '13px', color: 'var(--cream)', opacity: 0.85, marginRight: '4px' }}>
              {t('adminLoggedInAs', 'Logged in as')} <b style={{ color: 'var(--gold2)' }}>{user?.name || (isTamil ? 'நிர்வாகி' : 'Administrator')}</b>
            </span>
            <button
              onClick={handleAdminBack}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(255,240,208,0.08)',
                border: '1px solid var(--line)',
                color: 'var(--gold2)',
                padding: '6px 14px',
                borderRadius: '999px',
                fontSize: '12px',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
              title={t('adminBack', 'Go Back')}
            >
              <ArrowLeft size={14} /> {t('adminBack', 'Back')}
            </button>
            <button
              onClick={() => {
                logout();
                navigate('/admin/login');
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(239,68,68,0.15)',
                border: '1px solid rgba(239,68,68,0.4)',
                color: '#fca5a5',
                padding: '6px 14px',
                borderRadius: '999px',
                fontSize: '12px',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
              title={t('adminSignOut', 'Sign Out')}
            >
              {t('adminSignOut', 'Sign Out')}
            </button>
          </div>
        </header>

        {/* Tab Content Container */}
        <div style={{ padding: '28px', flex: 1, overflowY: 'auto' }}>
          {activeTab === 'overview' && <DashboardOverview onNavigate={handleSelectTab} onBack={handleAdminBack} />}
          {activeTab === 'products' && (
            <ProductManagement
              initialCategory={selectedCategoryForProducts}
              onClearCategory={() => setSelectedCategoryForProducts('all')}
              onBack={handleAdminBack}
            />
          )}
          {activeTab === 'categories' && <CategoryManagement onViewProducts={handleViewCategoryProducts} onBack={handleAdminBack} />}
          {activeTab === 'banners' && <BannerManagement onBack={handleAdminBack} />}
          {activeTab === 'orders' && <OrderManagement onBack={handleAdminBack} />}
          {activeTab === 'inventory' && <InventoryManagement onBack={handleAdminBack} />}
          {activeTab === 'customers' && <CustomerManagement onBack={handleAdminBack} />}
          {activeTab === 'coupons' && <CouponManagement onBack={handleAdminBack} />}
          {activeTab === 'settings' && <SettingsManagement onBack={handleAdminBack} />}
        </div>
      </main>
    </div>
  );
}

