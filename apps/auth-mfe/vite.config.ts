import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import federation from '@originjs/vite-plugin-federation'
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin'

export default defineConfig({
  plugins: [
    vue(),
    nxViteTsPaths(),
    federation({
      name: 'authMfe',
      filename: 'remoteEntry.js',
      exposes: {
        './AuthApp': './src/bootstrap.ts',
      },
      shared: ['vue', 'pinia'],
    }),
  ],
  server: { port: 3005, cors: true, strictPort: true },
  preview: { port: 3005, strictPort: true },
  build: {
    target: 'esnext',
    minify: false,
    cssCodeSplit: false,
  },
})
