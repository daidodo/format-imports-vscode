import {
  ARRAY_KEYS,
  Configuration,
  OBJECT_KEYS,
} from './types';

export function merge(...configs: Configuration[]) {
  return configs.reduce((a, b) => {
    const arr: Configuration = ARRAY_KEYS.map(k => {
      const e1 = a[k];
      const e2 = b[k];
      return { [k]: !e1 ? e2 : !e2 ? e1 : [...e1, ...e2] };
    }).reduce((v1, v2) => ({ ...v1, ...v2 }));
    const obj: Configuration = OBJECT_KEYS.map(k => {
      const e1 = a[k];
      const e2 = b[k];
      return { [k]: !e1 ? e2 : !e2 ? e1 : { ...e1, ...e2 } };
    }).reduce((v1, v2) => ({ ...v1, ...v2 }));

    return { ...purify(a), ...purify(b), ...purify(arr), ...purify(obj) };
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
