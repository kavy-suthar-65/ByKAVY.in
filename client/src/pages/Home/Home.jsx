import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../utils/api';
import { useReveal } from '../../hooks/useHooks';
import ProductCard from '../../components/ProductCard/ProductCard';
import Skeleton from '../../components/Skeleton/Skeleton';
import ReviewCarousel from '../../components/ReviewCarousel/ReviewCarousel';
import FeatureCustomerShowcase from '../../components/FeatureCustomerShowcase/FeatureCustomerShowcase';
import heroVideo from '../../Assets/3a467868e4034f27a828d1c63846ad65.webm';
import './Home.css';

function ScrollSection({ children, className = '', ...props }) {
  const [ref, isRevealed] = useReveal({ threshold: 0.08 });
  return (
    <section
      ref={ref}
      className={`reveal ${isRevealed ? 'revealed' : ''} ${className}`}
      {...props}
    >
      {children}
    </section>
  );
}

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [featRes, newRes, bestRes, revRes] = await Promise.all([
          api.get('/products/featured?limit=4'),
          api.get('/products/new-arrivals?limit=4'),
          api.get('/products/best-sellers?limit=4'),
          api.get('/settings/reviews?limit=6'),
        ]);

        setFeaturedProducts(featRes.products || []);
        setNewArrivals(newRes.products || []);
        setBestSellers(bestRes.products || []);
        setReviews(revRes.reviews || []);
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  return (
    <div className="home-page">
      {/* Background Decorative Soft-Blue Wave Elements matching photo */}
      <div className="home-bg-waves" aria-hidden="true">
        <div className="home-wave-shape home-wave--top" />
        <div className="home-wave-shape home-wave--middle" />
        <div className="home-wave-shape home-wave--bottom" />
      </div>

      {/* 1. Full Screen Video Hero Banner (UNTOUCHED) */}
      <section className="hero-banner hero-banner--fullscreen">
        <div className="hero-banner__bg">
          <video
            autoPlay
            loop
            muted
            playsInline
            disablePictureInPicture
            disableRemotePlayback
            aria-hidden="true"
            preload="none"
            className="hero-banner__video"
          >
            <source src={heroVideo} type="video/webm" />
          </video>
          <div className="hero-banner__overlay" />
        </div>

        <div className="hero-banner__bottom-wrap container">
          <div className="hero-banner__meta animate-fade-up">
            <span className="hero-banner__tagline">KAVY — SUMMER 2026</span>
            <h1 className="hero-banner__title">Redefining Minimal Elegance</h1>
          </div>

          <div className="hero-banner__cta animate-fade-up stagger-1">
            <Link to="/shop" className="btn btn--hero-sm btn--hero-primary">
              Explore Collection
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <Link to="/shop?sort=newest" className="btn btn--hero-sm btn--hero-secondary">
              New Arrivals
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Featured Collection */}
      <ScrollSection className="section">
        <div className="container">
          <div className="section__header">
            <h2 className="section__title">
              <span className="section__title-dark">Featured</span>{' '}
              <span className="section__title-accent">Collection</span>
            </h2>
            <p className="section__subtitle">
              Explore our handpicked curation of seasonal essentials, signature styles, and trendsetting pieces designed for your everyday wardrobe.
            </p>
          </div>
          {loading ? (
            <Skeleton variant="product-grid" count={4} />
          ) : (
            <div className="product-grid">
              {featuredProducts.map((p, idx) => (
                <ProductCard key={p.id} product={p} index={idx} />
              ))}
            </div>
          )}
        </div>
      </ScrollSection>

      {/* 3. New Arrivals */}
      <ScrollSection className="section section--alt">
        <div className="container">
          <div className="section__header">
            <h2 className="section__title">
              <span className="section__title-dark">New</span>{' '}
              <span className="section__title-accent">Arrivals</span>
            </h2>
            <p className="section__subtitle">
              Stay ahead of the curve with our latest drops, fresh silhouettes, and contemporary designs updated weekly.
            </p>
          </div>
          {loading ? (
            <Skeleton variant="product-grid" count={4} />
          ) : (
            <div className="product-grid">
              {newArrivals.map((p, idx) => (
                <ProductCard key={p.id} product={p} index={idx} />
              ))}
            </div>
          )}
        </div>
      </ScrollSection>

      {/* 4. Best Sellers */}
      <ScrollSection className="section">
        <div className="container">
          <div className="section__header">
            <h2 className="section__title">
              <span className="section__title-dark">Best</span>{' '}
              <span className="section__title-accent">Sellers</span>
            </h2>
            <p className="section__subtitle">
              Explore the most-loved pieces and timeless favorites chosen and highly rated by thousands of satisfied shoppers.
            </p>
          </div>
          {loading ? (
            <Skeleton variant="product-grid" count={4} />
          ) : (
            <div className="product-grid">
              {bestSellers.map((p, idx) => (
                <ProductCard key={p.id} product={p} index={idx} />
              ))}
            </div>
          )}
        </div>
      </ScrollSection>

      {/* 5. Customer Reviews (UNTOUCHED carousel) */}
      <ScrollSection className="section section--reviews">
        <div className="container">
          <div className="section__header">
            <h2 className="section__title">
              <span className="section__title-dark">Customer</span>{' '}
              <span className="section__title-accent">Reviews</span>
            </h2>
            <p className="section__subtitle">
              Read genuine experiences and honest feedback from our valued customers who love the quality and comfort of our products.
            </p>
          </div>
          <ReviewCarousel reviews={reviews} />
        </div>
      </ScrollSection>

      {/* 6. Feature and Customer Showcase */}
      <ScrollSection>
        <FeatureCustomerShowcase />
      </ScrollSection>
    </div>
  );
}
