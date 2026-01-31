import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
    plugins: [
        vue(),
        federation({
            name: 'cart',
            filename: 'remoteEntry.js',
            exposes: {
                './CartPage': './src/components/CartPage.vue',
                './CartWidget': './src/components/CartWidget.vue',
            },
            shared: ['vue', 'pinia'],
        }),
    ],
    build: {
        modulePreload: false,
        target: 'esnext',
        minify: false,
        cssCodeSplit: false,
    },
    server: {
        port: 3003,
        cors: true,
    },
    preview: {
        port: 3003,
        cors: true,
    },
});
