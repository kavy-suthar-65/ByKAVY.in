import { useState, useEffect, useRef } from 'react';
import heroVideo from '../../Assets/3a467868e4034f27a828d1c63846ad65.webm';
import './ReviewCarousel.css';

export default function ReviewCarousel({ reviews = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const videoRef = useRef(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(true);

  // Auto-rotate reviews every 6s
  useEffect(() => {
    if (reviews.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % reviews.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [reviews.length]);

  if (!reviews || reviews.length === 0) return null;

  const currentReview = reviews[currentIndex];

  const nextReview = () => {
    setCurrentIndex((prev) => (prev + 1) % reviews.length);
  };

  const prevReview = () => {
    setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  const startVideo = () => {
    if (videoRef.current) {
      videoRef.current.play().then(() => {
        setIsVideoPlaying(true);
      }).catch(() => {});
    }
  };

  const pauseVideo = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      setIsVideoPlaying(false);
    }
  };

  const toggleVideoPlay = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      startVideo();
    } else {
      pauseVideo();
    }
  };

  const toggleVideoMute = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsVideoMuted(videoRef.current.muted);
  };

  return (
    <div className="review-showcase-wrap">
      {/* ─── 1. Left: Customer Demo Video Card ─── */}
      <div
        className={`review-video-card ${isVideoPlaying ? 'review-video-card--playing' : ''}`}
        onMouseEnter={startVideo}
        onMouseLeave={pauseVideo}
        onClick={toggleVideoPlay}
        title="Click to play / pause customer video"
      >
        <video
          ref={videoRef}
          src={heroVideo}
          loop
          muted={isVideoMuted}
          playsInline
          preload="metadata"
          className="review-video-player"
          onPlay={() => setIsVideoPlaying(true)}
          onPause={() => setIsVideoPlaying(false)}
        />

        {/* Top Floating Badge */}
        <div className="review-video-badge">
          <span className="review-video-badge__dot" />
          <span>Customer Video Review</span>
        </div>

        {/* Big Central Play Button */}
        <button
          type="button"
          className={`review-video-play-btn ${isVideoPlaying ? 'review-video-play-btn--active' : ''}`}
          onClick={toggleVideoPlay}
          aria-label={isVideoPlaying ? 'Pause review video' : 'Play review video'}
        >
          {isVideoPlaying ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: '2px' }}>
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          )}
        </button>

        {/* Sound Toggle Button */}
        {isVideoPlaying && (
          <button
            type="button"
            className="review-video-sound-btn"
            onClick={toggleVideoMute}
            aria-label={isVideoMuted ? 'Unmute video' : 'Mute video'}
            title={isVideoMuted ? 'Unmute' : 'Mute'}
          >
            {isVideoMuted ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <line x1="23" y1="9" x2="17" y2="15" />
                <line x1="17" y1="9" x2="23" y2="15" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
              </svg>
            )}
          </button>
        )}

        {/* Bottom Caption Overlay */}
        <div className="review-video-overlay">
          <div className="review-video-stars">
            {[1, 2, 3, 4, 5].map((s) => (
              <svg key={s} width="14" height="14" viewBox="0 0 24 24" fill="#fbbf24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            ))}
          </div>
          <p className="review-video-quote">
            "Looks even better in person than on photos. Fast delivery and high-end stitching."
          </p>
          <span className="review-video-author">Priya Sharma · Verified Buyer</span>
        </div>
      </div>

      {/* ─── 2. Right: Review Testimonials Carousel Card ─── */}
      <div className="review-carousel-box">
        {/* Trust summary pill */}
        <div className="review-trust-pill">
          <div className="review-trust-pill__stars">
            {[1, 2, 3, 4, 5].map((s) => (
              <svg key={s} width="13" height="13" viewBox="0 0 24 24" fill="#f59e0b">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            ))}
          </div>
          <span className="review-trust-pill__text">4.9 / 5 Rating from 1,200+ Verified Buyers</span>
        </div>

        {/* Active Review Quote */}
        <div className="review-carousel__card" key={currentReview.id || currentIndex}>
          <div className="review-quote-mark" aria-hidden="true">“</div>

          <div className="stars review-carousel__stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg
                key={star}
                viewBox="0 0 24 24"
                fill={star <= currentReview.rating ? '#f59e0b' : '#e2e8f0'}
                stroke="#f59e0b"
                strokeWidth="1"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            ))}
          </div>

          <blockquote className="review-carousel__comment">
            "{currentReview.comment}"
          </blockquote>

          <div className="review-carousel__meta">
            <span className="review-carousel__author">{currentReview.user_name}</span>
            <span className="review-carousel__badge">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Verified Purchase
            </span>
          </div>
        </div>

        {/* Carousel Controls */}
        {reviews.length > 1 && (
          <div className="review-carousel__controls">
            <button className="review-carousel__btn" onClick={prevReview} aria-label="Previous review">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>

            <div className="review-carousel__dots">
              {reviews.map((_, i) => (
                <button
                  key={i}
                  className={`review-carousel__dot ${i === currentIndex ? 'review-carousel__dot--active' : ''}`}
                  onClick={() => setCurrentIndex(i)}
                  aria-label={`Go to review ${i + 1}`}
                />
              ))}
            </div>

            <button className="review-carousel__btn" onClick={nextReview} aria-label="Next review">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
