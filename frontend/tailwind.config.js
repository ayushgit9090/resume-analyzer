/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
      },
      colors: {
        sky: { 400: '#38bdf8', 500: '#0ea5e9' },
        emerald: { 400: '#4ade80', 500: '#22c55e' },
        amber: { 400: '#fbbf24' },
        rose: { 400: '#fb7185' },
      }
    }
  },
  plugins: []
}
