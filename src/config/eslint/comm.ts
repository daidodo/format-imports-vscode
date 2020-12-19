/* eslint-disable @typescript-eslint/no-unsafe-return */

import { Linter } from 'eslint';

export type Rules = Required<Linter.Config>['rules'];
export function extractOptions<Key extends keyof Rules, Options>(
  rules: Rules,
  key: Key,
  defaultOptions: Options,
): Options | undefined {
  const rule = rules[key];
  if (rule === undefined || rule === 0 || rule === 'off') return undefined;
  if (Array.isArray(rule)) {
    const [level, options] = rule;
    if (level === 0 || level === 'off') return undefined;
    return { ...defaultOptions, ...(options ?? {}) };
  }
  return defaultOptions;
}
