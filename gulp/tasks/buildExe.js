'use strict';

// commons
const gulp = require('gulp');
const { exec } = require("child_process");
const path = require("path");
const { join, resolve } = path.posix;
const del = require("del");
const cp = require("cp-file");
const fs = require("fs");
const { gulpRoot, doExeWithConsoleMsg, copyDefaultFiles } = require("../utils");

// custom
const pkgExec = require("pkg").exec;
const { platform } = require("os");
const namePlatform = platform();
// Executable file names.
const NAME_BIG_WIN32 = "big-keyboard-server.exe";
const NAME_BIG_2 = "big-keyboard-server";

const NAME_TARGET_WIN32 = "node16-win-x64";
const NAME_TARGET_DARWIN = "node16-macos-arm64";
const NAME_TARGET_LINUX = "node16-linux-x64";

let nameApplication, nameTarget, nameElectronBuilder;//, nameLauncher;
switch (namePlatform) {
  case "linux":
    nameApplication = NAME_BIG_2;
    nameTarget = NAME_TARGET_LINUX;
    break;

  case "darwin":
    nameApplication = NAME_BIG_2;
    nameTarget = NAME_TARGET_DARWIN;
    break;
}
// The directory for the build. 
const BaseDir = join(gulpRoot, "bin-release");
const distPath = join(gulpRoot, "dist");
const distElectronDir = join(distPath, "electron");
const distServerDir = join(distPath, "server");

const AppDir = join(BaseDir, "big-keyboard");
const BuildDir = join(AppDir, "build");
const cBuildDir = join(gulpRoot, "build");
const sourcePath = join(gulpRoot, "dist", "index.js");

const copyServerData = [
  // { source: gulpRoot + "/node_modules/idsys-lib/build/Release/idsys-lib.node", dest: BuildDir },
];

async function copyServerPackage() {
  try {
    for (let i = 0; i < copyServerData.length; ++i) {
      const current = copyServerData[i];
      await copyDefaultFiles(current.source, current.dest);
    }
    // await cp(cBuildDir + "/astasvm64.bin", AppDir + "/astasvm.exe");
    await Promise.resolve(true);
  } catch (err) {
    await Promise.reject(err.message);
  }
}

/**
 * Builds to the executable directory, rather than the dist directory.
 *
 * @returns
 */
async function cleanExecutableDirectory() {

  // Del in one go, much quicker.
  const appFiles = join(AppDir, nameApplication);
  const buildFiles = join(BuildDir, "*.node");
  if (fs.existsSync(appFiles)) {
    console.log(`Clean ${appFiles} contents!`);
    let ret = await del(appFiles);
    console.log("del directory:", ret);
    console.log(`Clean ${buildFiles} contents!`);
    ret = await del(buildFiles);
    console.log("del directory:", ret);
  }

  await Promise.resolve(true);
}

/**
 * Builds the executable using PKG.
 *
 */
async function buildExecutable() {
  // Create the executable
  console.log("Building server executable, this can take a while..");
  // const exeCmd = `npx pkg -t ${nameTarget} -c ${cBuildDir}/package.json -o ${AppDir}/${nameMicroId} ${sourcePath}`;
  // return await doExeWithConsoleMsg(exeCmd);
  const ret = await pkgExec([`${sourcePath}`, "-C", "Brotli", "--config", `${cBuildDir}/pkg.json`, "--target", nameTarget, '--output', `${AppDir}/${nameApplication}`]);
  await Promise.resolve(ret);
}

gulp.task("buildPkg", gulp.series(cleanExecutableDirectory, buildExecutable, copyServerPackage));
// gulp.task("buildLauncher", buildServiceLauncherExe);
// gulp.task("packaging", buildElectronSetupPackage);
