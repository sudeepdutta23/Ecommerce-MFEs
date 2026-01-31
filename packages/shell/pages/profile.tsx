import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const RemoteProfile = dynamic(
    () => import('profile/Profile').catch(() => {
        return () => <FallbackProfile />;
    }),
    {
        ssr: false,
        loading: () => <ProfileLoading />,
    }
);

function ProfileLoading() {
    return (
        <div className="profile-loading">
            <div className="profile-header">
                <div className="loading-avatar pulse"></div>
                <div className="loading-info">
                    <div className="loading-name pulse"></div>
                    <div className="loading-email pulse"></div>
                </div>
            </div>
            <div className="profile-tabs">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="loading-tab pulse"></div>
                ))}
            </div>
            <div className="profile-content">
                <div className="loading-card pulse"></div>
            </div>
            <style jsx>{`
                .profile-loading { padding: 2rem 0; }
                .profile-header { display: flex; align-items: center; gap: 1.5rem; margin-bottom: 2rem; }
                .loading-avatar { width: 100px; height: 100px; background: var(--color-bg-tertiary); border-radius: 50%; }
                .loading-info { display: flex; flex-direction: column; gap: 0.5rem; }
                .loading-name { width: 200px; height: 28px; background: var(--color-bg-tertiary); border-radius: 8px; }
                .loading-email { width: 150px; height: 20px; background: var(--color-bg-tertiary); border-radius: 6px; }
                .profile-tabs { display: flex; gap: 1rem; margin-bottom: 2rem; border-bottom: 1px solid var(--border-color); padding-bottom: 1rem; }
                .loading-tab { width: 100px; height: 36px; background: var(--color-bg-tertiary); border-radius: 8px; }
                .loading-card { height: 400px; background: var(--color-bg-tertiary); border-radius: 16px; }
                .pulse { animation: pulse 1.5s ease-in-out infinite; }
                @keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.7; } }
            `}</style>
        </div>
    );
}

function FallbackProfile() {
    return (
        <div className="fallback-profile">
            <h1>Profile</h1>
            <p>The Profile microfrontend is currently loading...</p>
            <p className="hint">Make sure the Profile MFE is running on port 3005</p>
            <style jsx>{`
                .fallback-profile { text-align: center; padding: 4rem 2rem; }
                h1 { font-size: 2.5rem; background: var(--color-accent-gradient); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 1rem; }
                p { color: var(--color-text-secondary); font-size: 1.1rem; }
                .hint { margin-top: 2rem; font-size: 0.9rem; color: var(--color-text-muted); }
            `}</style>
        </div>
    );
}

export default function ProfilePage() {
    return (
        <Suspense fallback={<ProfileLoading />}>
            <RemoteProfile />
        </Suspense>
    );
}
