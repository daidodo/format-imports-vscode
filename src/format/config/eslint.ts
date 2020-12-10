import {
  CompareRule,
  Configuration,
  ESLintConfig,
  FlagSymbol,
  mergeConfig,
  SortImportsOptions,
} from '../../config';

export interface ESLintConfigProcessed {
  ignoreSorting: boolean;
  groupOrder?: FlagSymbol[];
}

interface TranslateResult {
  config: Configuration;
  processed?: ESLintConfigProcessed;
}

export function translateESLintConfig(
  config: Configuration,
  eslintConfig: ESLintConfig | undefined,
): TranslateResult {
  if (!eslintConfig) return { config };
  return translateSortImportsRule(config, eslintConfig.sortImports);
}

function translateSortImportsRule(oldConfig: Configuration, options: SortImportsOptions) {
  if (!options) return { config: oldConfig };
  const { ignoreCase, memberSyntaxSortOrder, allowSeparatedGroups } = options;
  const sortRules = calcSortRules(ignoreCase);
  const { groupRules, groupOrder } = calcGroupRules(memberSyntaxSortOrder, allowSeparatedGroups);
  const config = mergeConfig(oldConfig, { sortImportsBy: 'names', sortRules, groupRules });
  return { config, processed: { groupOrder, ignoreSorting: true } };
}

function calcSortRules(ignoreCase: boolean) {
  const names: CompareRule = ignoreCase ? ['_', 'aA'] : ['AZ', '_'];
  return { names };
}

function calcGroupRules(
  memberSyntaxSortOrder: ('none' | 'all' | 'multiple' | 'single')[],
  allowSeparatedGroups: boolean,
) {
  const groupOrder: FlagSymbol[] = memberSyntaxSortOrder.map(v => {
    switch (v) {
      case 'none':
        return 'scripts';
      case 'all':
        return 'namespace';
      case 'multiple':
        return 'multiple';
      case 'single':
        return 'single';
    }
  });
  return allowSeparatedGroups
    ? { groupOrder }
    : { groupRules: groupOrder.map(g => ({ flags: g })) };
}
