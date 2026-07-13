/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require('@ecom/config/tailwind-preset')],
  content: [
    './src/**/*.{ts,tsx}',
    './public/index.html',
    // The design-system package is consumed as source, so its classes must be scanned too.
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
};
