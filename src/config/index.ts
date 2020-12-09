import minimatch from 'minimatch';
import { CompilerOptions } from 'typescript';

import {
  ESLintConfig,
  loadESLintConfig,
} from './eslint';
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
export { ESLintConfig, SortImportsOptions } from './eslint';

export interface AllConfig {
  config: Configuration;
  tsCompilerOptions?: CompilerOptions;
  eslintConfig?: ESLintConfig;
}

export function loadConfig(config: Configuration, sourceFileName: string): AllConfig {
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
