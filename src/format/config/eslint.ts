import {
  CompareRule,
  Configuration,
  ESLintConfig,
  GroupRule,
  mergeConfig,
} from '../../config';

export type ESLintConfigProcessed = Partial<
  Required<ReturnType<typeof translateESLintConfig>>['processed']
>;

export function translateESLintConfig(oldConfig: Configuration, eslintConfig: ESLintConfig) {
  return translateSortImportsRule(oldConfig, eslintConfig.sortImports);
}

type SortImportsOptions = ESLintConfig['sortImports'];

function translateSortImportsRule(oldConfig: Configuration, options: SortImportsOptions) {
  if (!options) return { config: oldConfig };
  const { ignoreCase, memberSyntaxSortOrder, allowSeparatedGroups } = options;
  const sortRules = calcSortRules(ignoreCase);
  const { groupRules, subGroups } = calcGroupRules(
    oldConfig,
    memberSyntaxSortOrder,
    allowSeparatedGroups,
  );
  const config = mergeConfig(oldConfig, { sortImportsBy: 'names', sortRules, groupRules });
  return subGroups ? { config, processed: { subGroups, ignoreSorting: true } } : { config };
}

function calcSortRules(ignoreCase: boolean) {
  const names: CompareRule = ignoreCase ? ['_', 'aA'] : ['AZ', '_'];
  return { names };
}

function calcGroupRules(
  { groupRules }: Configuration,
  memberSyntaxSortOrder: ('none' | 'all' | 'multiple' | 'single')[],
  allowSeparatedGroups: boolean,
) {
  const groups: GroupRule[] = memberSyntaxSortOrder.map(v => {
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
  return allowSeparatedGroups
    ? { groupRules: [...(groupRules ?? []), { flags: 'named' as const }], subGroups: groups }
    : { groupRules: groups };
}
