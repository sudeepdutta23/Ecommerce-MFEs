import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const RemoteCheckout = dynamic(
    () => import('checkout/CheckoutModule').catch(() => {
        return () => <FallbackCheckout />;
    }),
    {
        ssr: false,
        loading: () => <CheckoutLoading />,
    }
);

function CheckoutLoading() {
    return (
        <div className="checkout-loading">
            <div className="checkout-steps">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="loading-step pulse"></div>
                ))}
            </div>
            <div className="checkout-layout">
                <div className="checkout-form">
                    <div className="loading-section pulse"></div>
                    <div className="loading-section pulse"></div>
                    <div className="loading-section-lg pulse"></div>
                </div>
                <div className="checkout-summary">
                    <div className="loading-summary pulse"></div>
                </div>
            </div>
            <style jsx>{`
                .checkout-loading { padding: 2rem 0; }
                .checkout-steps { display: flex; justify-content: center; gap: 2rem; margin-bottom: 3rem; }
                .loading-step { width: 120px; height: 40px; background: var(--color-bg-tertiary); border-radius: 20px; }
                .checkout-layout { display: grid; grid-template-columns: 1fr 400px; gap: 2rem; }
                .checkout-form { display: flex; flex-direction: column; gap: 1.5rem; }
                .loading-section { height: 150px; background: var(--color-bg-tertiary); border-radius: 16px; }
                .loading-section-lg { height: 200px; background: var(--color-bg-tertiary); border-radius: 16px; }
                .checkout-summary { position: sticky; top: 100px; }
                .loading-summary { height: 400px; background: var(--color-bg-tertiary); border-radius: 16px; }
                .pulse { animation: pulse 1.5s ease-in-out infinite; }
                @keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.7; } }
                @media (max-width: 768px) { .checkout-layout { grid-template-columns: 1fr; } }
            `}</style>
        </div>
    );
}

function FallbackCheckout() {
    return (
        <div className="fallback-checkout">
            <h1>Checkout</h1>
            <p>The Checkout microfrontend is currently loading...</p>
            <p className="hint">Make sure the Checkout MFE (Angular) is running on port 3004</p>
            <style jsx>{`
                .fallback-checkout { text-align: center; padding: 4rem 2rem; }
                h1 { font-size: 2.5rem; background: var(--color-accent-gradient); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 1rem; }
                p { color: var(--color-text-secondary); font-size: 1.1rem; }
                .hint { margin-top: 2rem; font-size: 0.9rem; color: var(--color-text-muted); }
            `}</style>
        </div>
    );
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={<CheckoutLoading />}>
            <RemoteCheckout />
        </Suspense>
    );
}
