import {
  extractOptions,
  Rules,
} from '../comm';

export function extractNewlineAfterImportRule(rules: Rules) {
  const DEFAULT_OPTIONS = { count: 1 };
  return extractOptions(rules, 'import/newline-after-import', DEFAULT_OPTIONS);
}
