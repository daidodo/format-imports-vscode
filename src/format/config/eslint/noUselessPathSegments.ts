import {
  Configuration,
  ESLintConfig,
} from '../../../config';

type NoUselessPathSegmentsOptions = NonNullable<ESLintConfig['noUselessPathSegments']>;

export function translateNoUselessPathSegmentsRule(
  config: Configuration,
  options?: NoUselessPathSegmentsOptions,
) {
  if (!options) return { config };
  const { noUselessIndex: removeLastIndexInPath } = options;
  const c = { ...config, removeLastSlashInPath: true, removeLastIndexInPath };
  return { config: c };
}
