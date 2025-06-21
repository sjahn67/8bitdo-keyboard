'use strict';

var gulp = require('gulp');
var jest = require('gulp-jest').default;

gulp.task('jest', function () {
    process.env.NODE_ENV = 'test';

    return gulp.src('spec')
        .pipe(jest({
            "automock": false,
            "reporters": ["default", "jest-junit"]
        }));
});