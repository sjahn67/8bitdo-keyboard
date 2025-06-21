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
const { getInstalledApps } = require('get-installed-apps')
const pkgExec = require("pkg").exec;
const makeVersion = require("../../build/makeVersion");
const { platform } = require("os");

// Executable file names.
const NAME_ATTA_WIN32 = "atta-server.exe";
const NAME_ATTA_2 = "atta-server";

const NAME_TARGET_WIN32 = "node16-win-x64";
const NAME_TARGET_DARWIN = "node16-macos-arm64";
const NAME_TARGET_LINUX = "node16-linux-x64";

let nameAtta, nameTarget, nameElectronBuilder;//, nameLauncher;
switch (platform()) {
  case "win32":
    nameAtta = NAME_ATTA_WIN32;
    nameTarget = NAME_TARGET_WIN32;
    nameElectronBuilder = "electron-builder.cmd";
    // nameLauncher = NAME_MICROID_LAUNCHER;
    break;

  case "linux":
    nameAtta = NAME_ATTA_2;
    nameTarget = NAME_TARGET_LINUX;
    nameElectronBuilder = "electron-builder.cmd";
    // nameLauncher = NAME_MICROID_LAUNCHER_2;
    break;

  case "darwin":
    nameAtta = NAME_ATTA_2;
    nameTarget = NAME_TARGET_DARWIN;
    nameElectronBuilder = "electron-builder";
    // nameLauncher = NAME_MICROID_LAUNCHER_2;
    break;


}
// The directory for the build. 
const BaseDir = join(gulpRoot, "bin-release");
const distPath = join(gulpRoot, "dist");
const distElectronDir = join(distPath, "electron");
const distServerDir = join(distPath, "server");

const AppDir = join(gulpRoot);
const BuildDir = join(AppDir, "build");
const cBuildDir = join(gulpRoot, "build");
const sourcePath = join(gulpRoot, "dist", "server", "serverMain.js");
// const launcherSourcePath = join(cBuildDir, "microid-service-launcher.js");
const srcServerDir = join(gulpRoot, "src", "server");
const srcServerDbDir = join(srcServerDir, "database");
const srcNativeDir = join(srcServerDir, "native");

const copyServerData = [
  { source: gulpRoot + "/node_modules/idsys-lib/build/Release/idsys-lib.node", dest: BuildDir },
];

async function makeAppVersion() {
  await makeVersion();
  await Promise.resolve(true);
}

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
  const appFiles = join(AppDir, nameAtta);
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
  const ret = await pkgExec([`${sourcePath}`, "-C", "Brotli", "--config", `${cBuildDir}/pkg.json`, "--target", nameTarget, '--output', `${AppDir}/${nameAtta}`]);
  await Promise.resolve(ret);
}

async function getInnoSetup() {
  return new Promise((resolve, reject) => {
    let cmdInnoSetup = null;
    getInstalledApps().then(apps => {
      apps.forEach(element => {
        if (element.appName.indexOf("Inno Setup") !== -1) {
          cmdInnoSetup = element.DisplayIcon;
          resolve(cmdInnoSetup);
          return;
        }
      });
      if (cmdInnoSetup === null)
        reject(new Error("Can't find Inno Setup Program!!!"));
    })
  });
}

async function buildElectronSetupPackage() {
  try {
    let exeCmd = path.join("node_modules", ".bin", nameElectronBuilder);
    const cmdOption = `-c ${cBuildDir}/electron-builder.json`
    exeCmd += " " + cmdOption;
    console.log("Build setup package with electron builder...");
    const electronCacheDir = join(gulpRoot, "electron-builder-cache");
    const options = { env: { ...process.env, ELECTRON_BUILDER_CACHE: electronCacheDir }, cwd: gulpRoot };
    const ret = await doExeWithConsoleMsg(exeCmd, options);
    if (ret !== 0) console.log("build Make electron Package Error!!");
    else console.log("Make Electron package success!")

    await Promise.resolve(true);
  } catch (err) {
    console.log(err.message);
    await Promise.reject(err.message);
  }
}

gulp.task("buildPkg", gulp.series(makeAppVersion, cleanExecutableDirectory, buildExecutable, copyServerPackage));
// gulp.task("buildLauncher", buildServiceLauncherExe);
gulp.task("packaging", buildElectronSetupPackage);
