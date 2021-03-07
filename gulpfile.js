"use strict";

// Packages
const gulp = require("gulp");
const plumber = require("gulp-plumber");
const fs = require("fs");
const data = require("gulp-data");
const twig = require("gulp-twig");

// Paths
const paths = {
  html: {
    input: "src/html/*.twig",
    output: "dist/",
  },
};

gulp.task(
  "templates",
  gulp.series(function (cb) {
    gulp
      .src(paths.html.input)
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
      .pipe(gulp.dest(paths.html.output));

    // Callback
    cb();
  })
);

gulp.task("default", gulp.parallel(["templates"]));
