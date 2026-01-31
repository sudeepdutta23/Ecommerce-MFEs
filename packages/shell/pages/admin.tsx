import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const RemoteAdmin = dynamic(
    () => import('admin/AdminDashboard').catch(() => {
        return () => <FallbackAdmin />;
    }),
    {
        ssr: false,
        loading: () => <AdminLoading />,
    }
);

function AdminLoading() {
    return (
        <div className="admin-loading">
            <div className="admin-header">
                <div className="loading-title pulse"></div>
                <div className="loading-actions">
                    <div className="loading-btn pulse"></div>
                    <div className="loading-btn pulse"></div>
                </div>
            </div>
            <div className="admin-stats">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="loading-stat pulse"></div>
                ))}
            </div>
            <div className="admin-content">
                <div className="loading-chart pulse"></div>
                <div className="loading-table pulse"></div>
            </div>
            <style jsx>{`
                .admin-loading { padding: 2rem 0; }
                .admin-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
                .loading-title { width: 250px; height: 40px; background: var(--color-bg-tertiary); border-radius: 8px; }
                .loading-actions { display: flex; gap: 1rem; }
                .loading-btn { width: 120px; height: 40px; background: var(--color-bg-tertiary); border-radius: 8px; }
                .admin-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; margin-bottom: 2rem; }
                .loading-stat { height: 120px; background: var(--color-bg-tertiary); border-radius: 16px; }
                .admin-content { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
                .loading-chart { height: 350px; background: var(--color-bg-tertiary); border-radius: 16px; }
                .loading-table { height: 350px; background: var(--color-bg-tertiary); border-radius: 16px; }
                .pulse { animation: pulse 1.5s ease-in-out infinite; }
                @keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.7; } }
                @media (max-width: 1024px) { .admin-stats { grid-template-columns: repeat(2, 1fr); } .admin-content { grid-template-columns: 1fr; } }
            `}</style>
        </div>
    );
}

function FallbackAdmin() {
    return (
        <div className="fallback-admin">
            <h1>Admin Dashboard</h1>
            <p>The Admin microfrontend is currently loading...</p>
            <p className="hint">Make sure the Admin MFE is running on port 3006</p>
            <style jsx>{`
                .fallback-admin { text-align: center; padding: 4rem 2rem; }
                h1 { font-size: 2.5rem; background: var(--color-accent-gradient); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 1rem; }
                p { color: var(--color-text-secondary); font-size: 1.1rem; }
                .hint { margin-top: 2rem; font-size: 0.9rem; color: var(--color-text-muted); }
            `}</style>
        </div>
    );
}

export default function AdminPage() {
    return (
        <Suspense fallback={<AdminLoading />}>
            <RemoteAdmin />
        </Suspense>
    );
}
