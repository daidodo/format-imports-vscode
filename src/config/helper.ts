import { Configuration } from './types';

export function merge(...configs: Configuration[]) {
  return configs.reduce((a, b) => {
    const { exclude: e1 } = a;
    const { exclude: e2 } = b;
    const exclude = !e1 ? e2 : !e2 ? e1 : [...e1, ...e2];
    return { ...purify(a), ...purify(b), ...purify({ exclude }) };
  });
}

function purify<T extends object>(a: T): Partial<T> {
  const r: Partial<T> = {};
  for (const k in a) {
    const v = a[k];
    if (v !== undefined) r[k] = v;
  }
  return r;
}
