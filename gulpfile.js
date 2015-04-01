'use strict';

var gulp = require('gulp');
var concat = require('gulp-concat');

var browserSync = require('browser-sync');
var reload = browserSync.reload;

var moduleMap = require('./moduleConfig.json').module;

var path = {
  js: 'src/js/**/*.js',
  json: 'src/**/*.json',
  css: 'src/**/*.css',
  html: 'src/**/*.html',
  image: 'src/image/**/*',
  music: ['src/**/*.mp3', 'src/**/*.ogg']
}

var dest = 'dest/'

gulp.task('js:copy', function () {
  return gulp.src(path.js)
    .pipe(concat('main.js'))
    .pipe(gulp.dest(dest + '/js'));
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
    .pipe(gulp.dest(dest + '/image'));
});

gulp.task('music:copy', function () {
  return gulp.src(path.music)
    .pipe(gulp.dest(dest));
});

gulp.task('json:copy', function () {
  return gulp.src(path.json)
    .pipe(gulp.dest(dest));
});

var jsAddedCache;
gulp.task('cocos2d:compile', function () {
  jsAddedCache = {};
  var jsList = ['src/cocos2d/CCBoot.js'];
  jsList = jsList.concat(getJsListOfModule(moduleMap, 'cocos2d', 'src'));
  //console.log(jsList);
  return gulp.src(jsList)
    .pipe(concat('cocos2d.js'))
    .pipe(gulp.dest(dest + '/cocos2d'));
});


function getJsListOfModule(moduleMap, moduleName, dir) {
  if (jsAddedCache[moduleName])
    return null;
  dir = dir || "";
  var jsList = [];
  var tempList = moduleMap[moduleName];
  if (!tempList)
    throw "can not find module [" + moduleName + "]";
  for (var i = 0, li = tempList.length; i < li; i++) {
    var item = tempList[i];
    if (jsAddedCache[item])
      continue;
    var ext = extname(item);
    if (!ext) {
      var arr = getJsListOfModule(moduleMap, item, dir);
      if (arr)
        jsList = jsList.concat(arr);
    }
    else if (ext.toLowerCase() == ".js")
      jsList.push(join(dir, item));
    jsAddedCache[item] = 1;
  }
  return jsList;
}

function extname(pathStr) {
  var temp = /(\.[^\.\/\?\\]*)(\?.*)?$/.exec(pathStr);
  return temp ? temp[1] : null;
}

function join() {
  var l = arguments.length;
  var result = "";
  for (var i = 0; i < l; i++) {
    result = (result + (result == "" ? "" : "/") + arguments[i]).replace(/(\/|\\\\)$/, "");
  }
  return result;
};

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
  gulp.watch(path.json, function () {
    gulp.start('json:copy');
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

gulp.task('compile', ['js:copy', 'css:copy', 'html:copy', 'json:copy', 'music:copy', 'image:copy', 'cocos2d:compile']);

gulp.task('serve', ['clean'], function () {
  gulp.start('connect');
});
