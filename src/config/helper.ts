import fs from 'fs';
import { sep } from 'path';

import { Configuration } from '../format';

/**
 * Search for `filename` from `path` and up to all its parents.
 */
export function findFileFromPathAndParents(filename: string | undefined | null, path?: string) {
  if (!filename) return [];
  // Absolute path: /path/to/file or C:\path\to\file
  if (/^(\/|[a-zA-Z]:\\)/.test(filename)) return [filename];
  if (!path) return [];
  const comp = path.split(/[\\/]+/);
  if (isRegularFile(path)) comp.pop();
  const results = [];
  for (; comp.length > 0; comp.pop()) {
    const n = `${comp.join(sep)}${sep}${filename}`;
    if (isRegularFile(n)) results.push(n);
  }
  return results;
}

/**
 * Test if `path` exists and is a regular file.
 */
function isRegularFile(path: string) {
  return fs.existsSync(path) && fs.statSync(path).isFile();
}

/**
 * Get parent folder for path.
 */
export function parentFolder(path: string | undefined | null) {
  if (!path) return '';
  const p = path.replace(/\/+/g, '/').replace(/\\+/g, '\\');
  const i = p.search(/[\\/][^\\/]*$/);
  if (i < 0) return '';
  if (i === 0) return /[\\/]$/.test(p) ? '' : p.substr(0, 1);
  return p.substr(0, i);
}

/**
 * Properties in `Configuration` that need to be merged instead of replaced.
 */
const KEYS_TO_MERGE = [
  'exclude' as const,
  'excludeGlob' as const,
  'sortRules' as const,
  'keepUnused' as const,
];

export function mergeConfig(...configs: Configuration[]) {
  return configs.reduce((a, b) => {
    const obj: Configuration = KEYS_TO_MERGE.map(k => {
      const e1 = a[k];
      const e2 = b[k];
      return {
        [k]: !e1
          ? e2
          : !e2
          ? e1
          : Array.isArray(e1) && Array.isArray(e2)
          ? [...e1, ...e2]
          : { ...e1, ...e2 },
      };
    }).reduce((v1, v2) => ({ ...v1, ...v2 }));

    return { ...purify(a), ...purify(b), ...purify(obj) };
  });
}

function purify<T extends Record<string, unknown>>(a: T): Partial<T> {
  const r: Partial<T> = {};
  for (const k in a) {
    const v = a[k];
    if (v !== undefined) r[k] = v;
  }
  return r;
}
