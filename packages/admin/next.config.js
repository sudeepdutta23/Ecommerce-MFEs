/** @type {import('next').NextConfig} */
const NextFederationPlugin = require('@module-federation/nextjs-mf');

const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@ecommerce/shared'],
  webpack(config, options) {
    const { isServer } = options;
    
    config.plugins.push(
      new NextFederationPlugin({
        name: 'admin',
        filename: 'static/chunks/remoteEntry.js',
        exposes: {
          './AdminDashboard': './src/components/AdminDashboard',
        },
        shared: {
          react: {
            singleton: true,
            requiredVersion: false,
          },
          'react-dom': {
            singleton: true,
            requiredVersion: false,
          },
        },
        extraOptions: {
          exposePages: true,
        },
      })
    );
    
    return config;
  },
};

module.exports = nextConfig;
