// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}', // Ini harus mencakup semua file Anda
    './public/**/*.html', // Jika Anda memiliki file HTML di public
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};