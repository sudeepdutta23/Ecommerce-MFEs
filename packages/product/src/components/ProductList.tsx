import { useState } from 'react';
import { eventBus, EVENTS } from '@ecommerce/shared';
import { useProductStore } from '../store/productStore';
import './ProductList.css';

// Mock product data
const mockProducts = [
    {
        id: '1',
        name: 'Premium Wireless Headphones',
        description: 'High-quality wireless headphones with noise cancellation',
        price: 299,
        originalPrice: 349,
        images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400'],
        category: 'Electronics',
        tags: ['wireless', 'audio', 'premium'],
        stock: 50,
        rating: 4.8,
        reviewCount: 234,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-15',
    },
    {
        id: '2',
        name: 'Smart Watch Pro',
        description: 'Feature-rich smartwatch with health monitoring',
        price: 449,
        originalPrice: 499,
        images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'],
        category: 'Electronics',
        tags: ['smartwatch', 'fitness', 'tech'],
        stock: 30,
        rating: 4.9,
        reviewCount: 189,
        createdAt: '2024-01-05',
        updatedAt: '2024-01-20',
    },
    {
        id: '3',
        name: 'Minimalist Backpack',
        description: 'Sleek and functional backpack for everyday use',
        price: 89,
        originalPrice: 129,
        images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400'],
        category: 'Fashion',
        tags: ['bag', 'travel', 'minimalist'],
        stock: 100,
        rating: 4.7,
        reviewCount: 156,
        createdAt: '2024-01-10',
        updatedAt: '2024-01-25',
    },
    {
        id: '4',
        name: 'Wireless Earbuds',
        description: 'Compact true wireless earbuds with crystal clear sound',
        price: 159,
        originalPrice: 199,
        images: ['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400'],
        category: 'Electronics',
        tags: ['wireless', 'audio', 'compact'],
        stock: 75,
        rating: 4.6,
        reviewCount: 312,
        createdAt: '2024-01-12',
        updatedAt: '2024-01-28',
    },
    {
        id: '5',
        name: 'Designer Sunglasses',
        description: 'Premium polarized sunglasses with UV protection',
        price: 199,
        originalPrice: 249,
        images: ['https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400'],
        category: 'Fashion',
        tags: ['eyewear', 'summer', 'designer'],
        stock: 45,
        rating: 4.5,
        reviewCount: 98,
        createdAt: '2024-01-15',
        updatedAt: '2024-02-01',
    },
    {
        id: '6',
        name: 'Leather Wallet',
        description: 'Genuine leather bifold wallet with RFID protection',
        price: 79,
        originalPrice: 99,
        images: ['https://images.unsplash.com/photo-1627123424574-724758594e93?w=400'],
        category: 'Fashion',
        tags: ['leather', 'accessories', 'gift'],
        stock: 120,
        rating: 4.7,
        reviewCount: 167,
        createdAt: '2024-01-18',
        updatedAt: '2024-02-05',
    },
    {
        id: '7',
        name: 'Mechanical Keyboard',
        description: 'RGB mechanical keyboard with custom switches',
        price: 179,
        originalPrice: 229,
        images: ['https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400'],
        category: 'Electronics',
        tags: ['gaming', 'keyboard', 'rgb'],
        stock: 60,
        rating: 4.8,
        reviewCount: 423,
        createdAt: '2024-01-20',
        updatedAt: '2024-02-10',
    },
    {
        id: '8',
        name: 'Running Shoes',
        description: 'Lightweight running shoes with responsive cushioning',
        price: 129,
        originalPrice: 159,
        images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400'],
        category: 'Sports',
        tags: ['running', 'fitness', 'athletic'],
        stock: 85,
        rating: 4.6,
        reviewCount: 278,
        createdAt: '2024-01-22',
        updatedAt: '2024-02-12',
    },
];

const categories = ['All', 'Electronics', 'Fashion', 'Sports', 'Home & Living'];
const sortOptions = [
    { value: 'featured', label: 'Featured' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'newest', label: 'Newest' },
];

export default function ProductList() {
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [sortBy, setSortBy] = useState('featured');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredProducts = mockProducts
        .filter((product) => {
            if (selectedCategory !== 'All' && product.category !== selectedCategory) {
                return false;
            }
            if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase())) {
                return false;
            }
            return true;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case 'price-low':
                    return a.price - b.price;
                case 'price-high':
                    return b.price - a.price;
                case 'rating':
                    return b.rating - a.rating;
                case 'newest':
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                default:
                    return 0;
            }
        });

    const handleAddToCart = (productId: string) => {
        eventBus.emit(EVENTS.ADD_TO_CART, { productId, quantity: 1 });
    };

    return (
        <div className="product-list-container">
            {/* Header */}
            <div className="product-list-header">
                <div className="header-left">
                    <h1 className="page-title">All Products</h1>
                    <p className="results-count">{filteredProducts.length} products found</p>
                </div>

                {/* Search */}
                <div className="search-container">
                    <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8" />
                        <path d="m21 21-4.35-4.35" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-input"
                    />
                </div>
            </div>

            {/* Filters */}
            <div className="filters-bar">
                <div className="category-filters">
                    {categories.map((category) => (
                        <button
                            key={category}
                            className={`filter-btn ${selectedCategory === category ? 'active' : ''}`}
                            onClick={() => setSelectedCategory(category)}
                        >
                            {category}
                        </button>
                    ))}
                </div>

                <div className="sort-container">
                    <label className="sort-label">Sort by:</label>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="sort-select"
                    >
                        {sortOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Product Grid */}
            <div className="products-grid">
                {filteredProducts.map((product, index) => (
                    <div
                        key={product.id}
                        className="product-card"
                        style={{ '--delay': `${index * 0.05}s` } as React.CSSProperties}
                    >
                        <div className="product-image-container">
                            <img src={product.images[0]} alt={product.name} className="product-image" />
                            {product.originalPrice > product.price && (
                                <span className="discount-badge">
                                    -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                                </span>
                            )}
                            <div className="product-overlay">
                                <button className="overlay-btn wishlist">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                    </svg>
                                </button>
                                <button className="overlay-btn quick-view">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                        <circle cx="12" cy="12" r="3" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="product-info">
                            <span className="product-category">{product.category}</span>
                            <h3 className="product-name">{product.name}</h3>

                            <div className="product-rating">
                                <span className="stars">★</span>
                                <span className="rating-value">{product.rating}</span>
                                <span className="rating-count">({product.reviewCount})</span>
                            </div>

                            <div className="product-price">
                                <span className="current-price">${product.price}</span>
                                {product.originalPrice > product.price && (
                                    <span className="original-price">${product.originalPrice}</span>
                                )}
                            </div>

                            <button
                                className="add-to-cart-btn"
                                onClick={() => handleAddToCart(product.id)}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="9" cy="21" r="1" />
                                    <circle cx="20" cy="21" r="1" />
                                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                                </svg>
                                Add to Cart
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
