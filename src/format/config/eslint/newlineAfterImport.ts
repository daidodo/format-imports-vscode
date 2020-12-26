import {
  Configuration,
  ESLintConfig,
} from '../../../config';

type NewlineAfterImportOptions = NonNullable<ESLintConfig['newlineAfterImport']>;

export function translateNewlineAfterImportRule(
  config: Configuration,
  options?: NewlineAfterImportOptions,
) {
  if (!options) return { config };
  const { count: emptyLinesAfterAllImports } = options;
  const c = { ...config, emptyLinesAfterAllImports };
  return { config: c };
}
