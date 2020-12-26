import {
  CompareRule,
  Configuration,
  ESLintConfig,
  FlagSymbol,
  mergeConfig,
} from '../../../config';

type SortImportsOptions = NonNullable<ESLintConfig['sortImports']>;

export function translateSortImportsRule(config: Configuration, options?: SortImportsOptions) {
  if (!options) return { config };
  const sortImportsBy = calcSortImportsBy(options);
  const sortRules = calcSortRules(options);
  const aliasFirst = !!sortRules;
  const ignoreSorting = !!sortImportsBy || !!sortRules;
  const { groupRules, groupOrder } = calcGroupRules(options);
  const c = mergeConfig(config, { sortImportsBy, sortRules, groupRules });
  return { config: c, processed: { groupOrder, ignoreSorting, aliasFirst } };
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

function calcGroupRules({
  memberSyntaxSortOrder,
  allowSeparatedGroups,
  ignoreDeclarationSort,
}: SortImportsOptions) {
  if (ignoreDeclarationSort) return {};
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
