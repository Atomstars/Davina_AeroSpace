/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        'neptune-deep': '#020617', // Deep Navy
        'neptune-glow': '#06b6d4', // Neon Cyan
        'neptune-silver': '#94a3b8', // Metallic Silver
      }
    },
  },
  plugins: [],
}