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

        primary: "hsl(210, 50%, 55%)",

        accent: "hsl(340, 70%, 60%)",

        background: "hsl(0, 0%, 100%)",

        surface: "hsl(0, 0%, 98%)",
        
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
