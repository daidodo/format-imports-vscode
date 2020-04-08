import {
  Configuration,
  SortRule,
} from '../config';
import Segment from './Segment';

type Comparator = (a: string | undefined, b: string | undefined) => number;

export interface SortConfig {
  comparePaths: Comparator;
  compareNames: Comparator;
}

export function configForSort(config: Configuration): SortConfig {
  return {
    comparePaths: comparatorFromRule(config.sortRules?.paths),
    compareNames: comparatorFromRule(config.sortRules?.names),
  };
}

function comparatorFromRule(rule: SortRule | undefined): Comparator {
  if (!rule || !rule.length) return (a, b) => (a ?? '').localeCompare(b ?? '');
  const map = new Map<number, Segment>();
  rule.forEach((s, i) => new Segment(s, i, map));
  return (a, b) => {
    if (!a) return !b ? 0 : -1;
    if (!b) return 1;
    let i = 0;
    for (; i < a.length && i < b.length; ++i) {
      const n1 = a.charCodeAt(i);
      const n2 = b.charCodeAt(i);
      if (n1 === n2) continue;
      const s1 = map.get(n1);
      const s2 = map.get(n2);
      if (!s1 || !s2) return a.charAt(i).localeCompare(b.charAt(i));
      if (s1 !== s2) return s1.rank - s2.rank;
      return s1.compare(n1, n2);
    }
    return i < a.length ? 1 : i < b.length ? -1 : 0;
  };
}
