module.exports = {
  archive: {
    input: "dist/**",
    output: "build/"
  },
  clean: ["dist/"],
  images: {
    input: "src/images/*",
    output: "dist/images",
    watch: "src/images/*"
  },
  scripts: {
    input: "src/scripts/app.js",
    output: "dist/js",
    watch: "src/scripts/**/*.js"
  },
  server: {
    root: "dist/"
  },
  sprites: {
    input: "src/sprites/images/*.png",
    output: "src/images/"
  },
  styles: {
    input: "src/styles/*.scss",
    output: "dist/css",
    watch: "src/styles/**/*.scss"
  },
  templates: {
    input: "src/templates/*.twig",
    output: "dist/",
    watch: ["src/templates/**/*.twig", "website.json"]
  }
};
