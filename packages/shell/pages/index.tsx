import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const RemoteHome = dynamic(
    () => import('home/Home').catch(() => {
        return () => <FallbackHome />;
    }),
    {
        ssr: false,
        loading: () => <HomeLoading />,
    }
);

function HomeLoading() {
    return (
        <div className="home-loading">
            <div className="loading-hero">
                <div className="loading-text pulse"></div>
                <div className="loading-subtext pulse"></div>
                <div className="loading-button pulse"></div>
            </div>
            <div className="loading-products">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="loading-card pulse"></div>
                ))}
            </div>
            <style jsx>{`
                .home-loading { padding: 2rem; }
                .loading-hero { text-align: center; padding: 4rem 2rem; margin-bottom: 3rem; }
                .loading-text { height: 48px; width: 60%; margin: 0 auto 1rem; background: var(--color-bg-tertiary); border-radius: 8px; }
                .loading-subtext { height: 24px; width: 40%; margin: 0 auto 2rem; background: var(--color-bg-tertiary); border-radius: 8px; }
                .loading-button { height: 48px; width: 200px; margin: 0 auto; background: var(--color-bg-tertiary); border-radius: 12px; }
                .loading-products { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem; }
                .loading-card { height: 320px; background: var(--color-bg-tertiary); border-radius: 16px; }
                .pulse { animation: pulse 1.5s ease-in-out infinite; }
                @keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.7; } }
            `}</style>
        </div>
    );
}

function FallbackHome() {
    return (
        <div className="fallback-home">
            <section className="hero">
                <h1>Welcome to Our Store</h1>
                <p>The Home microfrontend is currently loading...</p>
                <p className="hint">Make sure the Home MFE is running on port 3001</p>
            </section>
            <style jsx>{`
                .fallback-home { text-align: center; padding: 4rem 2rem; }
                .hero h1 { font-size: 3rem; background: var(--color-accent-gradient); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 1rem; }
                .hero p { color: var(--color-text-secondary); font-size: 1.2rem; }
                .hint { margin-top: 2rem; font-size: 0.9rem; color: var(--color-text-muted); }
            `}</style>
        </div>
    );
}

export default function HomePage() {
    return (
        <Suspense fallback={<HomeLoading />}>
            <RemoteHome />
        </Suspense>
    );
}
