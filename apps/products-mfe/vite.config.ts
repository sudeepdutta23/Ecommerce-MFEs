import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation'
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin'

export default defineConfig({
  plugins: [
    react(),
    nxViteTsPaths(),
    federation({
      name: 'productsMfe',
      filename: 'remoteEntry.js',
      exposes: {
        './App': './src/bootstrap.tsx',
      },
    }),
  ],
  server: { port: 3001, cors: true, strictPort: true },
  preview: { port: 3001, strictPort: true },
  build: {
    target: 'esnext',
    minify: false,
    cssCodeSplit: false,
  },
})
