'use strict';

var gulp = require('gulp');

var browserSync = require('browser-sync');
var reload = browserSync.reload;

var path = {
  js: 'src/**/*.js',
  css: 'src/**/*.css',
  html: 'src/**/*.html',
  image: 'src/**/*.png',
  music: ['src/**/*.mp3', 'src/**/*.ogg']
}

var dest = 'dist/'

gulp.task('js:copy', function () {
  return gulp.src(path.js)
    .pipe(gulp.dest(dest));
});

gulp.task('css:copy', function () {
  return gulp.src(path.css)
    .pipe(gulp.dest(dest));
});

gulp.task('html:copy', function () {
  return gulp.src(path.html)
    .pipe(gulp.dest(dest));
});

gulp.task('image:copy', function () {
  return gulp.src(path.image)
    .pipe(gulp.dest(dest));
});

gulp.task('music:copy', function () {
  return gulp.src(path.music)
    .pipe(gulp.dest(dest));
});


gulp.task('connect', ['compile'], function () {
  browserSync({
    notify: false,
    port: 9000,
    server: {
      baseDir: [dest]
    }
  });

  // watch for changes
  gulp.watch(path.js, function () {
    gulp.start('js:copy');
    reload();
  });
  gulp.watch(path.css, function () {
    gulp.start('css:copy');
    reload();
  });
  gulp.watch(path.html, function () {
    gulp.start('html:copy');
    reload();
  });
  gulp.watch(path.image, function () {
    gulp.start('image:copy');
    reload();
  });
  gulp.watch(path.music, function () {
    gulp.start('music:copy');
    reload();
  });
});


//clean dest dir
gulp.task('clean', require('del').bind(null, [dest]));

gulp.task('default', ['clean'], function () {
  gulp.start('compile');
});

gulp.task('compile', ['js:copy', 'css:copy', 'html:copy', 'music:copy', 'image:copy']);

gulp.task('serve', ['clean'], function () {
  gulp.start('connect');
});
