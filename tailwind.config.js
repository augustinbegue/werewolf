/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    fontFamily: {
      display: ["Playfair Display", "serif"],
      body: ["Roboto", "sans-serif"],
    }
  },
  plugins: [
    require('daisyui'),
  ],
  daisyui: {
    themes: ["halloween"]
  }
};
