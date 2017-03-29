'use strict';

/**
 * Import node modules
 */
var gulp         = require('gulp');
var sass         = require('gulp-sass');
var sassGlob     = require('gulp-sass-glob');
var rename       = require('gulp-rename');
var postcss      = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var cssnano      = require('cssnano');
var browser_sync = require('browser-sync');
var ejs          = require('gulp-ejs');
var uglify       = require('gulp-uglify');
var rollup       = require('gulp-rollup');
var nodeResolve  = require('rollup-plugin-node-resolve');
var commonjs     = require('rollup-plugin-commonjs');
var babel        = require('rollup-plugin-babel');
var imagemin     = require('gulp-imagemin');

var dir = {
  src: {
    css    : 'src/css',
    js     : 'src/js',
    images : 'src/images',
    html   : 'src/html'
  },
  dist: {
    css    : 'public/assets/css',
    js     : 'public/assets/js',
    images : 'public/assets/images',
    html   : 'public'
  }
};

/**
 * ES6 to ES5
 */

gulp.task('js', function() {
  gulp.src(dir.src.js + '/**/*.js')
    .pipe(rollup({
      allowRealFiles: true,
      entry: dir.src.js + '/app.js',
      format: 'iife',
      plugins: [
        nodeResolve({ jsnext: true }),
        commonjs(),
        babel({
          presets: ['es2015-rollup'],
          babelrc: false
        })
      ]
    }))
    .pipe(gulp.dest(dir.dist.js))
    .on('end', function() {
      gulp.src([dir.dist.js + '/app.js'])
        .pipe(uglify())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest(dir.dist.js));
    });
});

/**
 * Sass to CSS
 */
gulp.task('css', function() {
  return gulp.src(dir.src.css + '/*.scss')
    .pipe(sassGlob())
    .pipe(sass({
      includePaths: require('node-normalize-scss').includePaths
    }))
    .pipe(gulp.dest(dir.dist.css))
    .pipe(postcss([autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    })]))
    .pipe(gulp.dest(dir.dist.css))
    .pipe(postcss([cssnano()]))
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest(dir.dist.css));
});

/**
 * EJS to HTML
 */
gulp.task('html', function() {
  gulp.src(dir.src.html + '/*.ejs')
    .pipe(ejs(
      {
        root: '/'
      },
      {},
      {ext: '.html'})
    )
    .pipe(gulp.dest(dir.dist.html));
});

/**
 * Minify images
 */
gulp.task('imagemin', function() {
  return gulp.src(dir.src.images + '/**')
    .pipe(imagemin())
    .pipe(gulp.dest(dir.dist.images))
});

/**
 * Copy Basis font
 */
gulp.task('font', function() {
  return gulp.src('./node_modules/sass-basis/src/font/**')
    .pipe(gulp.dest('./public/assets/font/basis'));
});

/**
 * Auto Compile.
 */
gulp.task('watch', function() {
  gulp.watch([dir.src.css + '/**/*.scss'], ['css']);
  gulp.watch([dir.src.js + '/**/*.js'], ['js']);
  gulp.watch([dir.src.images + '/**'], ['imagemin']);
  gulp.watch([dir.src.html + '/**/*.ejs'], ['html']);
});

/**
 * Browsersync
 */
gulp.task('browsersync', function() {
  browser_sync.init( {
    server: {
      baseDir: "public/"
    },
    files: [
      'public/**'
    ]
  });
});

gulp.task('build', ['css', 'js', 'imagemin', 'html', 'font']);

gulp.task('default', ['build', 'browsersync', 'watch']);
