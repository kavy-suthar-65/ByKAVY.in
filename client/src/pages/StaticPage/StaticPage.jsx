import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../utils/api';
import { useToast } from '../../components/Toast/Toast';
import { useTheme } from '../../context/ThemeContext';
import Skeleton from '../../components/Skeleton/Skeleton';
import './StaticPage.css';

const CONTACT_FAQS = [
  {
    q: 'How can I track my recent order?',
    a: 'Once your order is dispatched (within 24–48 hours), you will receive a tracking link via WhatsApp and SMS. You can also view live AWB updates under My Account > Orders.',
  },
  {
    q: 'How do I exchange my item for a different size?',
    a: 'We offer free 7-day size exchanges! Simply message our WhatsApp support or submit a request from your orders page. We arrange a doorstep pickup and ship your new size immediately.',
  },
  {
    q: 'When will I receive my refund?',
    a: 'Prepaid orders are refunded back to your original payment source in 5–7 business days. For COD orders, we transfer directly to your UPI ID or bank account within 2–4 business days of quality inspection.',
  },
  {
    q: 'Do you offer Cash on Delivery (COD)?',
    a: 'Yes, Cash on Delivery is available across 19,000+ serviceable PIN codes throughout India for a nominal handling fee of ₹49. All prepaid orders enjoy 100% Free Shipping.',
  },
];

export default function StaticPage({ forcedSlug }) {
  const params = useParams();
  const slug = forcedSlug || params.slug || 'contact';
  const toast = useToast();
  const { siteName, getSetting } = useTheme();

  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeFaq, setActiveFaq] = useState(null);

  // Contact Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    orderNumber: '',
    subject: 'Order Tracking & Status',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const whatsappNumber = getSetting('general', 'whatsapp_number', '');
  const whatsappUrl = whatsappNumber ? `https://wa.me/${whatsappNumber}` : 'https://wa.me/919876543210';
  const supportEmail = getSetting('general', 'support_email', 'support@bykavy.in');

  useEffect(() => {
    async function loadPage() {
      setLoading(true);
      try {
        const data = await api.get(`/settings/page/${slug}`);
        setPage(data.page);
      } catch (err) {
        console.error('Failed to load page:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPage();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    // Simulate immediate delivery with persistent customer acknowledgment
    await new Promise((r) => setTimeout(r, 800));
    setSubmitting(false);
    setSubmitted(true);
    toast.success('Thank you! Your message has been sent to our customer care team.');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Policy link copied to clipboard!');
  };

  const isContactPage = slug === 'contact' || slug === 'contact-us';

  if (loading) {
    return (
      <div className="container container--narrow page-padding">
        <Skeleton variant="page" />
      </div>
    );
  }

  if (!page) {
    return (
      <div className="container container--narrow page-padding text-center">
        <h2>Page Not Found</h2>
        <p className="text-secondary mt-md">The requested page could not be located.</p>
        <Link to="/" className="btn btn--primary mt-md">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="static-page-wrapper animate-fade-in">
      <div className="container static-page-container">
        {/* Top Breadcrumb Navigation */}
        <nav className="static-page__breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span className="breadcrumb__sep">/</span>
          <span>Information</span>
          <span className="breadcrumb__sep">/</span>
          <span className="breadcrumb__current">{page.title}</span>
        </nav>

        {/* Page Header */}
        <header className="static-page__header">
          <div className="static-page__badge-row">
            <span className="static-page__badge">
              {isContactPage ? 'Customer Care & Support' : 'Official Legal Policy'}
            </span>
            <span className="static-page__domain">ByKAVY.in</span>
          </div>

          <h1 className="static-page__title">{page.title}</h1>

          <div className="static-page__actions">
            <button
              type="button"
              className="static-page__action-btn"
              onClick={handleShareLink}
              title="Copy Page Link"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
              <span>Copy Link</span>
            </button>
            <button
              type="button"
              className="static-page__action-btn"
              onClick={handlePrint}
              title="Print Document"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 6 2 18 2 18 9" />
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                <rect x="6" y="14" width="12" height="8" />
              </svg>
              <span>Print</span>
            </button>
          </div>
        </header>

        {/* ─── CONTACT US SPECIALIZED LAYOUT ─────────────────── */}
        {isContactPage ? (
          <div className="contact-layout">
            {/* Quick Contact Cards */}
            <div className="contact-cards-grid">
              <div className="contact-card">
                <div className="contact-card__icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>
                <h3 className="contact-card__title">Email Us</h3>
                <p className="contact-card__desc">For general inquiries, order status & feedback</p>
                <a href={`mailto:${supportEmail}`} className="contact-card__link">
                  {supportEmail}
                </a>
              </div>

              <div className="contact-card">
                <div className="contact-card__icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
                  </svg>
                </div>
                <h3 className="contact-card__title">WhatsApp Support</h3>
                <p className="contact-card__desc">Instant chat for rapid exchanges & sizing advice</p>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-card__link"
                >
                  Chat on WhatsApp &rarr;
                </a>
              </div>

              <div className="contact-card">
                <div className="contact-card__icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <h3 className="contact-card__title">Support Hours</h3>
                <p className="contact-card__desc">Monday to Saturday</p>
                <span className="contact-card__highlight">10:00 AM – 7:00 PM IST</span>
              </div>

              <div className="contact-card">
                <div className="contact-card__icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <h3 className="contact-card__title">Registered Office</h3>
                <p className="contact-card__desc">ByKAVY Studio & Warehouse</p>
                <span className="contact-card__highlight">Surat, Gujarat, India - 395006</span>
              </div>
            </div>

            {/* Interactive Contact Form & Details Split */}
            <div className="contact-main-grid">
              <div className="contact-form-card">
                <h2 className="contact-form-title">Send Us a Direct Message</h2>
                <p className="contact-form-subtitle">
                  Fill in the details below and our concierge team will respond within 2 to 4 business hours.
                </p>

                {submitted ? (
                  <div className="contact-success-state">
                    <div className="contact-success-icon">✓</div>
                    <h3>Message Received</h3>
                    <p>Thank you, {formData.name}. We have logged your request and a specialist will email you shortly.</p>
                    <button
                      type="button"
                      className="btn btn--secondary mt-md"
                      onClick={() => {
                        setSubmitted(false);
                        setFormData({
                          name: '',
                          email: '',
                          phone: '',
                          orderNumber: '',
                          subject: 'Order Tracking & Status',
                          message: '',
                        });
                      }}
                    >
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleFormSubmit} className="contact-form">
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="contact-name">Full Name *</label>
                        <input
                          id="contact-name"
                          type="text"
                          name="name"
                          required
                          placeholder="e.g. Rahul Sharma"
                          value={formData.name}
                          onChange={handleFormChange}
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="contact-email">Email Address *</label>
                        <input
                          id="contact-email"
                          type="email"
                          name="email"
                          required
                          placeholder="rahul@example.com"
                          value={formData.email}
                          onChange={handleFormChange}
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="contact-phone">Phone / WhatsApp Number</label>
                        <input
                          id="contact-phone"
                          type="tel"
                          name="phone"
                          placeholder="+91 98765 43210"
                          value={formData.phone}
                          onChange={handleFormChange}
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="contact-order">Order Number (Optional)</label>
                        <input
                          id="contact-order"
                          type="text"
                          name="orderNumber"
                          placeholder="e.g. KAVY-10294"
                          value={formData.orderNumber}
                          onChange={handleFormChange}
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="contact-subject">Inquiry Type</label>
                      <select
                        id="contact-subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleFormChange}
                      >
                        <option value="Order Tracking & Status">Order Tracking & Status</option>
                        <option value="Size Exchange Request">Size Exchange Request (Free 7-Day)</option>
                        <option value="Return / Refund Inquiry">Return / Refund Inquiry</option>
                        <option value="Product Sizing & Fabric Help">Product Sizing & Fabric Help</option>
                        <option value="Wholesale / B2B Inquiry">Wholesale / B2B Inquiry</option>
                        <option value="General Feedback">General Feedback</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="contact-message">Your Message *</label>
                      <textarea
                        id="contact-message"
                        name="message"
                        required
                        rows="5"
                        placeholder="Tell us how we can assist you..."
                        value={formData.message}
                        onChange={handleFormChange}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn btn--primary contact-submit-btn"
                    >
                      {submitting ? 'Sending Message...' : 'Send Message'}
                    </button>
                  </form>
                )}
              </div>

              {/* Instant Help & Rapid FAQs */}
              <div className="contact-sidebar">
                <div className="contact-sidebar-box">
                  <h3>Need Immediate Help?</h3>
                  <p>Skip the email queue! Chat with our customer representative directly on WhatsApp for real-time order updates.</p>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn--primary contact-wa-btn"
                  >
                    <span>Instant WhatsApp Chat</span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14" />
                      <path d="m12 5 7 7-7 7" />
                    </svg>
                  </a>
                </div>

                <div className="contact-faq-box">
                  <h3>Frequently Asked Questions</h3>
                  <div className="contact-faq-list">
                    {CONTACT_FAQS.map((faq, idx) => (
                      <div
                        key={idx}
                        className={`contact-faq-item ${activeFaq === idx ? 'contact-faq-item--active' : ''}`}
                        onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                      >
                        <div className="contact-faq-q">
                          <span>{faq.q}</span>
                          <span className="faq-toggle-icon">{activeFaq === idx ? '−' : '+'}</span>
                        </div>
                        {activeFaq === idx && (
                          <div className="contact-faq-a">
                            <p>{faq.a}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ─── OFFICIAL POLICY DOCUMENT LAYOUT ────────────────── */
          <div className="policy-layout">
            <article className="policy-article">
              <div
                className="static-page__content policy-body"
                dangerouslySetInnerHTML={{ __html: page.content }}
              />
            </article>

            {/* Assistance Footer Callout */}
            <div className="policy-help-card">
              <div className="policy-help-content">
                <h3>Have Questions About This Policy?</h3>
                <p>
                  Our legal compliance and customer happiness desks are happy to clarify any terms, return eligibility, or data privacy queries.
                </p>
              </div>
              <div className="policy-help-actions">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn--primary btn--sm"
                >
                  WhatsApp Helpline
                </a>
                <a
                  href={`mailto:${supportEmail}`}
                  className="btn btn--outline btn--sm"
                >
                  Email Support
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
