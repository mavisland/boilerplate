/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/styles/*.css", "./src/templates/**/*.{html,twig}", "./src/scripts/**/*.js"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
    },
    extend: {},
  },
  plugins: [],
};
