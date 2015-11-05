# tcheu-gulp

## About the script

This gulp file contains the tasks that we often use for our projects.
The idea here is to take away the particular settings of any project in a configuration hash,
so that we are able to re-use the same tasks and update the gulp file from project to project,
without having to go through all the tasks to adapt each path.

## Installation

Simply run `npm install` from the command line, all the needed dependencies will be downloaded.

## Configuration

Every information related to your project should be stored in the `config` variable, on top of the file.
Once you have completed this variable with all the relevant information, you will be ready to build.

Let's review all the configuration sections and their options.

### js

+ `src` - Pattern matching all the JS files that need to be concatenated
+ `bundleFileName` - Name of the concatenated (non-minified) JS file
+ `dest` - Destination folder for the concatenated and minified files

### scss

+ `src` - Pattern matching all the SCSS files that need to be compiled (using gulp-sass)
+ `bundleFileName` - Name of the concatenated (non-minified) CSS file
+ `dest` - Destination folder for the compiled and minified files

### img

+ `src` - Pattern matching all images files that need to be optimized
+ `dest` - Folder where to store the optimized images

### svg

+ `src` - A folder containing all SVG images that should united in a single sprite
+ `dist` - Where the sprite file should be stored
+ `spriteFile` - The name of the sprite file

### Other configuration sections

The other sections are used to configure individual plugins. For information regarding these options, it is best
to directly read the documentation of each plugin.

## Tasks

There are three main tasks:

### default
 
`gulp` will execute every task and then exit.

### watch

`gulp watch` will monitor all your HTML, SCSS and JS files in order to compile them and refresh your page using BrowserSync.

### img

`gulp img` will only optimise the images and create the SVG sprite file.

## Special thanks

This gulp file is largely inspired by [a blog post](http://www.webstoemp.com/blog/gulp-setup/) from our friend @jeromecoupe from [Webstoemp](http://www.webstoemp.com/).