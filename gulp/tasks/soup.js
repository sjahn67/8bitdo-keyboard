
const gulp = require("gulp");
const { CLIEngine } = require("npm-package-json-lint");

/**
 * Checks the package compliance
 *
 */
function checkPackageCompliance(cb) {
  const engine = new CLIEngine({
    configFile: '',
    cwd: process.cwd(),
    useConfigFiles: true,
    ignorePath: '',
    rules: {}
  });
  const outcome = engine.executeOnPackageJsonFiles(['package.json']);

  if (outcome.errorCount > 0) {
    console.debug(JSON.stringify(outcome));
    throw new Error(outcome.results);
  } else {
    cb();
  }
}

gulp.task("packageCheck", checkPackageCompliance);
