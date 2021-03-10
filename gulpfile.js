// Packages
const { src, dest, series, parallel, watch } = require("gulp");
const autoprefixer = require("autoprefixer");
const browserSync = require("browser-sync").create();
const babel = require("gulp-babel");
const del = require("del");
const fs = require("fs");
const cleanCSS = require("gulp-clean-css");
const concat = require("gulp-concat");
const data = require("gulp-data");
const gulpif = require("gulp-if");
const header = require("gulp-header");
const imagemin = require("gulp-imagemin");
const pkg = require("./package.json");
const plumber = require("gulp-plumber");
const postcss = require("gulp-postcss");
const rename = require("gulp-rename");
const sass = require("gulp-sass");
sass.compiler = require("node-sass");
const sourcemaps = require("gulp-sourcemaps");
const spritesmith = require("gulp.spritesmith");
const terser = require("gulp-terser");
const twig = require("gulp-twig");
const zip = require("gulp-zip");

// Paths
const paths = {
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
  sprites: {
    input: "src/sprites/images/*.png",
    output: "src/images/",
  },
  styles: {
    input: "src/styles/*.scss",
    output: "dist/css",
    watch: "src/styles/**/*.scss",
  },
  templates: {
    input: "src/templates/*.twig",
    output: "dist/",
    watch: ["src/templates/**/*.twig", "website.json"],
  },
};

// Options
const options = {
  images: {
    minify: {
      interlaced: true,
      progressive: true,
      optimizationLevel: 5,
      svgoPlugins: [
        {
          removeViewBox: true,
        },
      ],
    },
  },
  scripts: {
    babel: {
      presets: ["@babel/env"],
    },
    filename: "app.js",
    minify: {
      keep_fnames: true,
      mangle: false,
    },
    rename: {
      suffix: ".min",
    },
  },
  sprites: {
    imgName: "s.png",
    cssName: "_sprites.scss",
    cssFormat: "scss",
    cssTemplate: "src/sprites/scss.template.handlebars",
    imgPath: "../images/s.png",
    padding: 3,
    imgOpts: {
      quality: 100,
    },
  },
  styles: {
    scss: {
      outputStyle: "expanded",
    },
    autoprefixer: {
      browsers: pkg.browserlist,
      cascade: false,
    },
    minify: {
      level: {
        1: {
          specialComments: 0,
        },
      },
    },
    rename: {
      suffix: ".min",
    },
  },
  templates: {
    data: "website.json",
  },
};

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
  src(paths.archive.input)
    .pipe(
      zip(pkg.name + "_v" + pkg.version + "-build_" + getTimestamp() + ".zip")
    )
    .pipe(dest(paths.archive.output));
  return cb();
};

// Remove pre-existing content from output folders
const cleanDist = (cb) => {
  del.sync(paths.clean);
  return cb();
};

// Optimise GIF, JPEG, PNG and SVG images
const buildImages = () => {
  return src(paths.images.input)
    .pipe(plumber())
    .pipe(imagemin(options.images.minify))
    .pipe(dest(paths.images.output));
};

// Concanate & minify JavaScript files
const buildScripts = () => {
  return src(paths.scripts.input)
    .pipe(plumber())
    .pipe(gulpif(process.env.NODE_ENV === "development", sourcemaps.init()))
    .pipe(babel(options.scripts.babel))
    .pipe(concat(options.scripts.filename))
    .pipe(header(banner, { pkg: pkg }))
    .pipe(dest(paths.scripts.output))
    .pipe(terser(options.scripts.minify))
    .pipe(rename(options.scripts.rename))
    .pipe(gulpif(process.env.NODE_ENV === "development", sourcemaps.write(".")))
    .pipe(dest(paths.scripts.output));
};

// Convert a set of images into a spritesheet and CSS variables
const buildSprites = (cb) => {
  const spriteData = gulp
    .src(paths.sprites.input)
    .pipe(plumber())
    .pipe(spritesmith(options.sprites));

  spriteData.img.pipe(dest(paths.sprites.output));
  spriteData.css.pipe(dest(paths.sprites.output));

  return cb();
};

// Compile, autoprefix & minify SASS files
const buildStyles = () => {
  return src(paths.styles.input)
    .pipe(plumber())
    .pipe(gulpif(process.env.NODE_ENV === "development", sourcemaps.init()))
    .pipe(sass(options.styles.scss))
    .pipe(postcss([autoprefixer(options.styles.autoprefixer)]))
    .pipe(header(banner, { pkg: pkg }))
    .pipe(dest(paths.styles.output))
    .pipe(cleanCSS(options.styles.minify))
    .pipe(header(banner, { pkg: pkg }))
    .pipe(rename(options.styles.rename))
    .pipe(gulpif(process.env.NODE_ENV === "development", sourcemaps.write(".")))
    .pipe(dest(paths.styles.output));
};

// Compile Twig files to HTML
const buildTemplates = () => {
  return src(paths.templates.input)
    .pipe(plumber())
    .pipe(
      data((file) => {
        return JSON.parse(fs.readFileSync(options.templates.data));
      })
    )
    .pipe(twig())
    .pipe(dest(paths.templates.output));
};

// Watch for changes to the source directory
const serveDist = (cb) => {
  browserSync.init({
    server: {
      baseDir: paths.server.root,
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
  watch(paths.images.watch, series(buildImages, reloadBrowser));
  watch(paths.scripts.watch, series(buildScripts, reloadBrowser));
  watch(paths.styles.watch, series(buildStyles, reloadBrowser));
  watch(paths.templates.watch, series(buildTemplates, reloadBrowser));
};

// Archive task
exports.archive = archiveDist;

// Clean task
exports.clean = cleanDist;

// Sprites task
exports.sprites = buildSprites;

// Build task
exports.build = series(
  parallel(buildScripts, buildStyles, buildTemplates),
  buildImages
);

// Watch Task
exports.watch = watchSource;

// Default task
exports.default = series(exports.build, serveDist, watchSource);
