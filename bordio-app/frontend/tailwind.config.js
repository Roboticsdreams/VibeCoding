/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0084FF',
        secondary: '#F6F8FA',
        success: '#4CAF50',
        warning: '#FFC107',
        danger: '#F44336',
        'sidebar-bg': '#0F1D40',
        'task-blue': '#ABD1FF',
        'task-coral': '#FFAAA5',
        'task-purple': '#D8BBFF',
        'task-green': '#B8E0D2',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
