import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
    plugins: [
        react(),
        federation({
            name: 'profile',
            filename: 'remoteEntry.js',
            exposes: {
                './Profile': './src/components/Profile',
                './OrderHistory': './src/components/OrderHistory',
            },
            shared: ['react', 'react-dom'],
        }),
    ],
    build: {
        modulePreload: false,
        target: 'esnext',
        minify: false,
        cssCodeSplit: false,
    },
    server: {
        port: 3005,
        cors: true,
        middlewareMode: false,
    },
    preview: {
        port: 3005,
        cors: true,
    },
});
