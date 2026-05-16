/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#050505",
        surface: "#0F1117",
        accent: "#4F8EF7",
        muted: "#8899A6",
      },
      fontFamily: {
        sans: ["DM Sans", "sans-serif"],
        heading: ["Syne", "sans-serif"],
      },
    },
  },
  plugins: [],
}
