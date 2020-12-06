/* eslint-disable @typescript-eslint/no-unsafe-return */

import {
  CLIEngine,
  ESLint,
  Linter,
} from 'eslint';
import { DeepReadonly } from 'utility-types';

import { logger } from '../common';

export type ESLintConfig = DeepReadonly<ReturnType<typeof loadESLintConfig>>;

type Rules = Required<Linter.Config>['rules'];

export function loadESLintConfig(filePath: string) {
  const log = logger('config.loadESLintConfig');
  log.info('ESLint API version:', ESLint.version);
  log.debug('Start loading ESLint config for filePath:', filePath);
  const eslint = new CLIEngine({});
  const config = eslint.getConfigForFile(filePath);
  log.debug('Finish loading ESLint config');
  return translate(config);
}

function translate({ rules }: Linter.Config) {
  if (!rules) return {};
  const sortImports = extractSortImportsRule(rules);
  return { sortImports };
}

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
  // if (!options) return config;
  // const { ignoreCase, memberSyntaxSortOrder, allowSeparatedGroups } = options;
  // const sortRules = translateSortRules(config, ignoreCase);
  // const groupRules = translateGroupRules(config, memberSyntaxSortOrder, allowSeparatedGroups);
  // return { ...config, sortImportsBy: 'names', sortRules, groupRules };
}

// function translateSortRules(config: Configuration, ignoreCase: boolean) {
//   const { sortRules } = config;
//   const names: CompareRule = ignoreCase ? ['_', 'aA'] : ['AZ', '_'];
//   return { ...(sortRules ?? {}), names };
// }

// function translateGroupRules(
//   config: Configuration,
//   memberSyntaxSortOrder: ('none' | 'all' | 'multiple' | 'single')[],
//   allowSeparatedGroups: boolean,
// ) {
//   const groups: GroupRule[] = memberSyntaxSortOrder.map(v => {
//     switch (v) {
//       case 'none':
//         return { flags: 'scripts' };
//       case 'all':
//         return { flags: 'namespace' };
//       case 'multiple':
//         return { flags: 'multiple' };
//       case 'single':
//         return { flags: 'single' };
//     }
//   });
//   // If groups are not recognized, then group imports by memberSyntaxSortOrder.
//   if (!allowSeparatedGroups) return groups;
//   const { groupRules } = config;
//   const uniformGroups = typeof groupRules === 'string';
//   const res = (groupRules ?? []).map(({ flags, regex }) => ({}));
//   if (!groupRules) {
//   }

//   const groupRules =
//     allowSeparatedGroups && originGroupRules
//       ? originGroupRules.map(({ flags, regex }) => ({ flags, regex, subGroups: groups }))
//       : groups;
// }

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
