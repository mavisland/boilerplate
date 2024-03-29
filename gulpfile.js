//
// Gulp.js Configurations
//

// Packages
const { src, dest, series, parallel, watch } = require("gulp");

// Configuration
const config = require("./boilerplate.config");
const twconfig = require("./tailwind.config");

// Style related packages
const postcss = require("gulp-postcss");
const tailwindcss = require("tailwindcss");
const autoprefixer = require("autoprefixer");
const cssnano = require("cssnano");
const sourcemaps = require("gulp-sourcemaps");

// JavaScript related packages
const terser = require("gulp-terser");
const babel = require("gulp-babel");

// Template related packages
const twig = require("gulp-twig");
const data = require("gulp-data");

// Server related packages
const browserSync = require("browser-sync").create();

// Utility packages
const concat = require("gulp-concat");
const fs = require("fs");
const del = require("del");
const gulpif = require("gulp-if");
const header = require("gulp-header");
const pkg = require("./package.json");
const plumber = require("gulp-plumber");
const rename = require("gulp-rename");
const zip = require("gulp-zip");

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

// Get Timestamp
const getTimestamp = () => {
  let date = new Date();
  let year = date.getFullYear().toString();
  let month = ("0" + (date.getMonth() + 1)).slice(-2);
  let day = ("0" + date.getDate()).slice(-2);
  let hour = ("0" + date.getHours().toString()).slice(-2);
  let minute = ("0" + date.getMinutes().toString()).slice(-2);
  let second = ("0" + date.getSeconds().toString()).slice(-2);
  return year + month + day + hour + minute + second;
};

// Archive pre-existing content from output folders
const archiveDist = (cb) => {
  src(config.archive.input)
    .pipe(zip(pkg.name + "_v" + pkg.version + "-build_" + getTimestamp() + ".zip"))
    .pipe(dest(config.archive.output));
  return cb();
};

// Remove pre-existing content from output folders
const cleanDist = (cb) => {
  del.sync(config.clean);
  return cb();
};

// Optimise GIF, JPEG, PNG and SVG images
const buildImages = () => {
  return src(config.images.input).pipe(dest(config.images.output));
};

// Concanate & minify JavaScript files
const buildScripts = () => {
  return src(config.scripts.input)
    .pipe(plumber())
    .pipe(gulpif(process.env.NODE_ENV === "development", sourcemaps.init()))
    .pipe(
      babel({
        presets: ["@babel/env"],
      })
    )
    .pipe(concat("app.js"))
    .pipe(header(banner, { pkg: pkg }))
    .pipe(dest(config.scripts.output))
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
    .pipe(gulpif(process.env.NODE_ENV === "development", sourcemaps.write(".")))
    .pipe(dest(config.scripts.output));
};

// Compile, autoprefix & minify SASS files
const buildStyles = () => {
  return src(config.styles.input)
    .pipe(plumber())
    .pipe(gulpif(process.env.NODE_ENV === "development", sourcemaps.init()))
    .pipe(
      postcss([
        tailwindcss(twconfig),
        autoprefixer({
          cascade: true,
          remove: true,
        }),
      ])
    )
    .pipe(header(banner, { pkg: pkg }))
    .pipe(dest(config.styles.output))
    .pipe(
      postcss([
        cssnano({
          discardComments: {
            removeAll: true,
          },
        }),
      ])
    )
    .pipe(header(banner, { pkg: pkg }))
    .pipe(
      rename({
        suffix: ".min",
      })
    )
    .pipe(gulpif(process.env.NODE_ENV === "development", sourcemaps.write(".")))
    .pipe(dest(config.styles.output));
};

// Compile Twig files to HTML
const buildTemplates = () => {
  return src(config.templates.input)
    .pipe(plumber())
    .pipe(
      data((file) => {
        return JSON.parse(fs.readFileSync(config.templates.content));
      })
    )
    .pipe(twig())
    .pipe(dest(config.templates.output));
};

// Watch for changes to the source directory
const serveDist = (cb) => {
  browserSync.init({
    server: {
      baseDir: config.server.root,
    },
  });
  cb();
};

// Reload the browser when files change
const reloadBrowser = (cb) => {
  browserSync.reload();
  cb();
};

// Watch all file changes
const watchSource = () => {
  watch(config.images.watch, series(buildImages, reloadBrowser));
  watch(config.scripts.watch, series(buildScripts, reloadBrowser));
  watch(config.styles.watch, series(buildStyles, reloadBrowser));
  watch([config.templates.content, config.templates.watch], series(buildTemplates, reloadBrowser));
};

// Archive task
exports.archive = archiveDist;

// Clean task
exports.clean = cleanDist;

// Build task
exports.build = series(parallel(buildScripts, buildStyles, buildTemplates), buildImages);

// Watch Task
exports.watch = watchSource;

// Default task
exports.default = series(exports.build, serveDist, watchSource);
