/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', "system-ui", "sans-serif"],
        display: ['"Outfit"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "monospace"]
      },
      colors: {
        obsidian: {
          950: "#06060C",
          900: "#090914",
          850: "#0D0C1D",
          800: "#121124",
          750: "#181730",
          700: "#1F1E3D"
        }
      }
    }
  },
  plugins: []
};
