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
  aliasFirst: boolean;
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

function translateSortImportsRule(oldConfig: Configuration, options?: SortImportsOptions) {
  if (!options) return { config: oldConfig };
  const sortImportsBy = calcSortImportsBy(options);
  const sortRules = calcSortRules(options);
  const aliasFirst = !!sortRules;
  const ignoreSorting = !!sortImportsBy || !!sortRules;
  const { groupRules, groupOrder } = calcGroupRules(options);
  const config = mergeConfig(oldConfig, { sortImportsBy, sortRules, groupRules });
  return { config, processed: { groupOrder, ignoreSorting, aliasFirst } };
}

function calcSortImportsBy({ ignoreDeclarationSort }: SortImportsOptions) {
  return ignoreDeclarationSort ? undefined : ('names' as const);
}

function calcSortRules({
  ignoreCase,
  ignoreDeclarationSort,
  ignoreMemberSort,
}: SortImportsOptions) {
  if (ignoreDeclarationSort && ignoreMemberSort) return undefined;
  const names: CompareRule = ignoreCase ? ['_', 'aA'] : ['AZ', '_'];
  return { names };
}

function calcGroupRules({ memberSyntaxSortOrder, allowSeparatedGroups }: SortImportsOptions) {
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
