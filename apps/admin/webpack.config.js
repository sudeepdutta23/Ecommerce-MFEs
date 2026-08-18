const createMfeConfig = require('@ecom/config/webpack/create-mfe-config');

module.exports = createMfeConfig({
  name: 'admin',
  appDir: __dirname,
  port: 3006,
  exposes: {
    './App': './src/App',
    './mount': './src/mount',
  },
});
