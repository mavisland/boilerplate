module.exports = {
  archive: {
    input: "dist/**",
    output: "build/",
  },
  clean: ["dist/"],
  images: {
    input: "src/images/*",
    output: "dist/images",
    watch: "src/images/*",
  },
  scripts: {
    input: "src/scripts/app.js",
    output: "dist/js",
    watch: "src/scripts/**/*.js",
  },
  server: {
    root: "dist/",
  },
  styles: {
    input: "src/styles/*.css",
    output: "dist/css",
    watch: "src/styles/**/*.css",
  },
  templates: {
    input: "src/templates/*.twig",
    output: "dist/",
    watch: ["src/templates/**/*.twig", "website.json"],
  },
};
