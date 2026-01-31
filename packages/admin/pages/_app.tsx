import type { AppProps } from 'next/app';
import '../src/components/AdminDashboard.css';

export default function App({ Component, pageProps }: AppProps) {
    return <Component {...pageProps} />;
}
