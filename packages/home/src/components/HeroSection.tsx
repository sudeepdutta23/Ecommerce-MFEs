import './HeroSection.css';

interface HeroSectionProps {
    onShopNow: () => void;
}

export default function HeroSection({ onShopNow }: HeroSectionProps) {
    return (
        <section className="hero">
            <div className="hero-bg">
                <div className="hero-gradient"></div>
                <div className="hero-particles">
                    {[...Array(20)].map((_, i) => (
                        <div key={i} className="particle" style={{
                            '--delay': `${i * 0.2}s`,
                            '--x': `${Math.random() * 100}%`,
                            '--y': `${Math.random() * 100}%`,
                        } as React.CSSProperties}></div>
                    ))}
                </div>
            </div>

            <div className="hero-content">
                <span className="hero-badge">✨ New Collection 2024</span>
                <h1 className="hero-title">
                    Discover Your
                    <span className="gradient-text"> Perfect Style</span>
                </h1>
                <p className="hero-description">
                    Explore our curated collection of premium products designed for the modern lifestyle.
                    Quality meets innovation.
                </p>
                <div className="hero-actions">
                    <button className="btn-primary" onClick={onShopNow}>
                        Shop Now
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </button>
                    <button className="btn-secondary">
                        View Catalog
                    </button>
                </div>
                <div className="hero-stats">
                    <div className="stat">
                        <span className="stat-number">50K+</span>
                        <span className="stat-label">Happy Customers</span>
                    </div>
                    <div className="stat-divider"></div>
                    <div className="stat">
                        <span className="stat-number">1000+</span>
                        <span className="stat-label">Products</span>
                    </div>
                    <div className="stat-divider"></div>
                    <div className="stat">
                        <span className="stat-number">4.9</span>
                        <span className="stat-label">Rating</span>
                    </div>
                </div>
            </div>
        </section>
    );
}
