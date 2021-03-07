"use strict";

// Packages
const gulp = require("gulp");
const autoprefixer = require("autoprefixer");
const babel = require("gulp-babel");
const fs = require("fs");
const cleanCSS = require("gulp-clean-css");
const concat = require("gulp-concat");
const data = require("gulp-data");
const header = require("gulp-header");
const pkg = require("./package.json");
const plumber = require("gulp-plumber");
const postcss = require("gulp-postcss");
const rename = require("gulp-rename");
const sass = require("gulp-sass");
sass.compiler = require("node-sass");
const sourcemaps = require("gulp-sourcemaps");
const terser = require("gulp-terser");
const twig = require("gulp-twig");

// File Banner
const banner = [
  "/*!",
  " * <%= pkg.name %> - <%= pkg.description %>",
  " * @version v<%= pkg.version %>",
  " * @link <%= pkg.homepage %>",
  " * @license <%= pkg.license %>",
  " */",
  "",
].join("\n");

// Paths
const paths = {
  copy: {
    scripts: {
      input: "src/vendor/modernizr-3.11.2.min.js",
      output: "dist/js/",
    },
    styles: {
      input: "node_modules/normalize.css/normalize.css",
      output: "dist/css/",
    },
  },
  scripts: {
    input: ["src/js/plugins.js", "src/js/main.js"],
    output: "dist/js",
  },
  styles: {
    input: "src/scss/*.scss",
    output: "dist/css",
  },
  templates: {
    input: "src/html/*.twig",
    output: "dist/",
  },
};

/**
 * Task: 'copy:scripts'
 */
gulp.task(
  "copy:scripts",
  gulp.series(function (cb) {
    gulp
      .src(paths.copy.scripts.input)
      .pipe(gulp.dest(paths.copy.scripts.output));

    // Callback
    cb();
  })
);

/**
 * Task: 'copy:styles'
 */
gulp.task(
  "copy:styles",
  gulp.series(function (cb) {
    gulp.src(paths.copy.styles.input).pipe(gulp.dest(paths.copy.styles.output));

    // Callback
    cb();
  })
);

/**
 * Task: 'copy'
 */
gulp.task("copy", gulp.parallel(["copy:scripts", "copy:styles"]));

/**
 * Task: 'styles'
 *
 * Compile, autoprefix & minify SASS files
 */
gulp.task(
  "styles",
  gulp.series(function (cb) {
    gulp
      .src(paths.styles.input)
      .pipe(plumber())
      .pipe(sourcemaps.init())
      .pipe(
        sass({
          outputStyle: "expanded",
        })
      )
      .pipe(
        postcss([
          autoprefixer({
            browsers: pkg.browserlist,
            cascade: false,
          }),
        ])
      )
      .pipe(header(banner, { pkg: pkg }))
      .pipe(gulp.dest(paths.styles.output))
      .pipe(
        cleanCSS({
          level: {
            1: {
              specialComments: 0,
            },
          },
        })
      )
      .pipe(header(banner, { pkg: pkg }))
      .pipe(
        rename({
          suffix: ".min",
        })
      )
      .pipe(sourcemaps.write("."))
      .pipe(gulp.dest(paths.styles.output));

    // Callback
    cb();
  })
);

gulp.task(
  "scripts",
  gulp.series(function (cb) {
    gulp
      .src(paths.scripts.input)
      .pipe(sourcemaps.init())
      .pipe(
        babel({
          presets: ["@babel/env"],
        })
      )
      .pipe(concat("app.js"))
      .pipe(header(banner, { pkg: pkg }))
      .pipe(gulp.dest(paths.scripts.output))
      .pipe(
        terser({
          keep_fnames: true,
          mangle: false,
        })
      )
      .pipe(
        rename({
          suffix: ".min",
        })
      )
      .pipe(sourcemaps.write("."))
      .pipe(gulp.dest(paths.scripts.output));

    cb();
  })
);

/**
 * Task: 'templates'
 *
 * Compile Twig files to HTML
 */
gulp.task(
  "templates",
  gulp.series(function (cb) {
    gulp
      .src(paths.templates.input)
      .pipe(
        plumber({
          handleError: function (err) {
            console.log(err);
            this.emit("end");
          },
        })
      )
      .pipe(
        data(function (file) {
          return JSON.parse(fs.readFileSync("boilerplate.json"));
        })
      )
      .pipe(twig())
      .pipe(gulp.dest(paths.templates.output));

    // Callback
    cb();
  })
);

gulp.task("default", gulp.parallel(["copy", "scripts", "styles", "templates"]));
