import { tuple1 } from '../../../common';
import {
  Configuration,
  ESLintConfig,
} from '../../../config';

type NoUselessPathSegmentsOptions = NonNullable<ESLintConfig['noUselessPathSegments']>;

export function translateNoUselessPathSegmentsRule(
  oldConfig: Configuration,
  options?: NoUselessPathSegmentsOptions,
) {
  if (!options) return tuple1(oldConfig);
  const { noUselessIndex: removeLastIndexInPath } = options;
  const config = { ...oldConfig, removeLastSlashInPath: true, removeLastIndexInPath };
  return tuple1(config);
}
