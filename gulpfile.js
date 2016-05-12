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
        'ghostMode': false,
        'proxy': 'tcheu-gulp.dev',
        'online': true,
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
            'craft/templates/**/*.twig',
            'craft/config/**/*.php'
        ]
    },
    // Images folders for image optimisation
    'img': {
        'src': 'resources/assets/img/**/*.+(png|jpg|jpeg|gif|svg|ico)',
        'dist': 'public/dist/img/'
    },
    // Copy vendors assets
    'vendors': {
        'src': 'resources/assets/vendors/**/*',
        'dist': 'public/dist/vendors/'
    },
    // JavaScript files
    'js': {
        'src': 'public/assets/js/src/',
        'dist': 'public/dist/js/',
        'bundleName': 'main.bundle.js'
    },
    //JSHint configuration
    'jshint': {
        'esnext': true,
        'laxbreak': true,
        'laxcomma': true
    },
    // Source SVG files to create a spritemap
    'svg': {
        'src': 'public/dist/img/svg/sprite_sources/',
        'dist': 'public/dist/img/svg/',
        'spriteFile': 'svgsprite.svg'
    },
    //Environments
    'env': {
        'staging': {
            'host': 'your-staging-server.com',
            'deployScript': '/path/to/your/deploy/script.sh',
            'syncSrc': '/path/to/upload/folder',
            'syncDest': '/path/to/local/folder'
        },
        'production': {
            'host': 'your-production-server.com',
            'deployScript': '/path/to/your/deploy/script.sh',
            'syncSrc': '/path/to/upload/folder',
            'syncDest': '/path/to/local/folder'
        }
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
    jspm				= require('gulp-jspm'),
    cleanCSS	    	= require('gulp-clean-css'),
    notify				= require('gulp-notify'),
    path				= require('path'),
    plumber				= require('gulp-plumber'),
    rename				= require('gulp-rename'),
    replace				= require('gulp-replace'),
    rev 				= require('gulp-rev'),
    sass				= require('gulp-sass'),
    size 				= require('gulp-size'),
    strstripDebug		= require('gulp-strip-debug'),
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
        .pipe(browsersync.reload({stream: true}))
        .pipe(rename({ suffix: '.min' }))
        .pipe(cleanCSS({compatibility: 'ie9'}))
        .pipe(gulp.dest( config.scss.dist ))
        .pipe(notify({ message: 'Styles task done' }))
        .pipe(size({ title: 'scss' }));
});

// Lint JS task
gulp.task('jshint', function() {
    var paths = [config.js.src + '**/*.js', '!' + config.js.src + 'polyfills/**', '!' + config.js.src + 'libs/**/*.js'];
    return gulp.src( paths )
        .pipe(jshint( config.jshint ))
        .pipe(jshint.reporter('default'))
        .pipe(jshint.reporter('fail'));
});

// JSPM
gulp.task('jspm', ['jshint'], function() {
    del.sync(config.js.dist + '**/*');
    return gulp.src(config.js.src + 'main.js')
        .pipe(plumber({ errorHandler: onError }))
        .pipe(jspm())
        .pipe(gulp.dest('public/dist/js/'))
        .pipe(uglify())
        .pipe(strstripDebug())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('public/dist/js/'));
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

gulp.task('copy-vendors-assets',function(){
    return gulp.src( config.vendors.src )
        .pipe(gulp.dest( config.vendors.dist ))
        .pipe(notify({ message: 'Vendors assets copied', onLast: true }));
});

// Make svg sprite
gulp.task('svgsprite', ['optimize-img'], function() {
    return gulp.src( config.svg.src + '/**/' + '*.svg' )
        .pipe(svgstore())
        .pipe(rename( config.svg.spriteFile ))
        .pipe(gulp.dest( config.svg.dist ))
        .pipe(notify({ message: 'SVG sprite done' }));
});

//Update the database
gulp.task('db', function(cb) {
    var command = 'cd ../_scripts/ && ./db-update.sh';

    exec(command, {maxBuffer: 1024 * 20000}, function(err, stdout, stderr) {
        cb(err);
    });
});

//Deploy staging
gulp.task('staging', function(cb) {
    var command = "/usr/bin/ssh " + config.env.staging.host + " '" + config.env.staging.deployScript + " staging'";

    exec(command, function(err, stdout, stderr) {
        console.log(stdout);
        cb(err);
    });
});

//Deploy production
gulp.task('production', function(cb) {
    var command = "/usr/bin/ssh " + config.env.production.host + " '" + config.env.production.deployScript + " staging'";

    exec(command, function(err, stdout, stderr) {
        console.log(stdout);
        cb(err);
    });
});

//Sync assets
gulp.task('sync-staging', function(cb) {
    var command = "/usr/bin/scp -r " + config.env.staging.host + ":" + config.env.staging.syncSrc + " " + config.env.staging.syncDest;

    exec(command, function(err, stdout, stderr) {
        console.log(stdout);
        cb(err);
    });
});

//Sync assets from PROD
gulp.task('sync-prod', function(cb) {
    var command = "/usr/bin/scp -r " + config.env.production.host + ":" + config.env.production.syncSrc + " " + config.env.production.syncDest;

    exec(command, function(err, stdout, stderr) {
        console.log(stdout);
        cb(err);
    });
});

// Cache busting
gulp.task('cachebust', ['scss', 'jspm'], function() {
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
    gulp.watch(config.js.src + '**/*' , ['jspm', 'browsersync-reload']);
    gulp.watch(config.html.src, ['browsersync-reload']);
});

// Tasks
gulp.task('default', ['clean', 'img', 'copy-vendors-assets', 'scss', 'jspm', 'cachebust']);
gulp.task('all', ['db', 'sync', 'clean', 'img', 'copy-vendors-assets', 'scss', 'jspm', 'cachebust']);
gulp.task('img', ['optimize-img', 'svgsprite']);