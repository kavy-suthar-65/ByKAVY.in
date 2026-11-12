import { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import './AnnouncementBar.css';

export default function AnnouncementBar() {
  const { getSetting } = useTheme();
  const [dismissed, setDismissed] = useState(false);

  const enabled = getSetting('announcement', 'announcement_enabled', '1');
  const isEnabled = enabled === '1' || enabled === 'true' || enabled === true;

  if (!isEnabled || dismissed) {
    return null;
  }

  return (
    <div className="announcement-bar" role="region" aria-label="Announcement">
      <div className="announcement-bar__inner">
        {/* Left Side */}
        <div className="announcement-bar__left">
          <div className="announcement-bar__item announcement-bar__item--left">
            <svg
              className="announcement-icon"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="1" y="3" width="15" height="13" />
              <polygon points="16 8 20 8 23 11 23 16 16 16" />
              <circle cx="5.5" cy="18.5" r="2.5" />
              <circle cx="18.5" cy="18.5" r="2.5" />
            </svg>
            <span>Free Shipping on Orders Above ₹999</span>
          </div>
        </div>

        {/* Center */}
        <div className="announcement-bar__center">
          <div className="announcement-bar__item announcement-bar__item--center">
            <svg
              className="announcement-icon"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="1 4 1 10 7 10" />
              <polyline points="23 20 23 14 17 14" />
              <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
            </svg>
            <span>Easy Returns</span>
          </div>
        </div>

        {/* Right Side */}
        <div className="announcement-bar__right">
          <div className="announcement-bar__item announcement-bar__item--right">
            <svg
              className="announcement-icon"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <polyline points="9 12 11 14 15 10" />
            </svg>
            <span>Secure Payments</span>
          </div>

          <button
            className="announcement-bar__close"
            onClick={() => setDismissed(true)}
            aria-label="Dismiss announcement"
            title="Dismiss"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
