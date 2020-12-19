import {
  Configuration,
  ESLintConfig,
} from '../../../config';
import { translateNewlineAfterImportRule } from './newlineAfterImport';
import { translateSortImportsRule } from './sortImports';

export type ESLintConfigProcessed = NonNullable<
  ReturnType<typeof translateESLintConfig>['processed']
>;

export function translateESLintConfig(
  oldConfig: Configuration,
  eslintConfig: ESLintConfig | undefined,
) {
  if (!eslintConfig) return { config: oldConfig };
  const [c1, p1] = translateSortImportsRule(oldConfig, eslintConfig.sortImports);
  const [c2] = translateNewlineAfterImportRule(c1, eslintConfig.newlineAfterImport);
  return { config: c2, processed: p1 };
}
