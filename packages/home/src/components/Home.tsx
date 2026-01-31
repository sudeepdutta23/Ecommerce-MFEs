import { useState, useEffect } from 'react';
import { eventBus, EVENTS } from '@ecommerce/shared';
import HeroSection from './HeroSection';
import FeaturedProducts from './FeaturedProducts';
import Categories from './Categories';
import PromoSection from './PromoSection';
import './Home.css';

export default function Home() {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        setIsLoaded(true);
    }, []);

    const handleShopNow = () => {
        eventBus.emit(EVENTS.NAVIGATE, { path: '/products' });
    };

    return (
        <div className={`home-container ${isLoaded ? 'loaded' : ''}`}>
            <HeroSection onShopNow={handleShopNow} />
            <Categories />
            <FeaturedProducts />
            <PromoSection />
        </div>
    );
}
