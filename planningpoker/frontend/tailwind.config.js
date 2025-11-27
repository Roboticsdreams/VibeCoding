/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        blue: {
          50: '#e6f0ff',
          100: '#cce0ff',
          200: '#99c2ff',
          300: '#66a3ff',
          400: '#3385ff',
          500: '#0066ff',
          600: '#0052cc',
          700: '#003d99',
          800: '#002966',
          900: '#001433',
        },
        primary: {
          50: '#f3e8ff',
          100: '#e1ccff',
          200: '#c299ff',
          300: '#a366ff',
          400: '#8040ff',
          500: '#6600e6',
          600: '#5900b3',
          700: '#4d0099',
          800: '#400080',
          900: '#2a0052',
        },
      },
    },
  },
  plugins: [],
}
