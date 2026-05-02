// vite.config.ts
import { defineConfig } from "file:///home/sudeep/Documents/LFREE_PROJECTS/Ecommerce-MFEs/node_modules/vite/dist/node/index.js";
import vue from "file:///home/sudeep/Documents/LFREE_PROJECTS/Ecommerce-MFEs/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import federation from "file:///home/sudeep/Documents/LFREE_PROJECTS/Ecommerce-MFEs/node_modules/@originjs/vite-plugin-federation/dist/index.mjs";
var vite_config_default = defineConfig({
  plugins: [
    vue(),
    federation({
      name: "cart",
      filename: "remoteEntry.js",
      exposes: {
        "./CartPage": "./src/components/CartPage.vue",
        "./CartWidget": "./src/components/CartWidget.vue"
      },
      shared: ["vue", "pinia"]
    })
  ],
  build: {
    modulePreload: false,
    target: "esnext",
    minify: false,
    cssCodeSplit: false
  },
  server: {
    port: 3003,
    cors: true
  },
  preview: {
    port: 3003,
    cors: true
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9zdWRlZXAvRG9jdW1lbnRzL0xGUkVFX1BST0pFQ1RTL0Vjb21tZXJjZS1NRkVzL3BhY2thZ2VzL2NhcnRcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9ob21lL3N1ZGVlcC9Eb2N1bWVudHMvTEZSRUVfUFJPSkVDVFMvRWNvbW1lcmNlLU1GRXMvcGFja2FnZXMvY2FydC92aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vaG9tZS9zdWRlZXAvRG9jdW1lbnRzL0xGUkVFX1BST0pFQ1RTL0Vjb21tZXJjZS1NRkVzL3BhY2thZ2VzL2NhcnQvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCB2dWUgZnJvbSAnQHZpdGVqcy9wbHVnaW4tdnVlJztcbmltcG9ydCBmZWRlcmF0aW9uIGZyb20gJ0BvcmlnaW5qcy92aXRlLXBsdWdpbi1mZWRlcmF0aW9uJztcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgICBwbHVnaW5zOiBbXG4gICAgICAgIHZ1ZSgpLFxuICAgICAgICBmZWRlcmF0aW9uKHtcbiAgICAgICAgICAgIG5hbWU6ICdjYXJ0JyxcbiAgICAgICAgICAgIGZpbGVuYW1lOiAncmVtb3RlRW50cnkuanMnLFxuICAgICAgICAgICAgZXhwb3Nlczoge1xuICAgICAgICAgICAgICAgICcuL0NhcnRQYWdlJzogJy4vc3JjL2NvbXBvbmVudHMvQ2FydFBhZ2UudnVlJyxcbiAgICAgICAgICAgICAgICAnLi9DYXJ0V2lkZ2V0JzogJy4vc3JjL2NvbXBvbmVudHMvQ2FydFdpZGdldC52dWUnLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHNoYXJlZDogWyd2dWUnLCAncGluaWEnXSxcbiAgICAgICAgfSksXG4gICAgXSxcbiAgICBidWlsZDoge1xuICAgICAgICBtb2R1bGVQcmVsb2FkOiBmYWxzZSxcbiAgICAgICAgdGFyZ2V0OiAnZXNuZXh0JyxcbiAgICAgICAgbWluaWZ5OiBmYWxzZSxcbiAgICAgICAgY3NzQ29kZVNwbGl0OiBmYWxzZSxcbiAgICB9LFxuICAgIHNlcnZlcjoge1xuICAgICAgICBwb3J0OiAzMDAzLFxuICAgICAgICBjb3JzOiB0cnVlLFxuICAgIH0sXG4gICAgcHJldmlldzoge1xuICAgICAgICBwb3J0OiAzMDAzLFxuICAgICAgICBjb3JzOiB0cnVlLFxuICAgIH0sXG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBd1gsU0FBUyxvQkFBb0I7QUFDclosT0FBTyxTQUFTO0FBQ2hCLE9BQU8sZ0JBQWdCO0FBRXZCLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQ3hCLFNBQVM7QUFBQSxJQUNMLElBQUk7QUFBQSxJQUNKLFdBQVc7QUFBQSxNQUNQLE1BQU07QUFBQSxNQUNOLFVBQVU7QUFBQSxNQUNWLFNBQVM7QUFBQSxRQUNMLGNBQWM7QUFBQSxRQUNkLGdCQUFnQjtBQUFBLE1BQ3BCO0FBQUEsTUFDQSxRQUFRLENBQUMsT0FBTyxPQUFPO0FBQUEsSUFDM0IsQ0FBQztBQUFBLEVBQ0w7QUFBQSxFQUNBLE9BQU87QUFBQSxJQUNILGVBQWU7QUFBQSxJQUNmLFFBQVE7QUFBQSxJQUNSLFFBQVE7QUFBQSxJQUNSLGNBQWM7QUFBQSxFQUNsQjtBQUFBLEVBQ0EsUUFBUTtBQUFBLElBQ0osTUFBTTtBQUFBLElBQ04sTUFBTTtBQUFBLEVBQ1Y7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNMLE1BQU07QUFBQSxJQUNOLE1BQU07QUFBQSxFQUNWO0FBQ0osQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
