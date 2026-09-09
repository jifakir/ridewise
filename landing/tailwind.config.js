/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#F05A28',
        ink: '#151515',
        foreground: '#171717',
        muted: '#707070',
        canvas: '#F6F6F4',
      },
    },
  },
  plugins: [],
};
