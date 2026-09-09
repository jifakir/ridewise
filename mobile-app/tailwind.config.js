/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#F05A28',
        ink: '#151515',
        foreground: '#171717',
        muted: '#707070',
        canvas: '#F6F6F4',
        card: '#FFFFFF',
        success: '#22A06B',
        warning: '#F4B740',
        danger: '#D64545',
      },
    },
  },
  plugins: [],
};
