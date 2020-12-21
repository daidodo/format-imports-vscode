import {
  CLIEngine,
  ESLint,
  Linter,
} from 'eslint';

import { logger } from '../../common';
import { extractNewlineAfterImportRule } from './import/newline-after-import';
import { extractNoUselessPathSegmentsRule } from './import/no-useless-path-segments';
import { extractSortImportsRule } from './sort-imports';

export type ESLintConfig = NonNullable<ReturnType<typeof loadESLintConfig>>;

export function loadESLintConfig(filePath: string) {
  const log = logger('config.loadESLintConfig');
  log.debug('Start loading ESLint config for filePath:', filePath);
  log.info('ESLint API version:', ESLint.version);
  try {
    const eslint = new CLIEngine({});
    if (eslint.isPathIgnored(filePath)) {
      log.debug('Ignored by ESLint for filePath:', filePath);
      return undefined;
    }
    const config = eslint.getConfigForFile(filePath);
    log.debug('Finish loading ESLint config');
    return translate(config);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : `${e}`;
    log.warn('Failed loading ESLint config:', msg);
    return undefined;
  }
}

function translate({ rules }: Linter.Config) {
  if (!rules) return undefined;
  const sortImports = extractSortImportsRule(rules);
  const newlineAfterImport = extractNewlineAfterImportRule(rules);
  const noUselessPathSegments = extractNoUselessPathSegmentsRule(rules);
  return { sortImports, newlineAfterImport, noUselessPathSegments };
}
