import path from 'path';

import runner from '../runner';

export function run() {
  const testsRoot = path.resolve(__dirname, '..');
  const packageRoot = path.resolve(testsRoot, '..', '..');

  return runner(testsRoot, packageRoot);
}
