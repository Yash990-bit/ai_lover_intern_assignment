// tailwind.config.js
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {

    extend: {

      colors: {
        primary: "rgb(var(--color-primary))",
        secondary: "rgb(var(--color-secondary))",
        "background-main": "var(--color-bg)",
        "background-card": "var(--color-card-bg)",
        "border-glass": "var(--color-card-border)",
        "text-primary": "var(--color-text-main)",
        "text-secondary": "var(--color-text-muted)",
        accent: "rgb(var(--color-secondary))",
        background: "var(--color-bg)",
        surface: "rgba(255, 255, 255, 0.7)",
      },

    },

  },
  // Disable unused backdrop core plugins – we use plain CSS instead
  corePlugins: {
    // backdropBlur: false,
    // backdropBrightness: false,
    // backdropContrast: false,
    // backdropGrayscale: false,
    // backdropHueRotate: false,
    // backdropInvert: false,
    // backdropOpacity: false,
    // backdropSaturate: false,
    // backdropSepia: false,
  },
  plugins: [],
};
