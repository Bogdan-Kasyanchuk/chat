/** @type {import('tailwindcss').Config} */

module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    screens: {
      xs: '360px',
      sm: '576px',
      md: '768px',
      lg: '1024px',
      xl: '1440px',
    },
    extend: {},
  },
  plugins: [],
};
