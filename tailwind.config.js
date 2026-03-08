/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'village-primary': '#166534',
        'village-secondary': '#92400e',
        'village-accent': '#0ea5e9',
        'village-highlight': '#92400e',
        'village-bg': '#fefce8',
      },
    },
  },
  plugins: [],
}
