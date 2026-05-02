import { useState } from 'react'
import { ShoppingCart, Star, Eye, Heart } from 'lucide-react'
import type { Product } from '../../types/product.types'

interface ProductCardProps {
  product: Product
  onAddToCart: (product: Product) => void
  onViewDetail: (product: Product) => void
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="star-rating" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          size={12}
          fill={i <= Math.floor(rating) ? '#FFB347' : 'transparent'}
          color={i <= Math.floor(rating) ? '#FFB347' : '#565959'}
        />
      ))}
      <span className="star-rating__value">{rating}</span>
    </div>
  )
}

export default function ProductCard({ product, onAddToCart, onViewDetail }: ProductCardProps) {
  const [liked, setLiked] = useState(false)
  const [adding, setAdding] = useState(false)
  const discount = product.originalPrice > product.price
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0

  const handleAddToCart = async () => {
    setAdding(true)
    onAddToCart(product)
    await new Promise(r => setTimeout(r, 600))
    setAdding(false)
  }

  return (
    <article className="product-card" aria-label={product.name}>
      {/* Image */}
      <div className="product-card__image-wrap">
        <img
          src={product.image}
          alt={product.name}
          className="product-card__image"
          loading="lazy"
          onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop' }}
        />
        <div className="product-card__overlay">
          <button
            className="product-card__action-btn"
            onClick={() => onViewDetail(product)}
            aria-label={`Quick view ${product.name}`}
            title="Quick view"
          >
            <Eye size={16} />
          </button>
          <button
            className={`product-card__action-btn product-card__action-btn--heart ${liked ? 'liked' : ''}`}
            onClick={() => setLiked(l => !l)}
            aria-label={liked ? 'Remove from wishlist' : 'Add to wishlist'}
            aria-pressed={liked}
            title="Wishlist"
          >
            <Heart size={16} fill={liked ? '#FF6584' : 'transparent'} color={liked ? '#FF6584' : 'currentColor'} />
          </button>
        </div>
        {product.badge && (
          <span className={`product-card__badge badge-${product.badge === 'Sale' ? 'accent' : product.badge === 'New' ? 'success' : 'primary'}`}>
            {product.badge}
          </span>
        )}
        {discount > 0 && (
          <span className="product-card__discount">-{discount}%</span>
        )}
        {product.stock <= 5 && (
          <div className="product-card__stock-bar">
            <div className="product-card__stock-bar-fill" style={{ width: `${(product.stock / 20) * 100}%` }} />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="product-card__body">
        <div className="product-card__meta">
          <span className="product-card__brand">{product.brand}</span>
          <span className="product-card__category">{product.category}</span>
        </div>
        <h3 className="product-card__name">{product.name}</h3>

        <StarRating rating={product.rating} />
        <p className="product-card__reviews">({product.reviewCount.toLocaleString()} reviews)</p>

        <div className="product-card__colors">
          {product.colors.map((c, i) => (
            <button
              key={i}
              className="product-card__color-dot"
              style={{ background: c }}
              aria-label={`Color option ${i + 1}`}
            />
          ))}
        </div>

        <div className="product-card__price-row">
          <div className="product-card__prices">
            <span className="product-card__price">${product.price.toFixed(2)}</span>
            {discount > 0 && (
              <span className="product-card__original-price">${product.originalPrice.toFixed(2)}</span>
            )}
          </div>
          <span className="product-card__stock-text">
            {product.stock <= 5 ? `Only ${product.stock} left!` : 'In Stock'}
          </span>
        </div>

        <button
          id={`add-to-cart-${product.id}`}
          className={`product-card__cart-btn ${adding ? 'adding' : ''}`}
          onClick={handleAddToCart}
          disabled={adding || product.stock === 0}
          aria-label={`Add ${product.name} to cart`}
        >
          {adding ? (
            <>
              <div className="btn-spinner" />
              Adding…
            </>
          ) : (
            <>
              <ShoppingCart size={16} />
              Add to Cart
            </>
          )}
        </button>
      </div>
    </article>
  )
}
