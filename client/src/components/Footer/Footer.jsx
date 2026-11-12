import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import './Footer.css';

export default function Footer() {
  const { siteName } = useTheme();
  const [email, setEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState('idle');

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setNewsletterStatus('loading');
    setTimeout(() => {
      setNewsletterStatus('success');
      setEmail('');
      setTimeout(() => setNewsletterStatus('idle'), 4000);
    }, 600);
  };

  return (
    <footer className="site-footer" role="contentinfo">
      <div className="container">
        {/* ─── 1. Newsletter Banner ─── */}
        <div className="newsletter-banner">
          <div className="newsletter-banner__left">
            <div className="newsletter-banner__icon-wrap">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="#0284c7">
                <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
              </svg>
            </div>
            <div className="newsletter-banner__text">
              <h3 className="newsletter-banner__title">Subscribe to our Newsletter</h3>
                <p className="newsletter-banner__subtitle">Get the latest updates, offers and more.</p>
            </div>
          </div>

          <div className="newsletter-banner__right">
            <form className="newsletter-banner__form" onSubmit={handleNewsletterSubmit}>
              <div className="newsletter-banner__input-pill">
                <input
                  type="email"
                  className="newsletter-banner__input"
                  placeholder="Your Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button
                  type="submit"
                  className="newsletter-banner__btn"
                  disabled={newsletterStatus === 'loading'}
                >
                  {newsletterStatus === 'loading' ? 'Subscribing...' : newsletterStatus === 'success' ? 'Subscribed!' : 'Subscribe'}
                </button>
              </div>
            </form>
            <div className="newsletter-banner__plane" aria-hidden="true">
              <svg width="68" height="52" viewBox="0 0 90 70" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M10 58 C 24 66, 48 64, 58 48 C 66 34, 54 24, 44 34 C 37 41, 44 54, 58 44 C 70 36, 76 24, 80 16"
                  stroke="rgba(255, 255, 255, 0.85)"
                  strokeWidth="1.6"
                  strokeDasharray="3 3"
                  fill="none"
                  strokeLinecap="round"
                />
                <g transform="translate(54, 2) rotate(12) scale(0.92)">
                  <polygon points="26,2 3,18 13,20" fill="#ffffff" />
                  <polygon points="26,2 13,20 18,27" fill="#cbd5e1" />
                  <polygon points="26,2 18,27 27,24" fill="#f8fafc" />
                  <polygon points="13,20 15,25 18,27" fill="#94a3b8" />
                </g>
              </svg>
            </div>
          </div>
        </div>

        {/* ─── 2. Shop Smarter. Live Better. Trust Section ─── */}
        <div className="footer-trust">
          <div className="footer-trust__header">
            <h3 className="footer-trust__title">Shop Smarter. Live Better.</h3>
            <p className="footer-trust__subtitle">Your one-stop destination for the latest fashion trends.</p>
          </div>

          <div className="footer-trust__grid">
            <div className="footer-trust__item">
              <div className="footer-trust__icon-circle">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="3" width="15" height="13" />
                  <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                  <circle cx="5.5" cy="18.5" r="2.5" />
                  <circle cx="18.5" cy="18.5" r="2.5" />
                </svg>
              </div>
              <h4 className="footer-trust__item-title">Free Shipping</h4>
              <p className="footer-trust__item-desc">On Orders Above ₹999</p>
            </div>

            <div className="footer-trust__item">
              <div className="footer-trust__icon-circle">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="1 4 1 10 7 10" />
                  <polyline points="23 20 23 14 17 14" />
                  <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
                </svg>
              </div>
              <h4 className="footer-trust__item-title">Easy Returns</h4>
              <p className="footer-trust__item-desc">Within 7 Days</p>
            </div>

            <div className="footer-trust__item">
              <div className="footer-trust__icon-circle">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <polyline points="9 12 11 14 15 10" />
                </svg>
              </div>
              <h4 className="footer-trust__item-title">Secure Payments</h4>
              <p className="footer-trust__item-desc">100% Safe</p>
            </div>

            <div className="footer-trust__item">
              <div className="footer-trust__icon-circle">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
                  <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
                </svg>
              </div>
              <h4 className="footer-trust__item-title">24/7 Support</h4>
              <p className="footer-trust__item-desc">Always Here</p>
            </div>
          </div>
        </div>

        {/* ─── 3. Main 4-Column Footer ─── */}
        <div className="footer-main">
          {/* Column 1: Brand Info */}
          <div className="footer-main__col footer-main__col--brand">
            <Link to="/" className="footer-logo">
              <span className="logo-main">ByKAVY</span>
              <span className="logo-accent">.in</span>
            </Link>
            <p className="footer-brand__tagline">
              Stay stylish, stay confident with ByKAVY.in.
            </p>
            <div className="footer-social">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="footer-social__link" aria-label="Facebook">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="footer-social__link" aria-label="Instagram">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="footer-social__link" aria-label="YouTube">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19.1c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
                  <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="#ffffff" />
                </svg>
              </a>
              <a href="https://pinterest.com" target="_blank" rel="noopener noreferrer" className="footer-social__link" aria-label="Pinterest">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12c0 4.25 2.67 7.87 6.42 9.31-.09-.78-.17-1.99.04-2.84.18-.78 1.2-5.1 1.2-5.1s-.31-.61-.31-1.51c0-1.42.82-2.48 1.84-2.48.87 0 1.29.65 1.29 1.43 0 .87-.56 2.18-.84 3.39-.24 1.01.5 1.83 1.49 1.83 1.79 0 3.17-1.89 3.17-4.61 0-2.41-1.73-4.1-4.21-4.1-2.87 0-4.55 2.15-4.55 4.37 0 .87.33 1.79.75 2.3.08.1.09.19.07.29l-.28 1.13c-.04.19-.15.23-.35.14-1.31-.61-2.13-2.53-2.13-4.07 0-3.31 2.41-6.36 6.94-6.36 3.65 0 6.48 2.6 6.48 6.07 0 3.62-2.28 6.53-5.45 6.53-1.06 0-2.06-.55-2.4-1.2l-.65 2.49c-.24.91-.88 2.05-1.32 2.74.99.31 2.04.47 3.13.47 5.52 0 10-4.48 10-10S17.52 2 12 2z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="footer-main__col">
            <h4 className="footer-col__title">Quick Links</h4>
            <ul className="footer-links">
              <li><Link to="/" className="footer-link">Home</Link></li>
              <li><Link to="/shop" className="footer-link">Products</Link></li>
              <li><Link to="/page/about" className="footer-link">About</Link></li>
              <li><Link to="/page/contact" className="footer-link">Contact</Link></li>
            </ul>
          </div>

          {/* Column 3: Customer Care */}
          <div className="footer-main__col">
            <h4 className="footer-col__title">Customer Care</h4>
            <ul className="footer-links">
              <li><Link to="/page/faqs" className="footer-link">FAQs</Link></li>
              <li><Link to="/page/shipping-policy" className="footer-link">Shipping Policy</Link></li>
              <li><Link to="/page/refund-policy" className="footer-link">Return Policy</Link></li>
              <li><Link to="/page/privacy-policy" className="footer-link">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Column 4: Contact Us */}
          <div className="footer-main__col">
            <h4 className="footer-col__title">Contact Us</h4>
            <ul className="footer-contact">
              <li className="footer-contact__item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                <a href="tel:+919876543210">+91 98765 43210</a>
              </li>
              <li className="footer-contact__item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <a href="mailto:support@fashionhub.com">support@fashionhub.com</a>
              </li>
              <li className="footer-contact__item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span>India</span>
              </li>
            </ul>
          </div>
        </div>

        {/* ─── 4. Bottom Bar (Copyright + Payments) ─── */}
        <div className="footer-bottom">
          <p className="footer-copyright">
            © {new Date().getFullYear()} ByKAVY.in. All Rights Reserved.
          </p>

          <div className="footer-payments">
            {/* Visa */}
            <span className="payment-badge" title="Visa">
              <svg width="38" height="22" viewBox="0 0 38 24" fill="none">
                <rect width="38" height="24" rx="4" fill="#ffffff" stroke="#e2e8f0" />
                <path d="M15.5 16.5L17.5 7.5H19.8L17.8 16.5H15.5Z" fill="#1A1F71" />
                <path d="M25.2 7.7C24.7 7.5 24 7.3 23.1 7.3C20.8 7.3 19.2 8.5 19.2 10.2C19.2 11.5 20.3 12.2 21.2 12.6C22.1 13 22.4 13.3 22.4 13.7C22.4 14.3 21.7 14.6 21 14.6C20.1 14.6 19.6 14.4 18.9 14.1L18.6 13.9L18.3 15.6C18.8 15.8 19.8 16 20.8 16C23.3 16 24.9 14.8 24.9 12.9C24.9 11.3 23.8 10.6 22.8 10.1C22 9.7 21.6 9.4 21.6 9C21.6 8.6 22.1 8.3 22.8 8.3C23.5 8.3 24.1 8.4 24.6 8.7L24.8 8.8L25.2 7.7Z" fill="#1A1F71" />
                <path d="M28.5 7.5H26.7C26.1 7.5 25.7 7.7 25.4 8.3L21.7 16.5H24.1L24.6 15.1H27.5L27.8 16.5H30L28.5 7.5ZM25.2 13.4C25.4 12.8 26.2 10.5 26.2 10.5C26.2 10.5 26.4 10 26.5 9.7L26.7 10.5C26.7 10.5 27.2 12.7 27.3 13.4H25.2Z" fill="#1A1F71" />
                <path d="M13.6 7.5L11.4 13.7L11.2 12.4C10.7 10.9 9.5 9.4 8 8.6L10.1 16.5H12.5L16.2 7.5H13.6Z" fill="#1A1F71" />
                <path d="M9.8 7.5H6L6 7.7C8.9 8.4 11 10.5 11.2 12.4L10.1 7.5H9.8Z" fill="#F7B600" />
              </svg>
            </span>

            {/* Mastercard */}
            <span className="payment-badge" title="Mastercard">
              <svg width="38" height="22" viewBox="0 0 38 24" fill="none">
                <rect width="38" height="24" rx="4" fill="#ffffff" stroke="#e2e8f0" />
                <circle cx="15" cy="12" r="6" fill="#EB001B" />
                <circle cx="23" cy="12" r="6" fill="#F79E1B" fillOpacity="0.85" />
              </svg>
            </span>

            {/* RuPay */}
            <span className="payment-badge" title="RuPay">
              <svg width="42" height="22" viewBox="0 0 46 24" fill="none">
                <rect width="46" height="24" rx="4" fill="#ffffff" stroke="#e2e8f0" />
                <text x="5" y="16" fontFamily="sans-serif" fontSize="10" fontWeight="800" fill="#097939">Ru</text>
                <text x="21" y="16" fontFamily="sans-serif" fontSize="10" fontWeight="800" fill="#1A4389">Pay</text>
                <polygon points="40,9 43,12 40,15" fill="#F37021" />
              </svg>
            </span>

            {/* UPI */}
            <span className="payment-badge" title="UPI">
              <svg width="38" height="22" viewBox="0 0 38 24" fill="none">
                <rect width="38" height="24" rx="4" fill="#ffffff" stroke="#e2e8f0" />
                <path d="M19 6L24 12H21V18H17V12H14L19 6Z" fill="#007936" />
                <text x="8" y="21" fontFamily="sans-serif" fontSize="7" fontWeight="800" fill="#0F172A">UPI</text>
              </svg>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
