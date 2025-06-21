'use strict';

// commons
const gulp = require('gulp');
const path = require("path");
const { join, resolve } = path.posix;
const del = require("del");
const cp = require("cp-file");
const fs = require("fs");
const { gulpRoot, doExeWithConsoleMsg, copyDefaultFiles } = require("../utils");

const configFileName = "tsconfig.json";

// define source destination directories
const srcDir = join(gulpRoot, "src");
const srcServerDir = join(srcDir, "server");
const srcServerDbDir = join(srcServerDir, "database");
const srcElectronDir = join(srcDir, "electron");
const srcElectronIncludePath = join(srcElectronDir, "includes");
const srcClientDir = join(srcElectronDir, "client");
const serverConfigPath = join(srcDir, configFileName);
// const srcNativeDir = join(srcServerDir, "native");

/// define dist direcotries
const distDir = join(gulpRoot, "dist");
const distServerDir = join(distDir, "server");
const distServerDbDir = join(distServerDir, "database");
const distElectronDir = join(distDir, "electron");
const distElectronIncludePath = join(distElectronDir, "includes");
const distClientDir = join(distElectronDir, "client");

const cBuildDir = join(gulpRoot, "build");

const copyServerData = [
  { source: [`${srcServerDbDir}/*.*`, `!${srcServerDbDir}/*.ts`], dest: distServerDbDir },
  { source: [`${srcElectronIncludePath}/*.json`], dest: distElectronIncludePath },
  { source: [`${srcElectronDir}/atta.ico`, `${srcElectronDir}/atta-mac.png`], dest: distElectronDir }
];

const copyClientData = [
];


function handleError(err) {
  console.log(err.message);
  this.emit('end');
}

async function buildServer() {
  const exeCmd = `npx tsc -p ${serverConfigPath}`;
  const ret = await doExeWithConsoleMsg(exeCmd, gulpRoot);
  if (ret != 0) {
    await Promise.reject(new Error("Typescript error!"));
  }
  console.log("...Build server done!");
  await Promise.resolve(ret);
}

async function buildClient() {
  try {
    console.log("...Build client!");
    const exeCmd = `npx webpack --progress --color --config ./dist/electron/webpack.config.js`;
    const ret = await doExeWithConsoleMsg(exeCmd, gulpRoot);
    await Promise.resolve(ret);
  } catch (err) {
    console.log("Error in buildClient:", err.message);
    await Promise.reject(err.message);
  }
}

async function buildClientDev() {
  try {
    console.log("...Build client in dev mode!");
    const exeCmd = `npx webpack --progress --color --config ./dist/electron/webpack.dev.config.js`;
    ret = await doExeWithConsoleMsg(exeCmd, gulpRoot);
    await Promise.resolve(ret);
  } catch (err) {
    console.log("Error in buildClientDev:", err.message);
    await Promise.reject(err.message);
  }
}


async function testClient() {
  console.log("...Check Typescript code!")
  const ret = await doExeWithConsoleMsg("npx tsc", srcClientDir);
  if (ret !== 0) {
    await Promise.reject(new Error("Typescript error!"));
    return;
  } else {
    console.log("...Check success!");
  }
  await Promise.resolve(ret);
}


async function copyServerFiles() {
  try {
    copyServerData.forEach(async (current) => {
      const ret = await copyDefaultFiles(current.source, current.dest);
    });
    await Promise.resolve(true);
  } catch (err) {
    await Promise.reject(err.message);
  }
}

async function copyClientFiles() {
  try {
    copyClientData.forEach(async (current) => {
      const ret = await copyDefaultFiles(current.source, current.dest);
    });
    await Promise.resolve(true);
  } catch (err) {
    await Promise.reject(err.message);
  }
}


async function compileNative() {
  // Create the executable
  try {
    console.log("Compile native..");
    const exeCmd = `npx node-gyp rebuild`;
    const ret = await doExeWithConsoleMsg(exeCmd, srcNativeDir);
    await Promise.resolve(ret);
  } catch (err) {
    await Promise.reject(err.message);
  }
}

async function copyNative() {
  try {
    for (let i = 0; i < copyData.length; ++i) {
      const current = copyData[i];
      await copyDefaultFiles(current.source, current.dest);
    }
    await Promise.resolve(true);
  } catch (err) {
    await Promise.reject(err.message);
  }
}

async function clientWatch() {
  try {
    console.log("client-watch!")
    const exeCmd = `npx webpack --watch --progress --color --config ./dist/webpack.dev.config.js`;
    const ret = await doExeWithConsoleMsg(exeCmd, gulpRoot);
    await Promise.resolve(ret);
  } catch (err) {
    await Promise.reject(err.message);
  }

}

gulp.task("build-server", gulp.series(buildServer, copyServerFiles));
gulp.task("build-client", gulp.series(testClient, buildClient, copyClientFiles));
gulp.task("build-client-dev", gulp.series(testClient, buildClientDev));
gulp.task("build-client:watch", clientWatch);
