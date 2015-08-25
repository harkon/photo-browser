var gulp = require('gulp');
var concat = require('gulp-concat');
var util = require('gulp-util');
var less = require('gulp-less');
var autoprefix = require('gulp-autoprefixer');
var changed = require('gulp-changed');
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');
var browserSync = require('browser-sync').create();
var reload = browserSync.reload;
var path = require('path');
var gulpCopy = require('gulp-copy');
var del = require('del');

gulp.task('clean', function() {
   del.sync(['dist/**', '!dist']); 
});

gulp.task('less', function() {
   return gulp.src('src/app/*.less')
      .pipe(changed('dist/css'))
      .pipe(less({
         paths: [path.join(__dirname, 'less', 'includes')]
      }))
      .pipe(autoprefix('last 2 version', 'ie 8', 'ie 9'))
      .pipe(gulp.dest('dist/css'))
      .on('error', util.log);
});

gulp.task('js', function() {
   return gulp.src(['src/app/**/!(app)*.js', 'src/app/app.js'])
      .pipe(jshint())
      .pipe(jshint.reporter(stylish))
      .pipe(concat('app.js'))
      .pipe(gulp.dest('dist/js'))
      .on('error', util.log)
});

gulp.task('html', function() {
   return gulp.src('src/**/*.html')
      .pipe(gulp.dest('dist/'))
});

gulp.task('copy', function() {
   return gulp.src('assets/images/*.jpg', {
         base: 'assets/images/'
      })
      .pipe(gulp.dest('dist/images'));
});

gulp.task('serve', ['html', 'less', 'js'], function() {
   var files = [
      'src/**/*.html',
      'src/app/**/*.js',
      'dist/css/*.css'
   ];

   browserSync.init(files, {
      server: {
         baseDir: ['src', 'assets', 'dist'],
         index: 'index.html'
      }
   });

   gulp.watch('src/app/*.less', ['less']);
   gulp.watch('src/app/**/*.js', ['js']).on('change', reload);
   gulp.watch('dist/css/*.css').on('change', reload);
   gulp.watch('src/**/*.html').on('change', reload);

});

gulp.task('default', ['clean', 'html', 'less', 'js', 'copy']);