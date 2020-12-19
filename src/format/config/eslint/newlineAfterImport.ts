import { tuple1 } from '../../../common';
import {
  Configuration,
  ESLintConfig,
} from '../../../config';

type NewlineAfterImportOptions = NonNullable<ESLintConfig['newlineAfterImport']>;

export function translateNewlineAfterImportRule(
  oldConfig: Configuration,
  options?: NewlineAfterImportOptions,
) {
  if (!options) return tuple1(oldConfig);
  const { count: emptyLinesAfterAllImports } = options;
  const config = { ...oldConfig, emptyLinesAfterAllImports };
  return tuple1(config);
}
