/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0061F7',
        secondary: '#F1F4F8',
        'sidebar-bg': '#0F1D40',
        'task-pink': '#FEE7E2',
        'task-orange': '#FFF0E5',
        'task-purple': '#F0E9FF',
        'task-green': '#E7F2EC',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
