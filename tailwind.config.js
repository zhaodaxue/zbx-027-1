/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1rem",
    },
    extend: {
      colors: {
        bamboo: {
          50: "#f4f7f1",
          100: "#e6efde",
          200: "#cedfbf",
          300: "#a8c790",
          400: "#81ab60",
          500: "#628e43",
          600: "#4b7133",
          700: "#3b582a",
          800: "#324726",
          900: "#2b3c22",
          950: "#14200f",
        },
        sun: {
          50: "#fff8ed",
          100: "#ffefd4",
          200: "#ffdba8",
          300: "#ffc071",
          400: "#ff9a38",
          500: "#ff7a0f",
          600: "#f05e06",
          700: "#c74407",
          800: "#9e360e",
          900: "#7f2e0f",
        },
        rice: {
          50: "#fbf9f4",
          100: "#f5f0e5",
          200: "#ebe0ca",
        },
      },
      fontFamily: {
        serif: [
          '"Noto Serif SC"',
          '"Source Han Serif SC"',
          '"Songti SC"',
          "SimSun",
          "serif",
        ],
      },
      boxShadow: {
        card: "0 2px 8px rgba(43, 60, 34, 0.08), 0 1px 3px rgba(43, 60, 34, 0.05)",
        "card-hover":
          "0 8px 24px rgba(43, 60, 34, 0.12), 0 2px 6px rgba(43, 60, 34, 0.06)",
      },
    },
  },
  plugins: [],
};
