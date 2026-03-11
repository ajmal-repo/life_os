/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Figtree', 'sans-serif'],
      },
      colors: {
        primary: {
          50:  '#f0f7f0',
          100: '#dceddc',
          200: '#bbdcbb',
          300: '#8fc48f',
          400: '#5fa65f',
          500: '#336633',
          600: '#2a5c2a',
          700: '#224d22',
          800: '#1c3e1c',
          900: '#163316',
          950: '#0b1f0b',
        },
        surface: {
          DEFAULT: '#ffffff',
          dark: '#0f172a',
        }
      },
      screens: {
        xs: '375px',
      },
      animation: {
        'slide-up': 'slideUp 0.2s ease-out',
        'fade-in': 'fadeIn 0.15s ease-out',
        'swipe-right': 'swipeRight 0.3s ease-out',
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        swipeRight: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
    },
  },
  plugins: [],
}
