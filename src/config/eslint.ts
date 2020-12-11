/* eslint-disable @typescript-eslint/no-unsafe-return */

import {
  CLIEngine,
  ESLint,
  Linter,
} from 'eslint';

import { logger } from '../common';

export interface ESLintConfig {
  sortImports?: SortImportsOptions;
}

type Rules = Required<Linter.Config>['rules'];

export function loadESLintConfig(filePath: string): ESLintConfig | undefined {
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
  return { sortImports };
}

export type SortImportsOptions = NonNullable<ReturnType<typeof extractSortImportsRule>>;

function extractSortImportsRule(rules: Rules) {
  const DEFAULT_OPTIONS = {
    ignoreCase: false,
    ignoreDeclarationSort: false,
    ignoreMemberSort: false,
    memberSyntaxSortOrder: [
      'none' as const,
      'all' as const,
      'multiple' as const,
      'single' as const,
    ],
    allowSeparatedGroups: false,
  };
  return extractOptions(rules, 'sort-imports', DEFAULT_OPTIONS);
}

function extractOptions<Key extends keyof Rules, Options>(
  rules: Rules,
  key: Key,
  defaultOptions: Options,
): Options | undefined {
  const rule = rules[key];
  if (rule === undefined || rule === 0 || rule === 'off') return undefined;
  if (Array.isArray(rule)) {
    const [level, options] = rule;
    if (level === 0 || level === 'off') return undefined;
    return { ...defaultOptions, ...(options ?? {}) };
  }
  return defaultOptions;
}
