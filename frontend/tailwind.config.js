/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        light: {
          bg: "#FAF8F5",       // Warm off-white
          card: "#FFFFFF",     // Pure white for panels
          border: "#EAE5DE",   // Soft grey-beige border
          textMain: "#332A24", // Espresso dark brown
          textMuted: "#786C64" // Warm taupe grey
        },
        brand: {
          brown: "#7A6652",    // Rich cocoa brown (Primary)
          tan: "#9C846C",      // Light leather tan (Secondary)
          green: "#6E7A68",    // Sage green (Success)
          red: "#B86866",      // Muted terracotta (Danger)
          wheat: "#C4A076"     // Soft gold wheat (Warning)
        }
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(122, 102, 82, 0.08)',
        'card-glow': '0 8px 30px rgba(122, 102, 82, 0.06)'
      }
    },
  },
  plugins: [],
}
