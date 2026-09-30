/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0a0e1a',
          50: '#e8eaf0',
          100: '#c4c9d8',
          200: '#9aa3bd',
          300: '#6b789a',
          400: '#475569',
          500: '#2d3654',
          600: '#1e2640',
          700: '#141b30',
          800: '#0f1726',
          900: '#0a0e1a',
          950: '#060912',
        },
        blue: {
          DEFAULT: '#0066ff',
          50: '#eef5ff',
          100: '#d9ebff',
          200: '#bcdcff',
          300: '#8ec5ff',
          400: '#59a6ff',
          500: '#3288ff',
          600: '#0066ff',
          700: '#0052cc',
          800: '#003d99',
          900: '#002966',
        },
        gold: {
          DEFAULT: '#c5a572',
          light: '#d4af37',
          dark: '#a68a4f',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'fade-up': 'fadeUp 0.6s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
