/** @type {import('next').NextConfig} */
const NextFederationPlugin = require('@module-federation/nextjs-mf');

const remotes = (isServer) => {
  const location = isServer ? 'ssr' : 'chunks';
  return {
    home: `home@http://localhost:3001/_next/static/${location}/remoteEntry.js`,
    product: `product@http://localhost:3002/_next/static/${location}/remoteEntry.js`,
    cart: `cart@http://localhost:3003/assets/remoteEntry.js`,
    checkout: `checkout@http://localhost:3004/remoteEntry.js`,
    profile: `profile@http://localhost:3005/assets/remoteEntry.js`,
    admin: `admin@http://localhost:3006/_next/static/${location}/remoteEntry.js`,
  };
};

const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@ecommerce/shared'],
  webpack(config, options) {
    const { isServer } = options;
    
    config.plugins.push(
      new NextFederationPlugin({
        name: 'shell',
        filename: 'static/chunks/remoteEntry.js',
        remotes: remotes(isServer),
        shared: {
          react: {
            singleton: true,
            requiredVersion: false,
            eager: true,
          },
          'react-dom': {
            singleton: true,
            requiredVersion: false,
            eager: true,
          },
        },
        extraOptions: {
          exposePages: true,
          enableImageLoaderFix: true,
          enableUrlLoaderFix: true,
          skipSharingNextInternals: true,
        },
      })
    );
    
    return config;
  },
};

module.exports = nextConfig;
