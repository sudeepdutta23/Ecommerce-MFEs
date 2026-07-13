/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require('@ecom/config/tailwind-preset')],
  content: ['./src/**/*.{ts,tsx}', './public/index.html', '../../packages/ui/src/**/*.{ts,tsx}'],
  // Local extensions are allowed — tokens here apply to this MFE only.
  theme: {
    extend: {},
  },
};
