import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const RemoteProductList = dynamic(
    () => import('product/ProductList').catch(() => {
        return () => <FallbackProducts />;
    }),
    {
        ssr: false,
        loading: () => <ProductsLoading />,
    }
);

function ProductsLoading() {
    return (
        <div className="products-loading">
            <div className="loading-header">
                <div className="loading-title pulse"></div>
                <div className="loading-filters">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="loading-filter pulse"></div>
                    ))}
                </div>
            </div>
            <div className="loading-grid">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <div key={i} className="loading-card">
                        <div className="loading-image pulse"></div>
                        <div className="loading-info">
                            <div className="loading-text pulse"></div>
                            <div className="loading-text-sm pulse"></div>
                            <div className="loading-price pulse"></div>
                        </div>
                    </div>
                ))}
            </div>
            <style jsx>{`
                .products-loading { padding: 2rem 0; }
                .loading-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
                .loading-title { width: 200px; height: 32px; background: var(--color-bg-tertiary); border-radius: 8px; }
                .loading-filters { display: flex; gap: 1rem; }
                .loading-filter { width: 100px; height: 40px; background: var(--color-bg-tertiary); border-radius: 8px; }
                .loading-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1.5rem; }
                .loading-card { background: var(--color-bg-tertiary); border-radius: 16px; overflow: hidden; }
                .loading-image { height: 240px; background: rgba(255,255,255,0.05); }
                .loading-info { padding: 1rem; }
                .loading-text { height: 20px; background: rgba(255,255,255,0.08); border-radius: 4px; margin-bottom: 0.5rem; }
                .loading-text-sm { width: 60%; height: 16px; background: rgba(255,255,255,0.05); border-radius: 4px; margin-bottom: 0.75rem; }
                .loading-price { width: 80px; height: 24px; background: rgba(255,255,255,0.08); border-radius: 4px; }
                .pulse { animation: pulse 1.5s ease-in-out infinite; }
                @keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.7; } }
            `}</style>
        </div>
    );
}

function FallbackProducts() {
    return (
        <div className="fallback-products">
            <h1>Products</h1>
            <p>The Product microfrontend is currently loading...</p>
            <p className="hint">Make sure the Product MFE is running on port 3002</p>
            <style jsx>{`
                .fallback-products { text-align: center; padding: 4rem 2rem; }
                h1 { font-size: 2.5rem; background: var(--color-accent-gradient); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 1rem; }
                p { color: var(--color-text-secondary); font-size: 1.1rem; }
                .hint { margin-top: 2rem; font-size: 0.9rem; color: var(--color-text-muted); }
            `}</style>
        </div>
    );
}

export default function ProductsPage() {
    return (
        <Suspense fallback={<ProductsLoading />}>
            <RemoteProductList />
        </Suspense>
    );
}
