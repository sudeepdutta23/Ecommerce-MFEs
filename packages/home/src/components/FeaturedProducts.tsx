import { eventBus, EVENTS } from '@ecommerce/shared';
import './FeaturedProducts.css';

const products = [
    {
        id: '1',
        name: 'Premium Wireless Headphones',
        price: 299,
        originalPrice: 349,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
        rating: 4.8,
        reviews: 234,
        badge: 'Best Seller',
    },
    {
        id: '2',
        name: 'Smart Watch Pro',
        price: 449,
        originalPrice: 499,
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
        rating: 4.9,
        reviews: 189,
        badge: 'New',
    },
    {
        id: '3',
        name: 'Minimalist Backpack',
        price: 89,
        originalPrice: 129,
        image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400',
        rating: 4.7,
        reviews: 156,
        badge: 'Sale',
    },
    {
        id: '4',
        name: 'Wireless Earbuds',
        price: 159,
        originalPrice: 199,
        image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400',
        rating: 4.6,
        reviews: 312,
    },
];

export default function FeaturedProducts() {
    const handleAddToCart = (productId: string) => {
        eventBus.emit(EVENTS.ADD_TO_CART, { productId, quantity: 1 });
    };

    return (
        <section className="featured-products">
            <div className="section-header">
                <div>
                    <h2 className="section-title">Featured Products</h2>
                    <p className="section-subtitle">Handpicked items just for you</p>
                </div>
                <a href="/products" className="view-all">
                    View All
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                </a>
            </div>

            <div className="products-grid">
                {products.map((product, index) => (
                    <div
                        key={product.id}
                        className="product-card"
                        style={{ '--delay': `${index * 0.1}s` } as React.CSSProperties}
                    >
                        <div className="product-image-container">
                            <img src={product.image} alt={product.name} className="product-image" />
                            {product.badge && (
                                <span className={`product-badge ${product.badge.toLowerCase().replace(' ', '-')}`}>
                                    {product.badge}
                                </span>
                            )}
                            <div className="product-actions">
                                <button className="action-btn wishlist" aria-label="Add to wishlist">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                    </svg>
                                </button>
                                <button className="action-btn quick-view" aria-label="Quick view">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                        <circle cx="12" cy="12" r="3" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="product-info">
                            <div className="product-rating">
                                <span className="stars">★</span>
                                <span className="rating-value">{product.rating}</span>
                                <span className="rating-count">({product.reviews})</span>
                            </div>
                            <h3 className="product-name">{product.name}</h3>
                            <div className="product-price">
                                <span className="current-price">${product.price}</span>
                                {product.originalPrice && (
                                    <span className="original-price">${product.originalPrice}</span>
                                )}
                            </div>
                            <button
                                className="add-to-cart-btn"
                                onClick={() => handleAddToCart(product.id)}
                            >
                                Add to Cart
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
