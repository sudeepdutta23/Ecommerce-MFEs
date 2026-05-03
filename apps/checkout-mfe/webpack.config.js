const { shareAll, withModuleFederationPlugin } = require('@angular-architects/module-federation/webpack');

module.exports = withModuleFederationPlugin({
  name: 'checkoutMfe',
  filename: 'remoteEntry.js',
  exposes: {
    './CheckoutComponent': './src/app/checkout/checkout.component.ts',
  },
  shared: shareAll({ 
    singleton: true, 
    strictVersion: false, 
    requiredVersion: 'auto',
    includeSecondaries: true,
  }),
});

