/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#8b5cf6',
          500: '#8b5cf6',
          600: '#7c3aed',
        },
        secondary: {
          DEFAULT: '#06b6d4',
          500: '#06b6d4',
          600: '#0891b2',
        }
      },
    },
  },
  plugins: [],
}

