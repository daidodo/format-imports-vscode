import {
  extractOptions,
  Rules,
} from './comm';

export function extractSortImportsRule(rules: Rules) {
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
