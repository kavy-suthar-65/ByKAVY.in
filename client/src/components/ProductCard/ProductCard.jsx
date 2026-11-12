import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useToast } from '../Toast/Toast';
import { formatPrice, calcDiscount } from '../../utils/api';
import { useReveal } from '../../hooks/useHooks';
import './ProductCard.css';

/**
 * Shopify Dawn Inspired Product Card Component
 */
export default function ProductCard({ product, index = 0 }) {
  const { addItem } = useCart();
  const toast = useToast();
  const [ref, isRevealed] = useReveal();
  const [isHovered, setIsHovered] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const isOutOfStock = product?.stock <= 0;
  const discountPercent = calcDiscount(product?.price, product?.compare_at_price);

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock || isAdding) return;

    setIsAdding(true);
    try {
      addItem({
        productId: product.id,
        variantId: null,
        title: product.title,
        price: product.price,
        image: product.primary_image,
        slug: product.slug,
        quantity: 1,
      });
      toast.success(`${product.title} added to cart`);
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => {
        setIsAdding(false);
      }, 400);
    }
  };

  return (
    <div
      ref={ref}
      className={`dawn-product-card product-card ${isRevealed ? 'revealed' : ''}`}
      style={{ animationDelay: `${(index % 8) * 60}ms` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/product/${product.slug}`} className="dawn-product-card__link">
        {/* Image wrap with 3:4 aspect ratio */}
        <div className="dawn-product-card__image-wrap">
          <div className="dawn-product-card__image-container">
            <img
              src={product.primary_image}
              alt={product.title}
              className={`dawn-product-card__img dawn-product-card__img--primary ${
                isHovered && product.secondary_image ? 'dawn-product-card__img--hidden' : ''
              }`}
              loading="lazy"
            />
            {product.secondary_image && (
              <img
                src={product.secondary_image}
                alt={`${product.title} alternative`}
                className={`dawn-product-card__img dawn-product-card__img--secondary ${
                  isHovered ? 'dawn-product-card__img--visible' : ''
                }`}
                loading="lazy"
              />
            )}
          </div>

          {/* Badges: Sale & Out of Stock */}
          <div className="dawn-product-card__badges">
            {discountPercent > 0 && (
              <span className="dawn-badge dawn-badge--sale">-{discountPercent}%</span>
            )}
            {isOutOfStock && <span className="dawn-badge dawn-badge--out">Sold Out</span>}
          </div>

          {/* Hover Add to Cart Bar (bottom slide-up) */}
          {!isOutOfStock && (
            <button
              type="button"
              className={`dawn-product-card__add-bar ${isHovered ? 'dawn-product-card__add-bar--visible' : ''}`}
              onClick={handleQuickAdd}
              aria-label={`Add ${product.title} to cart`}
              disabled={isAdding}
            >
              {isAdding ? (
                <svg
                  className="dawn-spin"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                </svg>
              ) : (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
              )}
              <span>{isAdding ? 'Adding...' : 'Add to Cart'}</span>
            </button>
          )}
        </div>

        {/* Product Details info */}
        <div className="dawn-product-card__info">
          {product.category_name && (
            <span className="dawn-product-card__category">{product.category_name}</span>
          )}
          <h3 className="dawn-product-card__title">{product.title}</h3>

          <div className="dawn-product-card__price-row">
            <span className="dawn-price__current">{formatPrice(product.price)}</span>
            {product.compare_at_price && product.compare_at_price > product.price && (
              <span className="dawn-price__compare">{formatPrice(product.compare_at_price)}</span>
            )}
          </div>

          {/* Rating */}
          {product.avg_rating > 0 && (
            <div className="dawn-product-card__rating">
              <div className="dawn-stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    viewBox="0 0 24 24"
                    fill={star <= Math.round(product.avg_rating) ? 'currentColor' : 'none'}
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>
              {product.review_count !== undefined && (
                <span className="dawn-product-card__review-count">({product.review_count})</span>
              )}
            </div>
          )}
        </div>
      </Link>
    </div>
  );
}
