import log4js from 'log4js';

export function assert(condition: unknown, message?: string): asserts condition {
  if (!condition) throw Error(message ?? `Assert failed, condition = ${condition}`);
}

export function assertNonNull<T>(value: T, message?: string): asserts value is NonNullable<T> {
  if (value === undefined || value === null) {
    throw Error(message ?? `Assert Non-Null failed, value = ${value}`);
  }
}

export function logger(category?: string) {
  return log4js.getLogger(category);
}

export function tuple1<T1>(v1: T1): [T1] {
  return [v1];
}

export function tuple2<T1, T2>(v1: T1, v2: T2): [T1, T2] {
  return [v1, v2];
}
