import {
  Configuration,
  KEYS_TO_MERGE,
} from './types';

export function merge(...configs: Configuration[]) {
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

function purify<T extends object>(a: T): Partial<T> {
  const r: Partial<T> = {};
  for (const k in a) {
    const v = a[k];
    if (v !== undefined) r[k] = v;
  }
  return r;
}
