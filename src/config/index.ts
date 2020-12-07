import minimatch from 'minimatch';

import { loadESLintConfig } from './eslint';
import { loadImportSorterConfig } from './importSorter';
import { loadTsConfig } from './tsconfig';
import { Configuration } from './types';

export {
  CompareRule,
  Configuration,
  FlagSymbol,
  GroupRule,
  KeepUnusedRule,
  SegSymbol,
  SortRules,
} from './types';

export { mergeConfig } from './helper';
export { ESLintConfig } from './eslint';

export type AllConfig = ReturnType<typeof loadConfig>;

export function loadConfig(config: Configuration, sourceFileName: string) {
  const extConfig = loadImportSorterConfig(config, sourceFileName);
  const eslintConfig = loadESLintConfig(sourceFileName);
  const tsCompilerOptions = loadTsConfig(sourceFileName);
  return { config: extConfig, tsCompilerOptions, eslintConfig };
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
