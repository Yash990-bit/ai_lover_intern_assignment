// tailwind.config.cjs
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        "primary-fixed": 'var(--color-primary-fixed)',
        "on-primary": 'var(--color-on-primary)',
        "on-surface": 'var(--color-on-surface)',
        "background-main": 'var(--color-background-main)',
        "card-surface": 'var(--color-card-surface)',
        "surface": 'var(--color-surface)',
        "accent-glow": 'var(--color-accent-glow)',
        "border-glass": 'var(--color-border-glass)',
      },
      backdropBlur: {
        xs: '4px',
        sm: '8px',
        md: '12px',
      },
      boxShadow: {
        glass: '0 0 30px rgba(99, 102, 241, 0.2)',
      },
    },
  },
  plugins: [],
};
