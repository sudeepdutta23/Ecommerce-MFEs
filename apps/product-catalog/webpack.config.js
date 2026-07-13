const createMfeConfig = require('@ecom/config/webpack/create-mfe-config');

module.exports = createMfeConfig({
  name: 'productCatalog',
  appDir: __dirname,
  port: 3002,
  exposes: {
    './App': './src/App',
    './mount': './src/mount',
  },
});
