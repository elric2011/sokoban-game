/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        game: {
          bg: '#1a1a2e',
          wall: '#4a4a6a',
          floor: '#2a2a4a',
          player: '#4fc3f7',
          box: '#ff8a65',
          target: '#81c784',
          boxOnTarget: '#66bb6a',
        }
      }
    },
  },
  plugins: [],
}
