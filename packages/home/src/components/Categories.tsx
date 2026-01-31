import './Categories.css';

const categories = [
    { id: 1, name: 'Electronics', icon: '💻', count: 245, color: '#6366f1' },
    { id: 2, name: 'Fashion', icon: '👗', count: 180, color: '#8b5cf6' },
    { id: 3, name: 'Home & Living', icon: '🏠', count: 156, color: '#a855f7' },
    { id: 4, name: 'Sports', icon: '⚽', count: 98, color: '#ec4899' },
    { id: 5, name: 'Beauty', icon: '✨', count: 124, color: '#f59e0b' },
    { id: 6, name: 'Books', icon: '📚', count: 89, color: '#10b981' },
];

export default function Categories() {
    return (
        <section className="categories">
            <div className="section-header">
                <h2 className="section-title">Shop by Category</h2>
                <p className="section-subtitle">Browse our wide range of categories</p>
            </div>

            <div className="categories-grid">
                {categories.map((category, index) => (
                    <a
                        key={category.id}
                        href={`/products?category=${category.name.toLowerCase()}`}
                        className="category-card"
                        style={{
                            '--accent-color': category.color,
                            '--delay': `${index * 0.1}s`
                        } as React.CSSProperties}
                    >
                        <div className="category-icon">{category.icon}</div>
                        <div className="category-info">
                            <h3 className="category-name">{category.name}</h3>
                            <span className="category-count">{category.count} products</span>
                        </div>
                        <div className="category-arrow">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        </div>
                    </a>
                ))}
            </div>
        </section>
    );
}
