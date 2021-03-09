# boilerplate

A boilerplate for building web projects with [Gulp.js](https://gulpjs.com/).

## Getting Started

### Features

- Compile, minify, autoprefix SASS files.
- Compile, concatenate and minify JavaScript.
- Render Twig templates.
- Optimise GIF, JPEG, PNG and SVG images.
- Archive `dist` content.
- Watch for file changes, and automatically recompile build.
- Hot reloading with `browser-sync`.

### Quick Start

```
# 1 Clone this repo
git clone https://github.com/mavisland/boilerplate.git

# 2 Navigate into the repo directory
cd boilerplate

# 3 Install all node packages
npm install

# 4 Get started
npm run start
```

### Requirements

This project requires you have [Node.js](https://nodejs.org/) with [npm](https://www.npmjs.com/get-npm) installed.
This project requires you have a global installation of [gulp-cli](https://www.npmjs.com/package/gulp-cli).

```
# Install gulp-cli globally
npm install -g gulp-cli
```

## Documentation

Add your source files to the appropriate `src` subdirectories. Gulp.js will process and and compile them into `dist`.

### Styles

Files in the `src/scss` directory will be compiled to `dist/css`.

### Scripts

Put your JavaScript files in the `src/js` directory. Files placed directly in the `src/js` folder will compile directly to `dist/js` as both minified and unminified files.

### Templates

Put your `Twig` templates in the `src/html` directory. Files placed directly in the `src/html` folder will compile directly to `dist`.

### Images

Place GIF, JPEG, PNG and SVG images in the `src/images` directory. Images will be optimized with `imagemin` plugins and compiled into `dist/images`.

### Sprites

Converts a series of images in the `src/sprites/image` folder to a sprite sheet and CSS styles.

## Options

### Tasks

| Task Name | Task Decription                                 |
| --------- | ----------------------------------------------- |
| archive   | Archive `dist` content                          |
| build     | Run all tasks                                   |
| images    | Optimise GIF, JPEG, PNG and SVG images          |
| serve     | Watch for changes to the `src` directory        |
| scripts   | Concanate & minify JavaScript files             |
| sprites   | Your images, icons, et al convert a spritesheet |
| styles    | Compile, autoprefix & minify SASS files         |
| templates | Render Twig templates                           |
| watch     | Watch all file changes                          |

### Paths

Adjust the `input`, `output`, `watch` paths for all of the Gulp.js tasks under the `paths` variable. Paths are relative to the root project folder.

```js
// Paths
const paths = {
  archive: {
    input: "dist/**",
    output: "build/",
  },
  images: {
    input: ["src/images/*.{gif,ico,jpg,png,svg}", "src/sprites/s.png"],
    output: "dist/images",
    watch: ["src/images/*.{gif,ico,jpg,png,svg}", "src/sprites/s.png"],
  },
  scripts: {
    input: ["src/js/plugins.js", "src/js/main.js"],
    output: "dist/js",
    watch: "src/js/**/*.js",
  },
  server: {
    root: "dist/",
  },
  sprites: {
    input: "src/sprites/**/*.svg",
    output: "dist/images",
  },
  styles: {
    input: "src/scss/*.scss",
    output: "dist/css",
    watch: "src/scss/**/*.scss",
  },
  templates: {
    input: "src/html/*.twig",
    output: "dist/",
    watch: "src/html/**/*.twig",
  },
};
```

## License

The code is available under the [MIT License](LICENSE.md).
