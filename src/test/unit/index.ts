import glob from 'glob';
import Mocha from 'mocha';
import path from 'path';

import setupCoverage from '../coverage';

export function run(): Promise<void> {
  // Create the mocha test
  const mocha = new Mocha({
    ui: 'tdd',
  });
  mocha.useColors(true);
  // Search for test files in src/
  const testsRoot = path.resolve(__dirname, '..', '..');
  const packageRoot = path.resolve(testsRoot, '..');
  setupCoverage(packageRoot);

  return new Promise((c, e) => {
    glob('**/**.test.js', { cwd: testsRoot }, (err, files) => {
      if (err) {
        return e(err);
      }

      // Add files to the test suite
      files
        .filter(f => !/extension[.]test[.]js/.test(f))
        .forEach(f => mocha.addFile(path.resolve(testsRoot, f)));

      try {
        // Run the mocha test
        mocha.run(failures => {
          if (failures > 0) {
            e(new Error(`${failures} tests failed.`));
          } else {
            c();
          }
        });
      } catch (err) {
        e(err);
      }
    });
  });
}
