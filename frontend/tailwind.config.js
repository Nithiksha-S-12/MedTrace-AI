/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#e8edf5',
          100: '#c5d1e8',
          200: '#9fb2d9',
          300: '#7893ca',
          400: '#5e7bbf',
          500: '#4563b4',
          600: '#3a55a5',
          700: '#2c4491',
          800: '#1A3C6E',
          900: '#0D2137',
        },
        forest: {
          50: '#e8f5e9',
          100: '#c8e6c9',
          200: '#a5d6a7',
          300: '#81c784',
          400: '#66bb6a',
          500: '#4caf50',
          600: '#43a047',
          700: '#388e3c',
          800: '#2E7D32',
          900: '#1b5e20',
        },
        gold: {
          50: '#fdf8ec',
          100: '#f9edcd',
          200: '#f4e0a8',
          300: '#edd382',
          400: '#e6c862',
          500: '#C9A84C',
          600: '#b8943a',
          700: '#9e7d2a',
          800: '#84681d',
          900: '#6b5213',
        },
        govbg: '#F5F7FA',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 8px rgba(26, 60, 110, 0.08)',
        'card-hover': '0 4px 20px rgba(26, 60, 110, 0.15)',
      },
      borderRadius: {
        card: '8px',
      }
    },
  },
  plugins: [],
}
