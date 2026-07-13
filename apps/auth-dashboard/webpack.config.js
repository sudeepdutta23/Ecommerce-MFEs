const createMfeConfig = require('@ecom/config/webpack/create-mfe-config');

module.exports = createMfeConfig({
  name: 'authDashboard',
  appDir: __dirname,
  port: 3001,
  exposes: {
    './App': './src/App',
    './mount': './src/mount',
  },
});
