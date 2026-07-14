const createMfeConfig = require('@ecom/config/webpack/create-mfe-config');

module.exports = createMfeConfig({
  name: 'cart',
  appDir: __dirname,
  port: 3004,
  exposes: {
    './App': './src/App',
    './mount': './src/mount',
  },
});
