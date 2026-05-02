import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation'
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin'

export default defineConfig({
  plugins: [
    react(),
    nxViteTsPaths(),
    federation({
      name: 'shell',
      remotes: {
        homeMfe: 'http://localhost:3004/assets/remoteEntry.js',
        productsMfe: 'http://localhost:3001/assets/remoteEntry.js',
        cartMfe: 'http://localhost:3002/assets/remoteEntry.js',
        checkoutMfe: 'http://localhost:3003/remoteEntry.js',
      },
      shared: ['react', 'react-dom'],
    }),
  ],
  server: { port: 3100, strictPort: true },
  preview: { port: 3100, strictPort: true },
  build: {
    target: 'esnext',
    minify: false,
    cssCodeSplit: false,
  },
})
