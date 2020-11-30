import minimatch from 'minimatch';

import { logger } from '../common';
import { Configuration } from '../format';
import { loadImportSorterConfig } from './importSorter';
import { loadTsConfig } from './tsconfig';

export { mergeConfig } from './helper';

export function loadConfig(config: Configuration, sourceFileName: string) {
  const log = logger('config.loadConfig');
  log.debug('Start loading extension and TypeScript configs for sourceFileName:', sourceFileName);
  const extConfig = loadImportSorterConfig(config, sourceFileName);
  const tsCompilerOptions = loadTsConfig(sourceFileName);
  log.debug('Finish loading extension and TypeScript configs.');
  return { config: extConfig, tsCompilerOptions };
}

export function isExcluded(fileName: string, config: Configuration) {
  const { exclude, excludeGlob, force } = config;
  if (force) return false;
  // glob
  for (const p of excludeGlob ?? []) if (minimatch(fileName, p, { matchBase: true })) return true;
  // regex
  const normalized = fileName.replace(/\\/g, '/');
  for (const p of exclude ?? []) {
    const r = new RegExp(p);
    if (r.test(fileName) || r.test(normalized)) return true;
  }
  return false;
}
