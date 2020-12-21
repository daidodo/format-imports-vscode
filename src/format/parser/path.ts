import path from 'path';

import { assert } from '../../common';

interface Options {
  removeLastSlashInPath?: boolean;
  removeLastIndexInPath?: boolean;
}

export function normalizePath(path: string, options?: Options) {
  const { removeLastSlashInPath, removeLastIndexInPath } = options ?? {};
  return apply(
    path,
    normalize,
    [removeLastIndex, removeLastIndexInPath],
    [removeLastSlash, removeLastSlashInPath],
  );
}

function normalize(str: string) {
  if (!str) return '';
  const r = path.normalize(str.replace(/\\/g, '/')).replace(/\\/g, '/');
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

const PATTERNS = ['index', 'index.js', 'index.jsx', 'index.ts', 'index.tsx'];

function removeLastSlash(str: string) {
  if (!str || str === '/' || !str.endsWith('/')) return str;
  /**
   * ```txt
   * "a/"       =>  "a"
   * "index/"   =>  "index"
   * "./a/"     =>  "./a"
   *
   * "./index/" =>  "./index/"
   * ```
   */
  const parts = str.split('/');
  assert(parts.length > 1);
  const prev = parts[parts.length - 2];
  if (parts.length > 2 && PATTERNS.includes(prev)) return str;
  return str.substr(0, str.length - 1);
}

function removeLastIndex(str: string) {
  if (!str) return str;
  const parts = str.split('/');
  if (parts.length < 2) return str;
  if (!PATTERNS.includes(parts[parts.length - 1])) return str;
  /**
   * ```txt
   * "./index"        => "./"
   * "../index"       =>  "../"
   * "./index/index"  =>  "./index/"
   *
   * "index/index"    => "index"
   * ```
   *
   */
  const prev = parts[parts.length - 2];
  if (prev !== '.' && prev !== '..' && (!PATTERNS.includes(prev) || parts.length < 3)) parts.pop();
  else parts[parts.length - 1] = '';
  return parts.join('/') || '/';
}

type Fn = (s: string) => string;

function apply(str: string, ...norms: (Fn | [Fn, boolean | undefined])[]) {
  return norms.reduce((r, n) => (Array.isArray(n) ? (n[1] ? n[0](r) : r) : n(r)), str);
}
