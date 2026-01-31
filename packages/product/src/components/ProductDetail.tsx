import { eventBus, EVENTS } from '@ecommerce/shared';
import './ProductDetail.css';

interface ProductDetailProps {
    productId?: string;
}

// Mock product data for demonstration
const mockProduct = {
    id: '1',
    name: 'Premium Wireless Headphones',
    description: 'Experience unparalleled audio quality with our Premium Wireless Headphones. Featuring advanced noise cancellation technology, 40-hour battery life, and premium memory foam ear cushions for all-day comfort. Perfect for music lovers, professionals, and travelers alike.',
    price: 299,
    originalPrice: 349,
    images: [
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
        'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800',
        'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800',
    ],
    category: 'Electronics',
    tags: ['wireless', 'audio', 'premium', 'noise-cancelling'],
    stock: 50,
    rating: 4.8,
    reviewCount: 234,
    features: [
        'Active Noise Cancellation',
        '40-Hour Battery Life',
        'Premium Memory Foam Cushions',
        'Bluetooth 5.2 Connectivity',
        'Touch Controls',
        'Voice Assistant Support',
    ],
};

export default function ProductDetail({ productId }: ProductDetailProps) {
    const product = mockProduct; // In real app, fetch by productId

    const handleAddToCart = () => {
        eventBus.emit(EVENTS.ADD_TO_CART, { productId: product.id, quantity: 1 });
    };

    return (
        <div className="product-detail">
            <div className="product-detail-grid">
                {/* Image Gallery */}
                <div className="product-gallery">
                    <div className="main-image-container">
                        <img src={product.images[0]} alt={product.name} className="main-image" />
                    </div>
                    <div className="thumbnail-grid">
                        {product.images.map((image, index) => (
                            <button key={index} className="thumbnail-btn">
                                <img src={image} alt={`${product.name} ${index + 1}`} className="thumbnail-image" />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Product Info */}
                <div className="product-info-detail">
                    <span className="product-category-badge">{product.category}</span>
                    <h1 className="product-title">{product.name}</h1>

                    <div className="product-meta">
                        <div className="rating">
                            <span className="stars">{'★'.repeat(Math.floor(product.rating))}</span>
                            <span className="rating-value">{product.rating}</span>
                            <span className="review-count">({product.reviewCount} reviews)</span>
                        </div>
                        <span className={`stock-status ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                        </span>
                    </div>

                    <div className="price-section">
                        <span className="current-price">${product.price}</span>
                        {product.originalPrice > product.price && (
                            <>
                                <span className="original-price">${product.originalPrice}</span>
                                <span className="discount-badge">
                                    Save ${product.originalPrice - product.price}
                                </span>
                            </>
                        )}
                    </div>

                    <p className="product-description">{product.description}</p>

                    <div className="features-section">
                        <h3 className="features-title">Features</h3>
                        <ul className="features-list">
                            {product.features.map((feature, index) => (
                                <li key={index} className="feature-item">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                    {feature}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="action-buttons">
                        <button className="add-to-cart-btn-lg" onClick={handleAddToCart}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="9" cy="21" r="1" />
                                <circle cx="20" cy="21" r="1" />
                                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                            </svg>
                            Add to Cart
                        </button>
                        <button className="wishlist-btn-lg">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                            </svg>
                        </button>
                    </div>

                    <div className="product-tags">
                        {product.tags.map((tag) => (
                            <span key={tag} className="tag">#{tag}</span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
