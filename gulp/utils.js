'use strict';

const gulp = require('gulp');
const path = require("path");
const { join, resolve } = path.posix;
const { platform } = require("os");
const { exec } = require("child_process");

const m = module.exports = {};

switch (platform()) {
    case "win32":
        console.log("Platform: Windows");
        m.gulpRoot = path.join(__dirname, "..").replace(/\\/g, '/');
        break;

    case "linux":
        console.log("Platform: Linux");
        m.gulpRoot = join(__dirname, "..");
        break;

    case "darwin":
        console.log("Platform: macOS");
        m.gulpRoot = join(__dirname, "..");
        break;

    default:
        console.error("Unknown platform!");
        m.gulpRoot = join(__dirname, "..");
        break;
}

console.log("gulpRoot:", m.gulpRoot);

m.doExeWithConsoleMsg = async function (cmd, options) {
    if (typeof options === "string") {
        options = { cwd: options };
    }
    return new Promise(resolve => {
        let instance = exec(cmd, options);
        instance.stdout.pipe(process.stdout);
        instance.stderr.pipe(process.stderr);
        instance.on("exit", code => resolve(code));
    })
}

m.copyDefaultFiles = async function (src, dest) {
    console.log(`copyDefaultFiles from: [${src}] --> ${dest}`);
    return new Promise((resolve, reject) => {
        gulp.src(src, { encoding: false }).pipe(gulp.dest(dest))
            .on("finish", resolve)
            .on("error", reject);
    });
}
