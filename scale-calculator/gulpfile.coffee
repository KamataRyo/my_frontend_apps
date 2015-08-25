gulp       = require 'gulp'
connect    = require 'gulp-connect'
path       = require 'path'
exec       = require 'gulp-exec'
just_exec = (require 'child_process').exec
compass    = require 'gulp-compass'
coffee     = require 'gulp-coffee'
minifyCSS  = require 'gulp-minify-css'
cache      = require 'gulp-cached'
gulpFilter = require 'gulp-filter'
plumber    = require 'gulp-plumber'
notify     = require 'gulp-notify'


base = './'

srcs = 
  watching : [
    base + '*.html'
    base + 'sass/*.scss'
    base + 'coffee/*.coffee'
  ]
  uploading :　[
    base + '*.html'
    base + 'css/*.css'
    base + 'js/*.js'
  ]
 
host = 'localhost'
port = 8001



# create server
gulp.task "connect", () ->
  options =
    root: path.resolve(base)
    livereload: true
    port: port
    host: host

  connect.server options




gulp.task "watch", () ->
  gulp.watch srcs["watching"], ["compass", "coffee", "reload"]




gulp.task "compass", () ->
  options =
    config_file: base + 'config.rb'
    css: base + 'css/'
    sass: base + 'sass/'
    image: base + 'img/'

  gulp.src base + 'sass/*.scss'
    .pipe plumber(errorHandler: notify.onError '<%= error.message %>')
    .pipe compass options
    #.pipe minifyCSS()
    .pipe gulp.dest base + 'css/'



gulp.task "coffee", () ->
  gulp.src base + 'coffee/*.coffee'
    .pipe plumber(errorHandler: notify.onError '<%= error.message %>')
    .pipe coffee(bare: true)
    .pipe gulp.dest base + 'js/'



gulp.task "reload", ["compass", "coffee"] , () ->
  gulp.src srcs["watching"]
    .pipe connect.reload()



gulp.task "default", ["compass","coffee","connect", "watch" ]


