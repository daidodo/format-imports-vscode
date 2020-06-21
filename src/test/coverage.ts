import decache from 'decache';
import fs from 'fs';
import glob from 'glob';
import {
  hook,
  Instrumenter,
  Reporter,
} from 'istanbul';
import path from 'path';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const remapIstanbul = require('remap-istanbul');

const CONFIG = {
  relativeSourcePath: 'out',
  relativeCoverageDir: 'coverage',
  ignorePatterns: ['**/test/**', '**/**/*.test.js'],
  reports: ['html', 'lcov', 'text-summary'],
};

interface Hook {
  hookRequire: Function;
  unhookRequire: Function;
}

declare const global: any;

/**
 * Set up Code Coverage, hooking require() so that instrumented code is returned.
 */
export default function setupCoverage(rootPath: string) {
  const coverageVar = '$$cov_' + new Date().getTime() + '$$';
  const instrumenter = new Instrumenter({ coverageVariable: coverageVar });
  const sourceRoot = path.join(rootPath, CONFIG.relativeSourcePath);
  const srcFiles = new Set(
    glob
      .sync('**/**.js', {
        cwd: sourceRoot,
        ignore: CONFIG.ignorePatterns,
      })
      .map(f => {
        const p = path.join(sourceRoot, f);
        decache(p);
        return p;
      }),
  );
  const matchFn = (file: string) => srcFiles.has(file);
  const transformer = instrumenter.instrumentSync.bind(instrumenter);
  (hook as Hook).hookRequire(matchFn, transformer, { extensions: ['.js'] });
  global[coverageVar] = {};
  const reportingDir = path.join(rootPath, CONFIG.relativeCoverageDir);

  process.on('exit', (code: number) => {
    reportCoverage(coverageVar, srcFiles, instrumenter, reportingDir);
    process.exitCode = code;
  });
}

/**
 * Writes a coverage report.
 * Note that as this is called in the process exit callback, all calls must be synchronous.
 */
function reportCoverage(
  coverageVar: string,
  srcFiles: Set<string>,
  instrumenter: any,
  reportingDir: string,
) {
  (hook as Hook).unhookRequire();
  const cov = global[coverageVar];
  if (!cov || Object.keys(cov).length < 1) {
    console.error(
      'No coverage information was collected, exit without writing coverage information',
    );
    return;
  }
  // Files that are not touched by code ran by the test runner is manually instrumented, to
  // illustrate the missing coverage.
  srcFiles.forEach(f => {
    if (cov[f]) return;
    // When instrumenting the code, istanbul will give each FunctionDeclaration a value of 1 in coverState.s,
    // presumably to compensate for function hoisting. We need to reset this, as the function was not hoisted,
    // as it was never loaded.
    for (const k in instrumenter.coverState.s) instrumenter.coverState.s[k] = 0;
    cov[f] = instrumenter.coverState;
  });

  mkDir(reportingDir);
  const coverageFile = path.resolve(reportingDir, 'coverage.json');
  fs.writeFileSync(coverageFile, JSON.stringify(cov), 'utf8');

  const remappedCollector = remapIstanbul.remap(cov);
  const reporter = new Reporter(undefined, reportingDir);
  reporter.addAll(CONFIG.reports);
  reporter.write(remappedCollector, true, () => {
    console.log(`Reports written to ${reportingDir}`);
  });
}

function mkDir(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
}
