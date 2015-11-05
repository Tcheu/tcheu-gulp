'use strict';

/**
 * Configuration
 */

var config = {
    // Define here the required browser versions for the autoprefixer
    'autoprefixer': [
        'last 2 versions',
        'ie >= 9'
    ],
    // BrowserSync configuration
    'browsersync': {
        'open': false,
        'port': '3000',
        'server': {
            'baseDir': 'public'
        },
        'notify': true
    },
    // SCSS files
    'scss': {
        'src': 'public/assets/css/',
        'dist': 'public/dist/css',
        'bundleName': 'main.css'
    },
    // These are the HTML or PHP files to watch
    'html': {
        'src': [
            'craft/templates/**/*.html'
        ]
    },
    // Images folders for image optimisation
    'img': {
        'src': 'public/assets/img/**/*.+(png|jpg|jpeg|gif|svg|ico)',
        'dist': 'public/dist/img/'
    },
    // JavaScript files
    'js': {
        'src': 'public/assets/js/',
        'dist': 'public//dist/js/',
        'bundleName': 'main.js'
    },
    // Source SVG files to create a spritemap
    'svg': {
        'src': 'public/assets/img/svg/sprite_sources/',
        'dist': 'public/img/svg/',
        'spriteFile': 'svgsprite.svg'
    }
};


/**
 * Load Gulp.js and its associated plugins
 */

var gulp				= require('gulp'),
    sass				= require('gulp-sass'),
    autoprefixer		= require('gulp-autoprefixer'),
    jshint				= require('gulp-jshint'),
    stripdebug			= require('gulp-strip-debug'),
    uglify				= require('gulp-uglify'),
    rename				= require('gulp-rename'),
    replace				= require('gulp-replace'),
    concat				= require('gulp-concat'),
    notify				= require('gulp-notify'),
    minifycss			= require('gulp-minify-css'),
    path				= require('path'),
    plumber				= require('gulp-plumber'),
    gutil				= require('gulp-util'),
    imagemin			= require('gulp-imagemin'),
    svgstore			= require('gulp-svgstore'),
    cp					= require('child_process'),
    browsersync			= require('browser-sync'),
    size 				= require('gulp-size'),
    exec				= require('child_process').exec;


/**
 * Helper functions
 */

// Error function for Plumber
var onError = function (err) {
    gutil.beep();
    console.log(err);
    this.emit('end');
};


/**
 * Tasks
 */

// BrowserSync proxy
gulp.task('browser-sync', function() {
    browsersync(config.browsersync);
});

// BrowserSync reload all Browsers
gulp.task('browsersync-reload', function () {
    browsersync.reload();
});

// Sass compilation
gulp.task('scss', function() {
    return gulp.src( [config.scss.src + 'main.scss'] )
        .pipe(plumber({ errorHandler: onError }))
        .pipe(sass({ style: 'expanded' }))
        .pipe(gulp.dest( config.scss.dist ))
        .pipe(autoprefixer( config.autoprefixer ))
        .pipe(rename({ suffix: '.min' }))
        .pipe(minifycss())
        .pipe(gulp.dest( config.scss.dist ))
        .pipe(browsersync.reload({stream: true}))
        .pipe(notify({ message: 'Styles task done' }))
        .pipe(size({ title: 'scss' }));
});

// Lint JS task
gulp.task('jslint', function() {
    return gulp.src( config.js.src + '**/*.js' )
        .pipe(plumber({ errorHandler: onError }))
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        .pipe(jshint.reporter('fail'))
        .pipe(notify({ message: 'JS lint task done' }));
});

// Concatenate and Minify JS task
gulp.task('scripts', function() {
    return gulp.src( config.js.src + '**/*.js' )
        .pipe(concat( config.js.bundleName ))
        .pipe(gulp.dest( config.js.dist ))
        .pipe(rename({ suffix: '.min' }))
        .pipe(stripdebug())
        .pipe(uglify())
        .pipe(gulp.dest( config.js.dist ))
        .pipe(browsersync.reload({ stream:true }))
        .pipe(notify({ message: 'Scripts task done' }))
        .pipe(size({ title: 'scripts' }));
});

// Optimize Images task
gulp.task('optimize-img', function() {
    return gulp.src([ config.img.src, '!' + config.svg.dist + config.svg.spriteFile ])
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [ {removeViewBox:false}, {removeUselessStrokeAndFill:false} ]
        }))
        .pipe(gulp.dest( config.img.dist ))
        .pipe(notify({ message: 'Images task done', onLast: true }));
});

// Make svg sprite
gulp.task('svgsprite', ['optimize-img'], function() {
    return gulp.src( config.svg.src + '/**/' + '*.svg' )
        .pipe(svgstore())
        .pipe(rename( config.svg.spriteFile ))
        .pipe(gulp.dest( config.svg.dist ))
        .pipe(notify({ message: 'SVG sprite done' }));
});

// Watch task
gulp.task('watch', ['browser-sync'], function () {
    gulp.watch(config.scss.src + '**/*' , ['scss']);
    gulp.watch(config.js.src + '**/*' , ['jslint', 'scripts']);
    gulp.watch(config.html.src, ['browsersync-reload']);
});

// Tasks
gulp.task('default', ['img', 'scss', 'jslint', 'scripts', 'browsersync-reload']);
gulp.task('img', ['optimize-img', 'svgsprite']);