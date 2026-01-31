import './PromoSection.css';

export default function PromoSection() {
    return (
        <section className="promo-section">
            <div className="promo-card main-promo">
                <div className="promo-content">
                    <span className="promo-badge">Limited Time</span>
                    <h2 className="promo-title">Summer Sale</h2>
                    <p className="promo-description">Up to 50% off on selected items</p>
                    <a href="/products?sale=true" className="promo-btn">Shop Now</a>
                </div>
                <div className="promo-decoration">
                    <div className="circle circle-1"></div>
                    <div className="circle circle-2"></div>
                    <div className="circle circle-3"></div>
                </div>
            </div>

            <div className="promo-grid">
                <div className="promo-card secondary-promo">
                    <div className="promo-content">
                        <span className="promo-tag">Free Shipping</span>
                        <h3 className="promo-subtitle">On orders over $100</h3>
                        <a href="/products" className="promo-link">Learn More →</a>
                    </div>
                </div>

                <div className="promo-card secondary-promo">
                    <div className="promo-content">
                        <span className="promo-tag">New Arrivals</span>
                        <h3 className="promo-subtitle">Fresh styles just dropped</h3>
                        <a href="/products?sort=newest" className="promo-link">Explore →</a>
                    </div>
                </div>
            </div>
        </section>
    );
}
