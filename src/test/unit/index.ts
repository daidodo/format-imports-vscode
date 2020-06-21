import path from 'path';

import runner from '../runner';

export function run() {
  // Search for test files in src/
  const testsRoot = path.resolve(__dirname, '..', '..');
  const packageRoot = path.resolve(testsRoot, '..');

  return runner(testsRoot, packageRoot, '**/suite/extension.test.js');
}
