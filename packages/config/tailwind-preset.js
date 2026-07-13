/**
 * Shared Tailwind preset: the single source of truth for design tokens
 * (colors, typography, radii, shadows) across the shell and every MFE.
 *
 * Each app consumes this via `presets: [require('@ecom/config/tailwind-preset')]`
 * and remains free to extend/override tokens locally in its own tailwind.config.js.
 */
module.exports = {
  theme: {
    extend: {
      colors: {
        // MegaMart primary blue
        brand: {
          50: '#edf7fc',
          100: '#d6eefa',
          200: '#aeddf4',
          300: '#7cc7ec',
          400: '#3faade',
          500: '#008ecc',
          600: '#007db4',
          700: '#006894',
          800: '#005679',
          900: '#07425c',
        },
        // Hero banner / dark promo cards
        navy: '#212844',
        surface: {
          DEFAULT: '#ffffff',
          muted: '#f8fafc',
          sunken: '#f3f9fb',
          inverted: '#212844',
        },
        positive: '#249b3e',
        negative: '#b91c1c',
        warning: '#a16207',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Consolas', 'monospace'],
      },
      borderRadius: {
        card: '0.75rem',
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(15 23 42 / 0.08), 0 1px 2px -1px rgb(15 23 42 / 0.08)',
        'card-hover': '0 4px 12px 0 rgb(15 23 42 / 0.10), 0 2px 4px -2px rgb(15 23 42 / 0.10)',
      },
      maxWidth: {
        content: '72rem',
      },
    },
  },
};
