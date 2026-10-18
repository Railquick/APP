/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        railGreen: {
          DEFAULT: '#008b3e',
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#10b981',
          600: '#008b3e',
          700: '#047857',
          800: '#065f46',
        },
        railRed: {
          DEFAULT: '#e23744',
          50: '#fff1f2',
          100: '#ffe4e6',
          500: '#f43f5e',
          600: '#e23744',
          700: '#be123c',
        },
        railOrange: '#ff6b00',
        railDark: '#121619',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
