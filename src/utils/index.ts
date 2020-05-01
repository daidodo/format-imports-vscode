import fs from 'fs';
import path, { sep } from 'path';

export function assert(condition: unknown, message?: string): asserts condition {
  if (!condition) throw Error(message ?? `Assert failed, condition = ${condition}`);
}

export function assertNonNull<T>(value: T, message?: string): asserts value is NonNullable<T> {
  if (value === undefined || value === null) {
    throw Error(message ?? `Assert Non-Null failed, value = ${value}`);
  }
}

export function normalizePath(str: string | undefined | null) {
  if (!str) return '';
  const r = path.normalize(str.replace(/\\/g, '/'));
  return !str.startsWith('.')
    ? r
    : !r.startsWith('.')
    ? './' + r
    : r === '.'
    ? './'
    : r.endsWith('..')
    ? r + '/'
    : r;
}

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
 * Test if `path` exists and is a regular file.
 */
export function isRegularFile(path: string) {
  return fs.existsSync(path) && fs.statSync(path).isFile();
}

export function isObject(v: any) {
  return typeof v === 'object' && !Array.isArray(v) && v !== null;
}
