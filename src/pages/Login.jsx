import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Eye, EyeOff, ArrowLeft, ShieldCheck, CheckCircle2, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import '../EthnicEdit.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [forgotMsg, setForgotMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, logout, isAuthenticated, user } = useAuth();
  const { storeName } = useStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOutToHome = () => {
    logout();
    navigate('/');
  };

  // If redirect target was passed or stored
  const searchParams = new URLSearchParams(location.search);
  const redirectTarget = searchParams.get('redirect') || sessionStorage.getItem('tee_login_redirect') || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);

    try {
      const res = await login(email, password);
      if (res.success) {
        sessionStorage.removeItem('tee_login_redirect');
        if (res.user.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          // Ensure customer NEVER redirects to admin area
          const safeTarget = (redirectTarget && !redirectTarget.startsWith('/admin')) ? redirectTarget : '/';
          navigate(safeTarget);
        }
      } else {
        setError(res.message || 'Login failed. Please verify credentials.');
      }
    } catch (err) {
      setError(err.message || 'Invalid credentials. Please verify your email and password.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    if (!email) {
      setError('Please enter your email address to reset password.');
    } else {
      setForgotMsg(`Password reset instructions have been dispatched to ${email}.`);
      setTimeout(() => setForgotMsg(''), 4500);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'radial-gradient(ellipse at 50% 0%, rgba(111,31,78,0.5), transparent 70%), #12020e',
        padding: '24px',
        color: '#fff',
        position: 'relative'
      }}
    >
      {/* Top Controls: Back on Left, Sign Out on Right */}
      <div style={{ position: 'absolute', top: '24px', left: '24px' }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(255,240,208,0.08)',
            border: '1px solid var(--line)',
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
      </div>

      <div style={{ position: 'absolute', top: '24px', right: '24px' }}>
        <button
          onClick={handleSignOutToHome}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(239,68,68,0.12)',
            border: '1px solid rgba(239,68,68,0.4)',
            color: '#fca5a5',
            padding: '8px 16px',
            borderRadius: '999px',
            fontSize: '13px',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          title="Sign Out & Return Home"
        >
          <LogOut size={15} /> Sign Out
        </button>
      </div>

      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          background: 'linear-gradient(160deg, #3a0b2d, #230419)',
          border: '1px solid var(--line)',
          borderRadius: '24px',
          padding: '40px 32px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
          textAlign: 'center',
          marginTop: '20px'
        }}
      >
        <Link to="/" style={{ textDecoration: 'none' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(135deg, #f6dda0, #d4af37)', margin: '0 auto 16px', display: 'grid', placeItems: 'center', color: '#1a0418', fontSize: '24px', fontWeight: 'bold' }}>
            ✦
          </div>
          <h2 style={{ fontSize: '26px', fontFamily: 'var(--font-serif)', color: 'var(--gold2)', letterSpacing: '0.06em', margin: 0 }}>
            {storeName}
          </h2>
          <span style={{ fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--gold)', opacity: 0.8, display: 'block', marginTop: '4px', marginBottom: '24px' }}>
            Client Sign In · Imitation Jewellery
          </span>
        </Link>

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid #ef4444', color: '#fca5a5', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', marginBottom: '20px', textAlign: 'left' }}>
            {error}
          </div>
        )}

        {forgotMsg && (
          <div style={{ background: 'rgba(34,197,94,0.2)', border: '1px solid #22c55e', color: '#86efac', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', marginBottom: '20px', textAlign: 'left' }}>
            {forgotMsg}
          </div>
        )}

        {isAuthenticated && (
          <div style={{ background: 'rgba(212,175,55,0.12)', border: '1px solid var(--gold)', borderRadius: '14px', padding: '14px', marginBottom: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '13px', color: 'var(--gold2)' }}>
              Currently signed in as <b>{user?.name || user?.email}</b>
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '10px' }}>
              <button
                type="button"
                onClick={handleSignOutToHome}
                style={{
                  background: 'rgba(239,68,68,0.2)',
                  border: '1px solid #ef4444',
                  color: '#fca5a5',
                  padding: '6px 14px',
                  borderRadius: '999px',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                Sign Out to Home
              </button>
              <Link
                to="/"
                style={{
                  background: 'linear-gradient(135deg, #f6dda0, #d4af37)',
                  color: '#1a0418',
                  padding: '6px 14px',
                  borderRadius: '999px',
                  fontSize: '12px',
                  fontWeight: 600,
                  textDecoration: 'none'
                }}
              >
                Storefront →
              </Link>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
          {/* Email */}
          <div>
            <label style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--gold)', display: 'block', marginBottom: '6px' }}>
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', background: 'rgba(255,240,208,0.06)', border: '1px solid var(--line)', color: '#fff', fontSize: '14px', boxSizing: 'border-box' }}
            />
          </div>

          {/* Password with Eye Icon */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--gold)' }}>
                Password
              </label>
              <button
                type="button"
                onClick={handleForgotPassword}
                style={{ background: 'none', border: 'none', color: 'var(--gold2)', fontSize: '11px', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}
              >
                Forgot Password?
              </button>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ width: '100%', padding: '12px 42px 12px 16px', borderRadius: '12px', background: 'rgba(255,240,208,0.06)', border: '1px solid var(--line)', color: '#fff', fontSize: '14px', boxSizing: 'border-box' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--gold)',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: 0.8
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="gbtn"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', marginTop: '6px', padding: '14px', fontSize: '14px' }}
          >
            {loading ? 'Signing In...' : 'Sign In to Account →'}
          </button>
        </form>

        {/* At the bottom: Create Account Option */}
        <div style={{ marginTop: '24px', fontSize: '13px', opacity: 0.9, borderTop: '1px solid rgba(212,175,55,0.15)', paddingTop: '16px' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--gold2)', textDecoration: 'underline', fontWeight: 600 }}>
            Create Account
          </Link>
        </div>

        <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
          <Link to="/" style={{ color: 'var(--gold)', opacity: 0.8, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <ArrowLeft size={13} /> Back to Landing Page
          </Link>
          <button
            type="button"
            onClick={handleSignOutToHome}
            style={{
              background: 'none',
              border: 'none',
              color: '#fca5a5',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '12px'
            }}
            title="Sign Out of Session"
          >
            <LogOut size={13} /> Sign Out
          </button>
        </div>
      </div>

      <div style={{ marginTop: '24px', fontSize: '12px', opacity: 0.6 }}>
        Powered by{' '}
        <a href="https://www.aminoid.in/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--gold2)', textDecoration: 'underline' }}>
          Aminoid
        </a>
      </div>
    </div>
  );
}
