import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
    plugins: [
        react(),
        federation({
            name: 'home',
            filename: 'remoteEntry.js',
            exposes: {
                './Home': './src/components/Home',
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
        port: 3001,
        cors: true,
        middlewareMode: false,
    },
    preview: {
        port: 3001,
        cors: true,
    },
});
