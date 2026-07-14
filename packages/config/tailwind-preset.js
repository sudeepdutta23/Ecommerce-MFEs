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
        // SudeepMart primary blue
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
        'card-hover': '0 12px 24px -6px rgb(15 23 42 / 0.14), 0 4px 8px -4px rgb(15 23 42 / 0.10)',
        glow: '0 0 0 3px rgb(0 142 204 / 0.15), 0 8px 24px -4px rgb(0 142 204 / 0.35)',
      },
      maxWidth: {
        content: '72rem',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'fade-in-up': {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-down': {
          from: { opacity: '0', transform: 'translateY(-12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.92)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        'slide-in-right': {
          from: { opacity: '0', transform: 'translateX(32px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        pop: {
          '0%': { transform: 'scale(1)' },
          '40%': { transform: 'scale(1.35)' },
          '100%': { transform: 'scale(1)' },
        },
        shimmer: {
          from: { backgroundPosition: '200% 0' },
          to: { backgroundPosition: '-200% 0' },
        },
        'pulse-ring': {
          '0%': { boxShadow: '0 0 0 0 rgb(0 142 204 / 0.35)' },
          '70%': { boxShadow: '0 0 0 10px rgb(0 142 204 / 0)' },
          '100%': { boxShadow: '0 0 0 0 rgb(0 142 204 / 0)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-4deg)' },
          '50%': { transform: 'rotate(4deg)' },
        },
        'gradient-pan': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-out both',
        'fade-in-up': 'fade-in-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-in-down': 'fade-in-down 0.4s ease-out both',
        'scale-in': 'scale-in 0.35s cubic-bezier(0.16, 1, 0.3, 1) both',
        'slide-in-right': 'slide-in-right 0.5s cubic-bezier(0.16, 1, 0.3, 1) both',
        float: 'float 4s ease-in-out infinite',
        pop: 'pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        shimmer: 'shimmer 1.8s linear infinite',
        'pulse-ring': 'pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        wiggle: 'wiggle 0.5s ease-in-out',
        'gradient-pan': 'gradient-pan 8s ease infinite',
      },
      transitionTimingFunction: {
        spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
};
