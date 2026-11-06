import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { settingsService } from '../services/api';

const DEFAULT_SETTINGS = {
  store_name: 'The Ethnic Edit',
  tagline: 'Tradition, Beautifully Curated.',
  contact_email: 'hello@theethnicedit.com',
  contact_phone: '+91 98765 43210',
  contact_hours: 'Mon–Sat, 10am–7pm IST',
  about_story: 'The Ethnic Edit brings together temple-inspired designs, antique gold finishes and delicate pearl work, curated for weddings, festivals and every moment worth celebrating.'
};

const StoreContext = createContext({
  storeSettings: DEFAULT_SETTINGS,
  storeName: DEFAULT_SETTINGS.store_name,
  refreshSettings: () => {},
  loading: false
});

export const StoreProvider = ({ children }) => {
  const [storeSettings, setStoreSettings] = useState(() => {
    try {
      const cached = localStorage.getItem('ethnic_store_settings');
      if (cached) return { ...DEFAULT_SETTINGS, ...JSON.parse(cached) };
    } catch (e) {}
    return DEFAULT_SETTINGS;
  });
  const [loading, setLoading] = useState(false);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await settingsService.getSettings();
      if (res && res.success && res.settings) {
        const merged = { ...DEFAULT_SETTINGS, ...res.settings };
        setStoreSettings(merged);
        try {
          localStorage.setItem('ethnic_store_settings', JSON.stringify(merged));
        } catch (e) {}
      }
    } catch (err) {
      console.warn('StoreContext settings fetch note:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();

    // Listen to custom local event dispatched when settings are updated in Admin
    const handleSettingsUpdate = () => {
      fetchSettings();
    };

    // Cross-tab synchronization via storage event
    const handleStorageChange = (e) => {
      if (e.key === 'ethnic_store_settings' && e.newValue) {
        try {
          setStoreSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(e.newValue) });
        } catch (err) {}
      }
    };

    window.addEventListener('store_settings_updated', handleSettingsUpdate);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('store_settings_updated', handleSettingsUpdate);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [fetchSettings]);

  // Dynamically update document title based on store name
  useEffect(() => {
    const name = storeSettings.store_name || DEFAULT_SETTINGS.store_name;
    document.title = `${name} · Handcrafted Temple & Antique Jewellery`;
  }, [storeSettings.store_name]);

  const value = {
    storeSettings,
    storeName: storeSettings.store_name || DEFAULT_SETTINGS.store_name,
    refreshSettings: fetchSettings,
    loading
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
};

export const useStore = () => useContext(StoreContext);
export default StoreContext;

