/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#312e81', // Dark blue sidebar
        primaryLight: '#4338ca', // Light blue hover
        surface: '#ffffff',
        textMain: '#1e293b',
        textMuted: '#64748b',
        success: '#22c55e',
        warning: '#f59e0b',
        danger: '#ef4444'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif']
      }
    },
  },
  plugins: [],
}
