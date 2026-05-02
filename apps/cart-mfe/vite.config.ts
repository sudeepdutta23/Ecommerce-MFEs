import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import federation from '@originjs/vite-plugin-federation'
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin'

export default defineConfig({
  plugins: [
    vue(),
    nxViteTsPaths(),
    federation({
      name: 'cartMfe',
      filename: 'remoteEntry.js',
      exposes: {
        './CartApp': './src/bootstrap.ts',
      },
      shared: ['vue', 'pinia'],
    }),
  ],
  server: { port: 3002, cors: true, strictPort: true },
  preview: { port: 3002, strictPort: true },
  build: {
    target: 'esnext',
    minify: false,
    cssCodeSplit: false,
  },
})
