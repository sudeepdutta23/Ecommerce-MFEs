import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const RemoteCart = dynamic(
    () => import('cart/CartPage').catch(() => {
        return () => <FallbackCart />;
    }),
    {
        ssr: false,
        loading: () => <CartLoading />,
    }
);

function CartLoading() {
    return (
        <div className="cart-loading">
            <h1 className="loading-title pulse"></h1>
            <div className="cart-layout">
                <div className="cart-items">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="loading-item">
                            <div className="loading-image pulse"></div>
                            <div className="loading-details">
                                <div className="loading-text pulse"></div>
                                <div className="loading-text-sm pulse"></div>
                                <div className="loading-controls pulse"></div>
                            </div>
                            <div className="loading-price pulse"></div>
                        </div>
                    ))}
                </div>
                <div className="cart-summary">
                    <div className="loading-summary pulse"></div>
                </div>
            </div>
            <style jsx>{`
                .cart-loading { padding: 2rem 0; }
                .loading-title { width: 150px; height: 40px; background: var(--color-bg-tertiary); border-radius: 8px; margin-bottom: 2rem; }
                .cart-layout { display: grid; grid-template-columns: 1fr 350px; gap: 2rem; }
                .cart-items { display: flex; flex-direction: column; gap: 1rem; }
                .loading-item { display: flex; gap: 1rem; padding: 1.5rem; background: var(--color-bg-tertiary); border-radius: 16px; }
                .loading-image { width: 100px; height: 100px; background: rgba(255,255,255,0.05); border-radius: 8px; }
                .loading-details { flex: 1; }
                .loading-text { width: 60%; height: 20px; background: rgba(255,255,255,0.08); border-radius: 4px; margin-bottom: 0.5rem; }
                .loading-text-sm { width: 40%; height: 16px; background: rgba(255,255,255,0.05); border-radius: 4px; margin-bottom: 1rem; }
                .loading-controls { width: 120px; height: 36px; background: rgba(255,255,255,0.05); border-radius: 8px; }
                .loading-price { width: 80px; height: 24px; background: rgba(255,255,255,0.08); border-radius: 4px; }
                .cart-summary { position: sticky; top: 100px; }
                .loading-summary { height: 300px; background: var(--color-bg-tertiary); border-radius: 16px; }
                .pulse { animation: pulse 1.5s ease-in-out infinite; }
                @keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.7; } }
                @media (max-width: 768px) { .cart-layout { grid-template-columns: 1fr; } }
            `}</style>
        </div>
    );
}

function FallbackCart() {
    return (
        <div className="fallback-cart">
            <h1>Shopping Cart</h1>
            <p>The Cart microfrontend is currently loading...</p>
            <p className="hint">Make sure the Cart MFE is running on port 3003</p>
            <style jsx>{`
                .fallback-cart { text-align: center; padding: 4rem 2rem; }
                h1 { font-size: 2.5rem; background: var(--color-accent-gradient); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 1rem; }
                p { color: var(--color-text-secondary); font-size: 1.1rem; }
                .hint { margin-top: 2rem; font-size: 0.9rem; color: var(--color-text-muted); }
            `}</style>
        </div>
    );
}

export default function CartPage() {
    return (
        <Suspense fallback={<CartLoading />}>
            <RemoteCart />
        </Suspense>
    );
}
