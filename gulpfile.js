//переменные всех плагинов
const { src, dest, watch, parallel, series } = require('gulp');

const scss          = require('gulp-sass');// препроцессор scss and sass
const concat        = require('gulp-concat');// переименование файлов
const browserSync   = require('browser-sync').create();// live-server здорового человека
const uglify        = require('gulp-uglify-es').default;// сжимает любой джава скрипт
const autoprefixer  = require('gulp-autoprefixer');// префикси сss для всех браузеров
const imagemin      = require('gulp-imagemin');// сжимаем картинки
const del           = require('del');// может удалять файли которые тебе не нужны

//переменные всех плагинов

function browsersync() {
    browserSync.init({
        server: {
            baseDir: "app/"
        }
    });
}

function cleanDist() {
    return del('dist')// удаляет папку
}

function images() {
    return src('app/images/**/*')//находим и берем содержимое
        .pipe(imagemin([
                imagemin.gifsicle({interlaced: true}),
                imagemin.mozjpeg({quality: 75, progressive: true}),
                imagemin.optipng({optimizationLevel: 5}),
                imagemin.svgo({
                    plugins: [
                        {removeViewBox: true},
                        {cleanupIDs: false}
                    ]
                })
            ]
        ))//минифицыруем
        .pipe(dest('dist/images'))//выкидывает в директорию
}

function scripts() {
    return src([
        'node_modules/jquery/dist/jquery.js',
        'app/js/main.js'        
    ])//находим и берем содержимое
    .pipe(concat('main.min.js'))//обединяет в файл
    .pipe(uglify())//минифицыруем
    .pipe(dest('app/js'))//выкидывает в директорию
    .pipe(browserSync.stream());//перезагрузка страницы
}

function styles() {
    return src('app/scss/**/*.scss')//находим и берем содержимое
        .pipe(scss({outputStyle: 'compressed'}))//сжимаем
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 8 versions'],
			browsers: [
				'Android >= 4',
				'Chrome >= 20',
				'Firefox >= 24',
				'Explorer >= 11',
				'iOS >= 6',
				'Opera >= 12',
				'Safari >= 6',
			],
            grid: true
        })) // добавляет префикси если нужно в css
        .pipe(concat('style.min.css'))//обединяет в файл
        .pipe(dest('app/css'))//выкидывает по пути
        .pipe(browserSync.stream());//перезагрузка страницы
}

function build() {
    return src([
        'app/css/style.min.css',
        'app/fonts/**/*',
        'app/js/main.min.js',
        'app/*.html'
    ], {base: 'app'})
    .pipe(dest('dist'))//выкидывает в директорию
}

function watching() {
    watch(['app/scss/**/*.scss'], styles);// если произошли измения в файлах которые указаны виполнить функцию
    watch(['app/js/**/*.js','!app/js/main.min.js'], scripts);// если произошли измения в файлах которые указаны виполнить функцию
    watch(['app/*.html']).on('change', browserSync.reload);// если произошли измения в файлах которые указаны перезагрузить страницу
}

//вызов функций
exports.styles = styles;
exports.watching = watching;
exports.browsersync = browsersync;
exports.scripts = scripts;
exports.images = images;
exports.cleanDist = cleanDist;
//вызов функций

exports.build = series(cleanDist, images, build);// пишем =  gulp build . удалем папку dist, минифицыруем изображения, строим новую папку dist.
exports.default = parallel(browsersync, watching, scripts, styles);// когда в консоле пишем gulp выполняется одновременно...