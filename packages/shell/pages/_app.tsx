import type { AppProps } from 'next/app';
import dynamic from 'next/dynamic';
import '@/styles/globals.css';

// Dynamic imports to avoid SSR issues with Module Federation React singleton
const Header = dynamic(() => import('@/components/Header'), { ssr: false });
const Footer = dynamic(() => import('@/components/Footer'), { ssr: false });

export default function App({ Component, pageProps }: AppProps) {
    return (
        <div className="app-container">
            <Header />
            <main className="main-content">
                <Component {...pageProps} />
            </main>
            <Footer />
        </div>
    );
}
