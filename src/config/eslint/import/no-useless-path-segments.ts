import {
  extractOptions,
  Rules,
} from '../comm';

export function extractNoUselessPathSegmentsRule(rules: Rules) {
  const DEFAULT_OPTIONS = { noUselessIndex: false };
  return extractOptions(rules, 'import/no-useless-path-segments', DEFAULT_OPTIONS);
}
