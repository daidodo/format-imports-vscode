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

export function normalizePath(str: string) {
  if (str.startsWith('.')) {
    const r = path.normalize(str).replace(/\\/g, '/');
    return r === '.' ? './' : r === '..' ? '../' : !r.startsWith('.') ? './' + r : r;
  }
  return str;
}

/**
 * Search for `filename` from `path` and up to all its parents.
 */
export function findFileFromPathAndParents(filename: string, path?: string) {
  if (!filename) return [];
  // Absolute path: /path/to/file or C:\path\to\file
  if (/^(\/|[a-zA-Z]:\\)/.test(filename)) return [filename];
  assertNonNull(path);
  const comp = path.split(/\\|\//);
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
export function isRegularFile(path: string) {
  return fs.existsSync(path) && fs.statSync(path).isFile();
}

export function isObject(v: any) {
  return typeof v === 'object' && !Array.isArray(v) && v !== null;
}
