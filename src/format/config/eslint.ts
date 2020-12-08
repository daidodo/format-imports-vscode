import { logger } from '../../common';
import {
  CompareRule,
  Configuration,
  ESLintConfig,
  GroupRule,
} from '../../config';

export function translateESLintConfig(config: Configuration, eslintConfig: ESLintConfig) {
  return translateSortImportsRule(config, eslintConfig.sortImports);
}

type SortImportsOptions = ESLintConfig['sortImports'];

function translateSortImportsRule(config: Configuration, options: SortImportsOptions) {
  const log = logger('format.translateSortImportsRule');
  if (!options) return config;
  const { ignoreCase, memberSyntaxSortOrder, allowSeparatedGroups } = options;
  const sortRules = calcSortRules(config, ignoreCase);
  const groupRules = calcGroupRules(config, memberSyntaxSortOrder, allowSeparatedGroups);
  const newConfig: Configuration = { ...config, sortImportsBy: 'names', sortRules, groupRules };
  log.debug('Translated ESLint config to newConfig:', newConfig);
  return newConfig;
}

function calcSortRules(config: Configuration, ignoreCase: boolean) {
  const { sortRules } = config;
  const names: CompareRule = ignoreCase ? ['_', 'aA'] : ['AZ', '_'];
  return { ...(sortRules ?? {}), names };
}

function calcGroupRules(
  config: Configuration,
  memberSyntaxSortOrder: ('none' | 'all' | 'multiple' | 'single')[],
  allowSeparatedGroups: boolean,
): GroupRule[] {
  const subGroups: GroupRule[] = memberSyntaxSortOrder.map(v => {
    switch (v) {
      case 'none':
        return { flags: 'scripts' };
      case 'all':
        return { flags: 'namespace' };
      case 'multiple':
        return { flags: 'multiple' };
      case 'single':
        return { flags: 'single' };
    }
  });
  // If groups are not recognized, then group the imports by memberSyntaxSortOrder.
  if (!allowSeparatedGroups) return subGroups;
  const { groupRules } = config;
  // Substitute sub groups with memberSyntaxSortOrder, reset sorting settings.
  const newGroups: GroupRule[] = (groupRules ?? []).map(g => {
    if (typeof g === 'string' || Array.isArray(g)) return { subGroups };
    return { ...g, sortImportsBy: undefined, sort: undefined, subGroups };
  });
  // Set up the fall-back group.
  newGroups.push({ flags: 'named', subGroups });
  return newGroups;
}
