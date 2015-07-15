// Dependencies
var gulp = require('gulp')
  , plugins = require('gulp-load-plugins')()
  , sourcemaps = require('gulp-sourcemaps')

// Paths
var dirs = {
  dev: {
    img:     ['dev/img/**/*.jpg',
              'dev/img/**/*.jpeg',
              'dev/img/**/*.gif',
              'dev/img/**/*.png'],
    js:      ['dev/js/*.js'],
    lib:     ['dev/lib/*.js'],
    html:    ['dev/html/*'],
    css:     ['dev/css/*.css']
  },
  prod: {
    images:   'release/build/img',
    scripts:  'release/build/js',
    styles:   'release/build/css',
    html:     'release/build/html'
  }
}

// ----------------------------------------------------------------
// Styles

  gulp.task('css', function () {
    gulp.src(dirs.dev.css)
    .pipe(plugins.concat('app.css'))
    .pipe(plugins.autoprefixer({browsers: ['> 0.1%']}))
    .pipe(plugins.size({showFiles: true}))
    .pipe(plugins.minifyCss())
    .pipe(plugins.rename({suffix: '.min'}))
    .pipe(plugins.size({showFiles: true}))
    .pipe(gulp.dest(dirs.prod.styles))
  });

// ----------------------------------------------------------------
// Javascript

  // Vendor JS
  gulp.task('libs', function() {
    gulp.src(dirs.dev.lib)
    .pipe(plugins.concat('lib.js'))
    .pipe(plugins.size({showFiles: true}))
    .pipe(plugins.uglify({mangle: false}))
    .pipe(plugins.rename({suffix: '.min'}))
    .pipe(plugins.size({showFiles: true}))
    .pipe(plugins.chmod(777))
    .pipe(gulp.dest(dirs.prod.scripts));
  });

  // Project JS
  gulp.task('js', function() {
    gulp.src(dirs.dev.js)
    .pipe(plugins.size({title: "JS files"}))
    .pipe(sourcemaps.init())
        .pipe(plugins.concat('app.js'))
        .pipe(plugins.uglify({mangle: false}))
        .pipe(plugins.rename({suffix: '.min'}))
    .pipe(sourcemaps.write('../maps'))
    .pipe(plugins.chmod(777))
    .pipe(plugins.size({showFiles: true}))
    .pipe(gulp.dest(dirs.prod.scripts));
  });

// ----------------------------------------------------------------
// html

  gulp.task('html', function() {
    gulp.src(dirs.dev.html)
    .pipe(gulp.dest(dirs.prod.html));
  });

// ----------------------------------------------------------------
// Images

  gulp.task('rasters', function() {
    gulp.src(dirs.dev.img)
    .pipe(plugins.imagemin({ optimizationLevel: 5, progressive: true, interlaced: true }))
    .pipe(gulp.dest(dirs.prod.images));
  });

  gulp.task('rasters-retina', function() {
    gulp.src(dirs.dev.img)
    .pipe(plugins.gm(function (gmfile) {
      return gmfile.resize("50%","50%");
    }))
    .pipe(plugins.imagemin({ optimizationLevel: 5, progressive: true, interlaced: true }))
    .pipe(plugins.rename(function (path) {
      path.basename = path.basename.slice(0,-3) // remove '@2x'
    }))
    .pipe(gulp.dest(dirs.prod.images));
  });

// ----------------------------------------------------------------
// Tasks

gulp.task('watch', function() {
  gulp.watch(dirs.dev.js,     ['js']);
  gulp.watch(dirs.dev.libs,   ['libs']);
  //
  gulp.watch(dirs.dev.css,   ['css']);
  //
  gulp.watch(dirs.dev.img,    ['rasters']);
  gulp.watch(dirs.dev.img,    ['rasters-retina']);
  //
  gulp.watch(dirs.dev.html,   ['html']);
});

gulp.task('build', ['rasters', 'rasters-retina', 'css', 'js', 'libs', 'html']);
gulp.task('init', ['install', 'build']);
gulp.task('default', ['build', 'watch']);
