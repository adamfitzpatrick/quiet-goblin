"use strict";

const CI = process.env.CI === "true";

const gulp = require("gulp");
const spawnMocha = require("gulp-spawn-mocha");
const plumber = require("gulp-plumber");
const jshint = require("gulp-jshint");
const stylish = require("jshint-stylish");

function lint() {
    return gulp.src(["**/*.js", "!node_modules/**/*.js", "!reporting/**/*.js"])
        .pipe(jshint())
        .pipe(jshint.reporter(stylish));
}

function test() {
    return gulp.src("src/**/*.spec.js")
        .pipe(plumber())
        .pipe(spawnMocha({
            reporter: CI ? "spec" : "nyan",
            istanbul: true
        }));
}

function watchTests() {
    return lint().on("end", () => {
        test().on("end", () => {
            return gulp.watch("src/**/*.js", ["lint", "test"]);
        });
    });
}

function e2eTest() {
    return gulp.src("e2e/**/*.e2e.spec.js")
        .pipe(spawnMocha({reporter: CI ? "spec" : "nyan"}));
}

gulp.task("lint", lint);
gulp.task("test", ["lint"], test);
gulp.task("tdd", watchTests);
gulp.task("e2e", e2eTest);
gulp.task("ci", ["lint", "test"], e2eTest);
