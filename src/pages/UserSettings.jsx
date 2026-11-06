import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';
import { authService } from '../services/api';
import { 
  ArrowLeft, User, Mail, Phone, MapPin, Lock, Globe, Check, Eye, EyeOff, ShieldCheck, LogOut 
} from 'lucide-react';
import '../EthnicEdit.css';

export default function UserSettings() {
  const { user, isAuthenticated, updateUser, logout } = useAuth();
  const { lang, setLang, t, isTamil } = useLanguage();
  const { cartCount } = useCart();
  const { storeSettings, storeName } = useStore();
  const navigate = useNavigate();

  // Profile Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');
  const [profileErrorMsg, setProfileErrorMsg] = useState('');

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordSuccessMsg, setPasswordSuccessMsg] = useState('');
  const [passwordErrorMsg, setPasswordErrorMsg] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setAddress(user.address || '');
    }
  }, [user, isAuthenticated, navigate]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileSuccessMsg('');
    setProfileErrorMsg('');
    setSavingProfile(true);

    try {
      const res = await authService.updateProfile({
        name,
        phone,
        address
      });

      if (res.success && res.user) {
        updateUser(res.user);
        setProfileSuccessMsg(t('profileUpdateSuccess', 'Personal details updated successfully!'));
        setTimeout(() => setProfileSuccessMsg(''), 4500);
      } else {
        setProfileErrorMsg(res.message || 'Failed to update personal details.');
      }
    } catch (err) {
      setProfileErrorMsg(err.message || 'Failed to update personal details.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPasswordSuccessMsg('');
    setPasswordErrorMsg('');

    if (!currentPassword) {
      setPasswordErrorMsg(t('fillCurrentPassword', 'Please enter your current password.'));
      return;
    }
    if (newPassword.length < 6) {
      setPasswordErrorMsg(isTamil ? 'புதிய கடவுச்சொல் குறைந்தது 6 எழுத்துகள் கொண்டிருக்க வேண்டும்.' : 'New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordErrorMsg(t('passwordMismatch', 'New passwords do not match.'));
      return;
    }

    setSavingPassword(true);
    try {
      const res = await authService.updateProfile({
        currentPassword,
        newPassword
      });

      if (res.success) {
        setPasswordSuccessMsg(t('passwordUpdateSuccess', 'Password changed successfully!'));
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setPasswordSuccessMsg(''), 4500);
      } else {
        setPasswordErrorMsg(res.message || 'Failed to change password.');
      }
    } catch (err) {
      setPasswordErrorMsg(err.message || 'Current password incorrect or update failed.');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)', color: 'var(--cream)' }}>
      {/* Navbar */}
      <header className="nav sc" style={{ position: 'sticky', top: 0, zIndex: 100 }}>
        <Link className="brand" to="/" aria-label={`${storeName} home`}>
          <span className="logo"></span>
          <span>
            <b>{storeName}</b>
            <small>{storeSettings.tagline || t('heroSubtitle', 'Tradition, Beautifully Curated.')}</small>
          </span>
        </Link>
        <nav className="menu open" style={{ display: 'flex' }}>
          <Link to="/">{t('home', 'Home')}</Link>
          <Link to="/shop">{t('catalogue', 'Catalogue')}</Link>
          <Link to="/orders">{t('myOrders', 'My Orders')}</Link>
          <Link to="/settings" style={{ color: 'var(--gold2)', fontWeight: 600 }}>{t('settings', 'Settings')}</Link>
          <Link to="/cart">{t('bag', 'Bag')} ({cartCount})</Link>
        </nav>
        <div className="tools" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={handleLogout} title={t('signOut', 'Sign Out')} style={{ color: 'var(--gold)', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', background: 'none', border: 'none', cursor: 'pointer' }}>
            <LogOut size={16} /> {t('signOut', 'Sign Out')}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ flex: 1, maxWidth: '960px', width: '100%', margin: '0 auto', padding: '36px 20px' }}>
        {/* Back Button */}
        <div style={{ marginBottom: '24px' }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(255,240,208,0.06)',
              border: '1px solid var(--line)',
              color: 'var(--gold2)',
              padding: '8px 18px',
              borderRadius: '999px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <ArrowLeft size={16} /> {t('adminBack', 'Back')}
          </button>
        </div>

        {/* Page Title */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(32px, 3.5vw, 44px)', fontWeight: 500, color: 'var(--gold2)', marginBottom: '8px' }}>
            {t('userSettingsTitle', 'User Settings & Profile')}
          </h1>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '15px', color: 'rgba(255,240,208,0.7)', lineHeight: 1.6 }}>
            {t('userSettingsSub', 'Manage your personal details, language preference, and account security.')}
          </p>
        </div>

        <div style={{ display: 'grid', gap: '28px' }}>
          {/* SECTION 1: LANGUAGE PREFERENCE */}
          <section
            style={{
              background: 'linear-gradient(135deg, rgba(38,5,29,0.7), rgba(18,2,14,0.9))',
              border: '1px solid var(--line)',
              borderRadius: '18px',
              padding: '28px',
              boxShadow: '0 12px 36px rgba(0,0,0,0.4)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(229,189,114,0.15)', display: 'grid', placeItems: 'center', color: 'var(--gold)' }}>
                <Globe size={20} />
              </div>
              <div>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', fontWeight: 500, color: 'var(--gold2)' }}>
                  {t('langSectionTitle', 'Language Preference')}
                </h2>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'rgba(255,240,208,0.65)' }}>
                  {t('langSectionSub', 'Choose your preferred language across the entire website and admin panel.')}
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginTop: '20px' }}>
              {/* English Card */}
              <button
                type="button"
                onClick={() => setLang('en')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 20px',
                  borderRadius: '14px',
                  border: lang === 'en' ? '2px solid var(--gold)' : '1px solid rgba(229,189,114,0.2)',
                  background: lang === 'en' ? 'rgba(229,189,114,0.14)' : 'rgba(255,240,208,0.03)',
                  color: lang === 'en' ? 'var(--gold2)' : 'var(--cream)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s'
                }}
              >
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    🇬🇧 English
                  </div>
                  <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '2px' }}>Default global format</div>
                </div>
                {lang === 'en' && <Check size={18} style={{ color: 'var(--gold)' }} />}
              </button>

              {/* Tamil Card */}
              <button
                type="button"
                onClick={() => setLang('ta')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 20px',
                  borderRadius: '14px',
                  border: lang === 'ta' ? '2px solid var(--gold)' : '1px solid rgba(229,189,114,0.2)',
                  background: lang === 'ta' ? 'rgba(229,189,114,0.14)' : 'rgba(255,240,208,0.03)',
                  color: lang === 'ta' ? 'var(--gold2)' : 'var(--cream)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s'
                }}
              >
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    🇮🇳 தமிழ் (Tamil)
                  </div>
                  <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '2px' }}>தமிழ் மொழி வடிவம்</div>
                </div>
                {lang === 'ta' && <Check size={18} style={{ color: 'var(--gold)' }} />}
              </button>
            </div>
          </section>

          {/* SECTION 2: PERSONAL INFORMATION */}
          <section
            style={{
              background: 'linear-gradient(135deg, rgba(38,5,29,0.7), rgba(18,2,14,0.9))',
              border: '1px solid var(--line)',
              borderRadius: '18px',
              padding: '28px',
              boxShadow: '0 12px 36px rgba(0,0,0,0.4)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(229,189,114,0.15)', display: 'grid', placeItems: 'center', color: 'var(--gold)' }}>
                <User size={20} />
              </div>
              <div>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', fontWeight: 500, color: 'var(--gold2)' }}>
                  {t('personalSectionTitle', 'Personal Information')}
                </h2>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'rgba(255,240,208,0.65)' }}>
                  {t('personalSectionSub', 'Update your contact information and default delivery address.')}
                </p>
              </div>
            </div>

            {profileSuccessMsg && (
              <div style={{ margin: '16px 0', padding: '12px 18px', borderRadius: '10px', background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', color: '#4ade80', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check size={18} /> {profileSuccessMsg}
              </div>
            )}

            {profileErrorMsg && (
              <div style={{ margin: '16px 0', padding: '12px 18px', borderRadius: '10px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', fontSize: '14px' }}>
                {profileErrorMsg}
              </div>
            )}

            <form onSubmit={handleSaveProfile} style={{ display: 'grid', gap: '18px', marginTop: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
                {/* Full Name */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--gold2)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    {t('fullName', 'Full Name')} *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={t('namePlaceholder', 'Your Full Name')}
                      style={{
                        width: '100%',
                        padding: '12px 16px 12px 42px',
                        background: 'rgba(255,240,208,0.06)',
                        border: '1px solid var(--line)',
                        borderRadius: '12px',
                        color: 'var(--cream)',
                        fontSize: '14px'
                      }}
                    />
                    <User size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gold)', opacity: 0.7 }} />
                  </div>
                </div>

                {/* Email Address */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--gold2)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    {t('emailAddress', 'Email Address')} ({isTamil ? 'உள்நுழைவு ஐடி' : 'Login ID'})
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="email"
                      disabled
                      value={email}
                      style={{
                        width: '100%',
                        padding: '12px 16px 12px 42px',
                        background: 'rgba(255,240,208,0.03)',
                        border: '1px solid rgba(229,189,114,0.15)',
                        borderRadius: '12px',
                        color: 'rgba(255,240,208,0.5)',
                        fontSize: '14px',
                        cursor: 'not-allowed'
                      }}
                    />
                    <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gold)', opacity: 0.4 }} />
                  </div>
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--gold2)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {t('phoneNumber', 'Phone Number')}
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    style={{
                      width: '100%',
                      padding: '12px 16px 12px 42px',
                      background: 'rgba(255,240,208,0.06)',
                      border: '1px solid var(--line)',
                      borderRadius: '12px',
                      color: 'var(--cream)',
                      fontSize: '14px'
                    }}
                  />
                  <Phone size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gold)', opacity: 0.7 }} />
                </div>
              </div>

              {/* Delivery Address */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--gold2)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {t('shippingAddress', 'Default Shipping / Delivery Address')}
                </label>
                <div style={{ position: 'relative' }}>
                  <textarea
                    rows={3}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder={isTamil ? 'வீட்டு எண், தெரு முகவரி, நகரம், அஞ்சல் குறியீடு...' : 'House No., Apartment, Street, City, State, PIN code...'}
                    style={{
                      width: '100%',
                      padding: '12px 16px 12px 42px',
                      background: 'rgba(255,240,208,0.06)',
                      border: '1px solid var(--line)',
                      borderRadius: '12px',
                      color: 'var(--cream)',
                      fontSize: '14px',
                      resize: 'vertical'
                    }}
                  />
                  <MapPin size={16} style={{ position: 'absolute', left: '14px', top: '16px', color: 'var(--gold)', opacity: 0.7 }} />
                </div>
              </div>

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="gbtn"
                  style={{
                    padding: '12px 28px',
                    fontSize: '13.5px',
                    fontWeight: 600,
                    cursor: savingProfile ? 'not-allowed' : 'pointer',
                    opacity: savingProfile ? 0.7 : 1
                  }}
                >
                  {savingProfile ? t('saving', 'Saving Changes...') : t('saveProfileBtn', 'Save Personal Details')}
                </button>
              </div>
            </form>
          </section>

          {/* SECTION 3: ACCOUNT SECURITY & PASSWORD */}
          <section
            style={{
              background: 'linear-gradient(135deg, rgba(38,5,29,0.7), rgba(18,2,14,0.9))',
              border: '1px solid var(--line)',
              borderRadius: '18px',
              padding: '28px',
              boxShadow: '0 12px 36px rgba(0,0,0,0.4)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(229,189,114,0.15)', display: 'grid', placeItems: 'center', color: 'var(--gold)' }}>
                <ShieldCheck size={20} />
              </div>
              <div>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', fontWeight: 500, color: 'var(--gold2)' }}>
                  {t('securitySectionTitle', 'Account Security')}
                </h2>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'rgba(255,240,208,0.65)' }}>
                  {t('securitySectionSub', 'Change your login password securely.')}
                </p>
              </div>
            </div>

            {passwordSuccessMsg && (
              <div style={{ margin: '16px 0', padding: '12px 18px', borderRadius: '10px', background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', color: '#4ade80', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check size={18} /> {passwordSuccessMsg}
              </div>
            )}

            {passwordErrorMsg && (
              <div style={{ margin: '16px 0', padding: '12px 18px', borderRadius: '10px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', fontSize: '14px' }}>
                {passwordErrorMsg}
              </div>
            )}

            <form onSubmit={handleUpdatePassword} style={{ display: 'grid', gap: '18px', marginTop: '20px' }}>
              {/* Current Password */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--gold2)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {t('currentPasswordLabel', 'Current Password')} *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{
                      width: '100%',
                      padding: '12px 42px 12px 42px',
                      background: 'rgba(255,240,208,0.06)',
                      border: '1px solid var(--line)',
                      borderRadius: '12px',
                      color: 'var(--cream)',
                      fontSize: '14px'
                    }}
                  />
                  <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gold)', opacity: 0.7 }} />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gold)', opacity: 0.8 }}
                  >
                    {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* New Password & Confirm Password */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--gold2)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    {t('newPasswordLabel', 'New Password')} *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      style={{
                        width: '100%',
                        padding: '12px 42px 12px 42px',
                        background: 'rgba(255,240,208,0.06)',
                        border: '1px solid var(--line)',
                        borderRadius: '12px',
                        color: 'var(--cream)',
                        fontSize: '14px'
                      }}
                    />
                    <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gold)', opacity: 0.7 }} />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gold)', opacity: 0.8 }}
                    >
                      {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--gold2)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    {t('confirmPasswordLabel', 'Confirm New Password')} *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      style={{
                        width: '100%',
                        padding: '12px 42px 12px 42px',
                        background: 'rgba(255,240,208,0.06)',
                        border: '1px solid var(--line)',
                        borderRadius: '12px',
                        color: 'var(--cream)',
                        fontSize: '14px'
                      }}
                    />
                    <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gold)', opacity: 0.7 }} />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gold)', opacity: 0.8 }}
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={savingPassword}
                  className="gbtn"
                  style={{
                    padding: '12px 28px',
                    fontSize: '13.5px',
                    fontWeight: 600,
                    cursor: savingPassword ? 'not-allowed' : 'pointer',
                    opacity: savingPassword ? 0.7 : 1
                  }}
                >
                  {savingPassword ? t('updatingPassword', 'Updating Password...') : t('updatePasswordBtn', 'Update Password')}
                </button>
              </div>
            </form>
          </section>

          {/* SECTION 4: ACCOUNT ACTIONS & SIGN OUT */}
          <section
            style={{
              background: 'linear-gradient(135deg, rgba(38,5,29,0.7), rgba(18,2,14,0.9))',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '18px',
              padding: '24px 28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '20px',
              flexWrap: 'wrap'
            }}
          >
            <div>
              <h3 style={{ fontSize: '18px', color: '#fca5a5', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <LogOut size={18} /> {isTamil ? 'கணக்கிலிருந்து வெளியேறு' : 'Sign Out of Account'}
              </h3>
              <p style={{ margin: 0, fontSize: '13px', opacity: 0.75 }}>
                {isTamil ? 'உங்கள் அமர்வை முடித்து முகப்புப் பக்கத்திற்குத் திரும்பவும்.' : 'Safely end your current session and return to the main storefront.'}
              </p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                borderRadius: '999px',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid #ef4444',
                color: '#fca5a5',
                fontSize: '13.5px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <LogOut size={16} /> {isTamil ? 'வெளியேறு' : 'Sign Out & Return Home'}
            </button>
          </section>
        </div>
      </main>
    </div>
  );
}

