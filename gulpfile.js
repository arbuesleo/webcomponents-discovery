"use strict";

// Load plugins
const autoprefixer = require("autoprefixer");
const browsersync = require("browser-sync").create();
const cssnano = require("cssnano");
const del = require("del");
const gulp = require("gulp");
const imagemin = require("gulp-imagemin");
const newer = require("gulp-newer");
const plumber = require("gulp-plumber");
const postcss = require("gulp-postcss");
const rename = require("gulp-rename");
const sass = require("gulp-sass");
var inject = require('gulp-inject');
const webpack = require("webpack");
const webpackconfig = require("./webpack.config.js");
const webpackstream = require("webpack-stream");

// BrowserSync
function browserSync(done) {
    browsersync.init({
      server: {
        baseDir: "./dist/"
      },
      port: 3000
    });
    done();
  }


// BrowserSync Reload
function browserSyncReload(done) {
    browsersync.reload();
    done();
}

// Clean assets
function clean() {
    return del(["./dist/assets/"]);
  }


// CSS task
function css() {
    return gulp
      .src("./src/components/**/*.scss")
      .pipe(plumber())
      .pipe(sass({ outputStyle: "expanded" }))
      .pipe(gulp.dest("./dist/css/"))
      .pipe(rename({ suffix: ".min" }))
      .pipe(postcss([autoprefixer(), cssnano()]))
      .pipe(gulp.dest("./dist/css/"))
      .pipe(browsersync.stream());
  }

  // Optimize Images
function images() {
    return gulp
      .src("./assets/img/**/*")
      .pipe(newer("./dist/assets/img"))
      .pipe(
        imagemin([
          imagemin.gifsicle({ interlaced: true }),
          imagemin.jpegtran({ progressive: true }),
          imagemin.optipng({ optimizationLevel: 5 }),
          imagemin.svgo({
            plugins: [
              {
                removeViewBox: false,
                collapseGroups: true
              }
            ]
          })
        ])
      )
      .pipe(gulp.dest("./dist/assets/img"));
  }


  // Transpile, concatenate and minify scripts
function scripts() {
    return (
      gulp
        .src(["./src/components/**/*"])
        .pipe(plumber())
        .pipe(webpackstream(webpackconfig, webpack))
        // folder only, filename is specified in webpack config
        .pipe(gulp.dest("./dist/bundles/"))
        .pipe(browsersync.stream())
    );
  }


  // Watch files
function watchFiles() {
    gulp.watch("./src/components/**/*", css, index);
    gulp.watch("./src/components/**/*", scripts, index);
    gulp.watch(
      [
        "./_includes/**/*",
        "./_layouts/**/*",
        "./_pages/**/*",
        "./_posts/**/*",
        "./_projects/**/*"
      ],
      browserSyncReload
    );
    gulp.watch("./src/assets/img/**/*", images);
  }

  function transformFn(filepath, file, i, length){

    var path = filepath.indexOf('/dist/') > -1 ? filepath.replace('/dist/', './') : filepath;

    return inject.transform.apply(inject.transform, [path, file, i, length]);

  }

  function index () {
      gulp.src('./src/index.html')  
        .pipe(inject(gulp.src(['./dist/bundles/*.bundle.js', './dist/css/*.css'], {read: false}), {transform: transformFn}))
        .pipe(gulp.dest('./dist'));
  };
  

  // define complex tasks
const js = scripts;
const build = gulp.series(clean, gulp.parallel(css, images, js), index);
const watch = gulp.parallel(build, watchFiles, browserSync);

// export tasks
exports.images = images;
exports.css = css;
exports.js = js;
exports.clean = clean;
exports.build = build;
exports.watch = watch;
exports.default = build;
exports.index = index;