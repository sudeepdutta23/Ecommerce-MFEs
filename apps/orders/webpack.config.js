const createMfeConfig = require('@ecom/config/webpack/create-mfe-config');

module.exports = createMfeConfig({
  name: 'orders',
  appDir: __dirname,
  port: 3005,
  exposes: {
    './App': './src/App',
    './mount': './src/mount',
  },
});
