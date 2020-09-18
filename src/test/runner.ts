import glob from 'glob';
import Mocha from 'mocha';
import path from 'path';

import setupCoverage from './coverage';

export default function runner(
  testsRoot: string,
  packageRoot: string,
  ignorePattern?: string | string[],
): Promise<void> {
  // Create the mocha test
  const mocha = new Mocha({
    ui: 'tdd',
    color: true,
  });
  // Search for test files in src/
  setupCoverage(packageRoot);

  return new Promise((c, e) => {
    glob('**/**.test.js', { cwd: testsRoot, ignore: ignorePattern }, (err, files) => {
      if (err) {
        return e(err);
      }

      // Add files to the test suite
      files.forEach(f => mocha.addFile(path.resolve(testsRoot, f)));

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
