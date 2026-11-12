import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import heroVideo from '../../Assets/3a467868e4034f27a828d1c63846ad65.webm';
import mainImg from '../../Assets/showcase/showcase-main.jpg';
import card1Img from '../../Assets/showcase/showcase-card1.jpg';
import card2Img from '../../Assets/showcase/showcase-card2.jpg';
import card3Img from '../../Assets/showcase/showcase-card3.jpg';
import card4Img from '../../Assets/showcase/showcase-card4.jpg';
import iconWomens from '../../Assets/showcase/icon-womens-exact.png';
import iconMens from '../../Assets/showcase/icon-mens-exact.png';
import iconTextiles from '../../Assets/showcase/icon-textiles-exact.png';
import './FeatureCustomerShowcase.css';

export default function FeatureCustomerShowcase() {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [activeCard, setActiveCard] = useState(null);

  const startPlayback = () => {
    if (videoRef.current) {
      videoRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        // Autoplay handled
      });
    }
  };

  const pausePlayback = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const togglePlay = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      startPlayback();
    } else {
      pausePlayback();
    }
  };

  const toggleMute = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  return (
    <section
      className="showcase-section"
      onMouseEnter={startPlayback}
      onMouseLeave={pausePlayback}
      aria-label="Feature and Customer Showcase"
    >
      <div className="container">
        {/* Section Header */}
        <div className="showcase__header">
          <h2 className="showcase__title">Feature and Customer Showcase</h2>
        </div>

        {/* Main Showcase Layout */}
        <div className="showcase-grid">
          {/* ─── 1. Left Featured Media Card with Autoplay ─── */}
          <div
            className={`showcase-featured ${isPlaying ? 'showcase-featured--playing' : ''}`}
            onMouseEnter={startPlayback}
            onClick={togglePlay}
            title="Click to play / pause video"
          >
            {/* Poster Image */}
            <img
              src={mainImg}
              alt="Experience the softness with our organic cotton - Pure White Shirt"
              className="showcase-featured__poster"
              loading="lazy"
            />

            {/* Video Player */}
            <video
              ref={videoRef}
              src={heroVideo}
              loop
              muted={isMuted}
              playsInline
              preload="metadata"
              className="showcase-featured__video"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />

            {/* Top-Left Play Indicator Pill */}
            <div className="showcase-featured__top-badge" aria-hidden="true">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            </div>

            {/* Center Big Circular Play / Pause Button */}
            <button
              type="button"
              className={`showcase-play-btn ${isPlaying ? 'showcase-play-btn--active' : ''}`}
              onClick={togglePlay}
              aria-label={isPlaying ? 'Pause showcase video' : 'Play showcase video'}
            >
              {isPlaying ? (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                </svg>
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: '2px' }}>
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              )}
            </button>

            {/* Sound Toggle Button */}
            {isPlaying && (
              <button
                type="button"
                className="showcase-sound-btn"
                onClick={toggleMute}
                aria-label={isMuted ? 'Unmute video' : 'Mute video'}
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    <line x1="23" y1="9" x2="17" y2="15" />
                    <line x1="17" y1="9" x2="23" y2="15" />
                  </svg>
                ) : (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                  </svg>
                )}
              </button>
            )}

            {/* Bottom Overlay Caption */}
            <div className="showcase-featured__caption">
              <p className="showcase-featured__caption-text">
                Experience the softness with our organic cotton - Pure White Shirt
              </p>
            </div>
          </div>

          {/* ─── 2. Middle 2x2 Customer Cards Grid ─── */}
          <div className="showcase-cards-2x2">
            {/* Card 1: Black shirt (Top-Left) */}
            <Link
              to="/shop"
              className={`showcase-card ${activeCard === 1 ? 'showcase-card--active' : ''}`}
              onMouseEnter={() => setActiveCard(1)}
              onMouseLeave={() => setActiveCard(null)}
            >
              <div className="showcase-card__image-wrap">
                <img
                  src={card1Img}
                  alt="Customer showcase - Classic black shirt"
                  className="showcase-card__image"
                  loading="lazy"
                />
              </div>
              <div className="showcase-card__overlay">
                <span className="showcase-card__badge">loved the fast delivery!</span>
              </div>
            </Link>

            {/* Card 2: White shirt (Top-Right) */}
            <Link
              to="/shop"
              className={`showcase-card ${activeCard === 2 ? 'showcase-card--active' : ''}`}
              onMouseEnter={() => setActiveCard(2)}
              onMouseLeave={() => setActiveCard(null)}
            >
              <div className="showcase-card__image-wrap">
                <img
                  src={card2Img}
                  alt="Customer showcase - White linen shirt"
                  className="showcase-card__image"
                  loading="lazy"
                />
              </div>
              <div className="showcase-card__overlay">
                <span className="showcase-card__badge">quality is amazing!</span>
              </div>
            </Link>

            {/* Card 3: Rust shirt (Bottom-Left) */}
            <Link
              to="/shop"
              className={`showcase-card ${activeCard === 3 ? 'showcase-card--active' : ''}`}
              onMouseEnter={() => setActiveCard(3)}
              onMouseLeave={() => setActiveCard(null)}
            >
              <div className="showcase-card__image-wrap">
                <img
                  src={card3Img}
                  alt="Customer showcase - Rust linen shirt"
                  className="showcase-card__image"
                  loading="lazy"
                />
              </div>
              <div className="showcase-card__overlay">
                <span className="showcase-card__badge">quality is amazing!</span>
              </div>
            </Link>

            {/* Card 4: Sage knit polo (Bottom-Right) */}
            <Link
              to="/shop"
              className={`showcase-card ${activeCard === 4 ? 'showcase-card--active' : ''}`}
              onMouseEnter={() => setActiveCard(4)}
              onMouseLeave={() => setActiveCard(null)}
            >
              <div className="showcase-card__image-wrap">
                <img
                  src={card4Img}
                  alt="Customer showcase - Green knit polo"
                  className="showcase-card__image"
                  loading="lazy"
                />
              </div>
              <div className="showcase-card__overlay">
                <span className="showcase-card__badge">Top Trending Categories</span>
              </div>
            </Link>
          </div>

          {/* ─── 3. Right Vertical Category Rail (Realistic Photo Icons) ─── */}
          <div className="showcase-categories" role="navigation" aria-label="Showcase categories">
            {/* Category 1: Women's Shirts */}
            <Link to="/shop?category=women" className="showcase-category-item" title="Women's Shirts">
              <div className="showcase-category-btn-wrap">
                <img src={iconWomens} alt="Women's Shirts" className="showcase-category-btn-img" />
              </div>
              <span className="showcase-category-label">Women's Shirts</span>
            </Link>

            {/* Category 2: Men's Shirts */}
            <Link to="/shop?category=men" className="showcase-category-item" title="Men's Shirts">
              <div className="showcase-category-btn-wrap">
                <img src={iconMens} alt="Men's Shirts" className="showcase-category-btn-img" />
              </div>
              <span className="showcase-category-label">Men's Shirts</span>
            </Link>

            {/* Category 3: Home Textiles */}
            <Link to="/shop" className="showcase-category-item" title="Home Textiles">
              <div className="showcase-category-btn-wrap">
                <img src={iconTextiles} alt="Home Textiles" className="showcase-category-btn-img" />
              </div>
              <span className="showcase-category-label">Home Textiles</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
