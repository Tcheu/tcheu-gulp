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
    // Where to store the build files
    'build': {
        'dir': 'public/dist',
        'public': 'public'
    },
    // SCSS files
    'scss': {
        'src': 'public/assets/scss/',
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
        'dist': 'public/dist/js/',
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
    autoprefixer		= require('gulp-autoprefixer'),
    browsersync			= require('browser-sync'),
    concat				= require('gulp-concat'),
    cp					= require('child_process'),
    del					= require('del'),
    exec				= require('child_process').exec,
    gutil				= require('gulp-util'),
    imagemin			= require('gulp-imagemin'),
    jshint				= require('gulp-jshint'),
    minifycss			= require('gulp-minify-css'),
    notify				= require('gulp-notify'),
    path				= require('path'),
    plumber				= require('gulp-plumber'),
    rename				= require('gulp-rename'),
    replace				= require('gulp-replace'),
    rev 				= require('gulp-rev'),
    sass				= require('gulp-sass'),
    size 				= require('gulp-size'),
    stripdebug			= require('gulp-strip-debug'),
    svgstore			= require('gulp-svgstore'),
    uglify				= require('gulp-uglify');


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

// Cache busting
gulp.task('cachebust', ['scss', 'scripts'], function() {
    return gulp.src( config.build.dir + '/**/*.{css,js}' )
        .pipe(rev())
        .pipe(gulp.dest( config.build.dir ))
        .pipe(rev.manifest({
            base: config.build.public,
            merge: true
        }))
        .pipe(gulp.dest( config.build.dir ));
});

//Clean assets
gulp.task('clean', function() {
    del.sync(config.build.dir + '**/*');
});

// Watch task
gulp.task('watch', ['browser-sync'], function () {
    gulp.watch(config.scss.src + '**/*' , ['scss']);
    gulp.watch(config.js.src + '**/*' , ['jslint', 'scripts']);
    gulp.watch(config.html.src, ['browsersync-reload']);
});

// Tasks
gulp.task('default', ['clean', 'img', 'scss', 'jslint', 'scripts', 'browsersync-reload', 'cachebust']);
gulp.task('img', ['optimize-img', 'svgsprite']);