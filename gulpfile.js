"use strict";

//
// PACKAGES
//
const gulp = require("gulp");
const autoprefixer = require("autoprefixer");
const babel = require("gulp-babel");
const del = require("del");
const fs = require("fs");
const cleanCSS = require("gulp-clean-css");
const concat = require("gulp-concat");
const data = require("gulp-data");
const header = require("gulp-header");
const imagemin = require("gulp-imagemin");
const pkg = require("./package.json");
const plumber = require("gulp-plumber");
const postcss = require("gulp-postcss");
const rename = require("gulp-rename");
const sass = require("gulp-sass");
sass.compiler = require("node-sass");
const sourcemaps = require("gulp-sourcemaps");
const terser = require("gulp-terser");
const twig = require("gulp-twig");
const zip = require("gulp-zip");

//
// PATHS
//
const paths = {
  archive: {
    input: "dist/**",
    output: "build/",
  },
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
  images: {
    input: "src/images/*.{gif,ico,jpg,png,svg}",
    output: "dist/images",
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

//
// OPTIONS
//

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

//
// HELPER FUNCTIONS
//

// Get Timestamp
function getTimestamp() {
  var date = new Date();
  var year = date.getFullYear().toString();
  var month = ("0" + (date.getMonth() + 1)).slice(-2);
  var day = ("0" + date.getDate()).slice(-2);
  var hour = ("0" + date.getHours().toString()).slice(-2);
  var minute = ("0" + date.getMinutes().toString()).slice(-2);
  var second = ("0" + date.getSeconds().toString()).slice(-2);
  return year + month + day + hour + minute + second;
}

//
// TASKS
//

/**
 * Task: 'archive'
 *
 * Archive pre-existing content from output folders
 */
gulp.task(
  "archive",
  gulp.series(function (cb) {
    gulp
      .src(paths.archive.input)
      .pipe(
        zip(pkg.name + "_v" + pkg.version + "-build_" + getTimestamp() + ".zip")
      )
      .pipe(gulp.dest(paths.archive.output));

    // Signal completion
    cb();
  })
);

/**
 * Task: 'clean'
 *
 * Remove pre-existing content from output folders
 */
gulp.task(
  "clean",
  gulp.series(function (cb) {
    // Clean the dist folder
    del.sync(["dist/"]);

    // Callback
    cb();
  })
);

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
 * Task: 'images'
 *
 * Optimise GIF, JPEG, PNG and SVG images
 */
gulp.task(
  "images",
  gulp.series(function (cb) {
    gulp
      .src(paths.images.input)
      .pipe(
        imagemin({
          interlaced: true,
          progressive: true,
          optimizationLevel: 5,
          svgoPlugins: [
            {
              removeViewBox: true,
            },
          ],
        })
      )
      .pipe(gulp.dest(paths.images.output));

    // Callback
    cb();
  })
);

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

// Build Task
gulp.task(
  "build",
  gulp.parallel(["copy", "images", "scripts", "styles", "templates"])
);

// Default Task
gulp.task("default", gulp.parallel(["clean", "build"]));
