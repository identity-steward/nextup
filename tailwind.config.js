/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#0a1a33',
        gold: '#f2c14e',
        'navy-light': '#1a2f4d',
        'gold-light': '#f5d06f',
        'gold-dark': '#d4a03a',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
