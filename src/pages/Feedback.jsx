import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Star, CheckCircle2, ShieldCheck, MessageSquare, Sparkles, Send, Upload, Image, X } from 'lucide-react';
import { reviewService } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { useStore } from '../context/StoreContext';
import '../EthnicEdit.css';

export default function Feedback() {
  const navigate = useNavigate();
  const { t, isTamil } = useLanguage();
  const { storeSettings, storeName } = useStore();

  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [location, setLocation] = useState('');
  const [productName, setProductName] = useState('Temple Lakshmi Necklace');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const loadReviews = () => {
    setLoadingReviews(true);
    reviewService.getReviews({ limit: 20 })
      .then((res) => {
        if (res.success && res.reviews) {
          setReviews(res.reviews);
        }
      })
      .catch((err) => {
        console.warn('Reviews fetch warning:', err.message);
      })
      .finally(() => {
        setLoadingReviews(false);
      });
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Instant local preview
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);

    setUploadingImage(true);
    try {
      const form = new FormData();
      form.append('image', file);
      const res = await reviewService.uploadImage(form);
      if (res && res.url) {
        setImageUrl(res.url);
      }
    } catch (err) {
      console.warn('Review image upload warning:', err.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setImageUrl('');
    setImagePreview('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!customerName.trim()) {
      setErrorMessage(isTamil ? 'தயவுசெய்து உங்கள் பெயரை உள்ளிடவும்.' : 'Please enter your name.');
      return;
    }

    if (!comment.trim()) {
      setErrorMessage(isTamil ? 'தயவுசெய்து உங்கள் மதிப்புரைக் குறிப்பை உள்ளிடவும்.' : 'Please write your review feedback.');
      return;
    }

    setSubmitting(true);
    try {
      const finalImage = imageUrl || imagePreview || null;
      const res = await reviewService.createReview({
        customer_name: customerName,
        location: location || 'Verified Patron',
        product_name: productName,
        rating,
        comment,
        image_url: finalImage
      });

      if (res.success) {
        setSuccessMessage(
          isTamil
            ? '✨ உங்கள் மதிப்புரைக்கு நன்றி! அது இப்போது முகப்புப் பக்கத்தில் நேரடியாகத் தெரியும்.'
            : '✨ Thank you for your review! It is now live on our storefront customer review wall.'
        );
        setCustomerName('');
        setLocation('');
        setComment('');
        setImageUrl('');
        setImagePreview('');
        setRating(5);
        loadReviews();
        setTimeout(() => setSuccessMessage(''), 6000);
      } else {
        setErrorMessage(res.message || 'Failed to submit review.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Error submitting review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'radial-gradient(ellipse at 50% 0%, rgba(111,31,78,0.45), transparent 60%), #12020e', color: 'var(--cream)' }}>
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
          <span style={{ color: 'var(--gold2)', fontWeight: 600 }}>{isTamil ? 'வாடிக்கையாளர் மதிப்புரைகள்' : 'Reviews & Feedback'}</span>
        </nav>
      </header>

      {/* Main Container */}
      <main style={{ flex: 1, maxWidth: '1080px', width: '100%', margin: '0 auto', padding: '36px 20px' }}>
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
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <ArrowLeft size={16} /> {t('adminBack', 'Back')}
          </button>
        </div>

        {/* Section Header */}
        <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 40px' }}>
          <div className="kick" style={{ justifyContent: 'center', marginBottom: '10px' }}>
            {isTamil ? 'வாடிக்கையாளர் கருத்து' : 'Wall of Love & Reviews'}
          </div>
          <h1 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 'clamp(32px, 4.5vw, 48px)', color: 'var(--gold2)', margin: '0 0 12px' }}>
            {isTamil ? 'எங்கள் வாடிக்கையாளர் மதிப்புரைகள்' : 'What Our Patrons Say'}
          </h1>
          <p style={{ fontSize: '15px', opacity: 0.85, margin: 0 }}>
            {isTamil
              ? 'எங்கள் பாரம்பரிய கோயில் மற்றும் ஆண்டிக் நகைகளை அணிந்த ஆயிரக்கணக்கான வாடிக்கையாளர்களின் அனுபவங்கள்.'
              : 'Read genuine verified reviews from collectors across India, or share your own jewellery story with us.'}
          </p>

          {/* Average Rating Banner */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: 'rgba(212,175,55,0.12)', border: '1px solid var(--gold)', borderRadius: '999px', padding: '8px 20px', marginTop: '18px' }}>
            <div style={{ display: 'flex', color: 'var(--gold2)', gap: '3px' }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={15} fill="var(--gold)" color="var(--gold)" />
              ))}
            </div>
            <span style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--gold2)' }}>
              4.9 / 5.0 Rating · 10,000+ Verified Patrons
            </span>
          </div>
        </div>

        {/* Feedback Layout: Form on Left, Live Reviews on Right */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px', alignItems: 'start' }}>
          {/* Form Card */}
          <section
            style={{
              background: 'linear-gradient(160deg, #320726, #1c0316)',
              border: '1px solid var(--line)',
              borderRadius: '24px',
              padding: '32px',
              boxShadow: '0 16px 48px rgba(0,0,0,0.5)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(229,189,114,0.15)', display: 'grid', placeItems: 'center', color: 'var(--gold)' }}>
                <MessageSquare size={18} />
              </div>
              <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '24px', color: 'var(--gold2)', margin: 0 }}>
                {isTamil ? 'உங்கள் மதிப்புரையைப் பகிரவும்' : 'Write a Review'}
              </h2>
            </div>
            <p style={{ fontSize: '13px', opacity: 0.75, marginBottom: '22px' }}>
              {isTamil
                ? 'உங்கள் அனுபவம் மற்ற வாங்குபவர்களுக்கு உதவும். உங்கள் மதிப்புரை உடனடியாக முகப்புப் பக்கத்தில் தோன்றும்.'
                : 'Help others choose timeless elegance. Your review will display directly on our storefront.'}
            </p>

            {successMessage && (
              <div style={{ background: 'rgba(34,197,94,0.18)', border: '1px solid #22c55e', color: '#86efac', padding: '12px 16px', borderRadius: '12px', fontSize: '13px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CheckCircle2 size={18} />
                <span>{successMessage}</span>
              </div>
            )}

            {errorMessage && (
              <div style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid #ef4444', color: '#fca5a5', padding: '12px 16px', borderRadius: '12px', fontSize: '13px', marginBottom: '20px' }}>
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Star Rating Selector */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--gold2)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {isTamil ? 'மதிப்பீடு' : 'Your Rating'} *
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {[1, 2, 3, 4, 5].map((starIndex) => (
                    <button
                      type="button"
                      key={starIndex}
                      onClick={() => setRating(starIndex)}
                      onMouseEnter={() => setHoverRating(starIndex)}
                      onMouseLeave={() => setHoverRating(0)}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: '4px',
                        cursor: 'pointer',
                        color: starIndex <= (hoverRating || rating) ? 'var(--gold)' : 'rgba(255,240,208,0.2)',
                        transition: 'transform 0.15s'
                      }}
                      title={`${starIndex} Star${starIndex > 1 ? 's' : ''}`}
                    >
                      <Star
                        size={28}
                        fill={starIndex <= (hoverRating || rating) ? 'var(--gold)' : 'transparent'}
                      />
                    </button>
                  ))}
                  <span style={{ fontSize: '13px', color: 'var(--gold2)', marginLeft: '8px', fontWeight: 600 }}>
                    {rating} / 5 Stars
                  </span>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--gold2)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {isTamil ? 'முழு பெயர்' : 'Full Name'} *
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Priya Sundaram"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'rgba(255,240,208,0.06)',
                    border: '1px solid var(--line)',
                    borderRadius: '12px',
                    color: 'var(--cream)',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* City / Location */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--gold2)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {isTamil ? 'நகரம் / இருப்பிடம்' : 'City / Location'}
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Chennai, Tamil Nadu"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'rgba(255,240,208,0.06)',
                    border: '1px solid var(--line)',
                    borderRadius: '12px',
                    color: 'var(--cream)',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Piece Purchased */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--gold2)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {isTamil ? 'வாங்கிய நகைப் பொருள்' : 'Jewellery Piece Reviewed'}
                </label>
                <select
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: '#200318',
                    border: '1px solid var(--line)',
                    borderRadius: '12px',
                    color: 'var(--cream)',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="Temple Lakshmi Necklace">Temple Lakshmi Necklace</option>
                  <option value="Pearl Jhumka Earrings">Pearl Jhumka Earrings</option>
                  <option value="Antique Gold Kada Bangles">Antique Gold Kada Bangles</option>
                  <option value="Gemstone Cocktail Ring">Gemstone Cocktail Ring</option>
                  <option value="Temple Waist Belt (Ottiyanam)">Temple Waist Belt (Ottiyanam)</option>
                  <option value="Heirloom Bridal Jewellery Set">Heirloom Bridal Jewellery Set</option>
                  <option value="General Store Experience">General Store & Delivery Experience</option>
                </select>
              </div>

              {/* Comment / Review */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--gold2)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {isTamil ? 'உங்கள் கருத்து' : 'Your Detailed Experience'} *
                </label>
                <textarea
                  required
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={
                    isTamil
                      ? 'நகையின் தரம், பளபளப்பு, பூச்சு மற்றும் பேக்கேஜிங் பற்றிய உங்கள் அனுபவத்தைப் பகிரவும்...'
                      : 'Share your thoughts on the gold finish, stone craftsmanship, packaging and overall elegance...'
                  }
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'rgba(255,240,208,0.06)',
                    border: '1px solid var(--line)',
                    borderRadius: '12px',
                    color: 'var(--cream)',
                    fontSize: '14px',
                    resize: 'vertical',
                    boxSizing: 'border-box',
                    lineHeight: '1.5'
                  }}
                />
              </div>

              {/* Optional Photo Upload */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--gold2)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {isTamil ? 'புகைப்படம் பதிவேற்றவும் (விருப்பத்தேர்வு)' : 'Upload Jewellery Photo (Optional)'}
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                  <label
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 18px',
                      borderRadius: '12px',
                      background: 'rgba(212,175,55,0.12)',
                      border: '1px solid var(--gold)',
                      color: 'var(--gold2)',
                      fontSize: '13px',
                      cursor: 'pointer',
                      fontWeight: 500
                    }}
                  >
                    <Upload size={16} />
                    <span>{uploadingImage ? (isTamil ? 'பதிவேற்றப்படுகிறது...' : 'Uploading...') : (isTamil ? 'புகைப்படத்தைத் தேர்ந்தெடு' : 'Choose Photo')}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      style={{ display: 'none' }}
                      disabled={uploadingImage}
                    />
                  </label>

                  {imagePreview && (
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                      <img
                        src={imagePreview}
                        alt="Preview"
                        style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '10px', border: '1px solid var(--gold)' }}
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        style={{
                          position: 'absolute',
                          top: '-6px',
                          right: '-6px',
                          background: '#ef4444',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '50%',
                          width: '20px',
                          height: '20px',
                          display: 'grid',
                          placeItems: 'center',
                          cursor: 'pointer',
                          padding: 0
                        }}
                        title="Remove image"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || uploadingImage}
                className="gbtn"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  padding: '14px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: (submitting || uploadingImage) ? 'not-allowed' : 'pointer',
                  opacity: (submitting || uploadingImage) ? 0.75 : 1
                }}
              >
                {submitting ? (isTamil ? 'அனுப்பப்படுகிறது...' : 'Publishing Review...') : (
                  <>
                    <Send size={16} /> {isTamil ? 'மதிப்புரையை வெளியிடு' : 'Publish My Review'}
                  </>
                )}
              </button>
            </form>
          </section>

          {/* Live Reviews Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '24px', color: 'var(--gold2)', margin: 0 }}>
                {isTamil ? 'சமீபத்திய மதிப்புரைகள்' : 'Live Patron Stories'}
              </h3>
              <span style={{ fontSize: '12px', opacity: 0.7 }}>
                {reviews.length} {isTamil ? 'மதிப்புரைகள்' : 'Reviews'}
              </span>
            </div>

            {loadingReviews ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--gold2)' }}>
                Loading reviews...
              </div>
            ) : reviews.length === 0 ? (
              <div style={{ background: 'rgba(255,240,208,0.03)', border: '1px solid var(--line)', borderRadius: '18px', padding: '32px', textAlign: 'center' }}>
                <p style={{ margin: 0, opacity: 0.7 }}>Be the first patron to share a review!</p>
              </div>
            ) : (
              reviews.map((rev) => (
                <div
                  key={rev.id}
                  style={{
                    background: 'linear-gradient(135deg, rgba(38,5,29,0.7), rgba(18,2,14,0.9))',
                    border: '1px solid var(--line)',
                    borderRadius: '18px',
                    padding: '20px 24px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                    transition: 'transform 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <div style={{ display: 'flex', gap: '3px', color: 'var(--gold)', marginBottom: '4px' }}>
                        {[...Array(rev.rating || 5)].map((_, i) => (
                          <Star key={i} size={14} fill="var(--gold)" color="var(--gold)" />
                        ))}
                      </div>
                      <b style={{ fontSize: '15px', color: 'var(--gold2)' }}>{rev.customer_name}</b>
                      {rev.location && (
                        <span style={{ fontSize: '12px', opacity: 0.65, marginLeft: '8px' }}>
                          · {rev.location}
                        </span>
                      )}
                    </div>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.4)', color: '#86efac', fontSize: '11px', padding: '2px 8px', borderRadius: '999px', fontWeight: 500 }}>
                      <CheckCircle2 size={12} /> Verified
                    </span>
                  </div>

                  {rev.product_name && (
                    <div style={{ fontSize: '11.5px', color: 'var(--gold)', opacity: 0.85, marginBottom: '8px', letterSpacing: '0.04em' }}>
                      Purchased: <i>{rev.product_name}</i>
                    </div>
                  )}

                  <p style={{ margin: 0, fontSize: '13.5px', lineHeight: '1.6', opacity: 0.9 }}>
                    "{rev.comment}"
                  </p>

                  {rev.image_url && (
                    <div style={{ marginTop: '14px' }}>
                      <img
                        src={rev.image_url}
                        alt="Customer look"
                        style={{
                          width: '100%',
                          maxHeight: '180px',
                          objectFit: 'cover',
                          borderRadius: '12px',
                          border: '1px solid rgba(212,175,55,0.3)',
                          display: 'block'
                        }}
                      />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--line)', padding: '28px 20px', textAlign: 'center', fontSize: '13px', opacity: 0.7, marginTop: '40px' }}>
        <p style={{ margin: '0 0 8px' }}>
          © {new Date().getFullYear()} {storeName}. All rights reserved.
        </p>
        <Link to="/" style={{ color: 'var(--gold2)', textDecoration: 'underline' }}>
          Return to Storefront Home
        </Link>
      </footer>
    </div>
  );
}

