import {
  normalize,
  sep,
} from 'path';

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
    const r = normalize(str).replace(new RegExp('\\' + sep, 'g'), '/');
    return r === '.' ? './' : r === '..' ? '../' : r;
  }
  return str;
}
