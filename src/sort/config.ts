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
  const map = new Map<number, Segment>();
  const p = { map, mask: 0 };
  rule?.forEach((s, i) => new Segment(s, i, p));
  return !checkAndComplete(p, rule?.length ?? 0)
    ? (a, b) => (a ?? '').localeCompare(b ?? '')
    : (a, b) => {
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

/**
 * Check and complete the rule if needed.
 *
 * @returns false - The rule is a no-op; true - The rule is completed.
 */
function checkAndComplete(p: { map: Map<number, Segment>; mask: number }, nextIndex: number) {
  const m = p.mask & 0b111;
  // The rule is a no-op, e.g. [], ['az'].
  if (!m || !(m & (m - 1))) return false;
  // If the rule is incomplete, append the missing segment.
  if (m !== 0b111)
    switch (0b111 - m) {
      case 0b1:
        new Segment('az', nextIndex, p);
        return true;
      case 0b10:
        new Segment('AZ', nextIndex, p);
        return true;
      case 0b100:
        new Segment('_', nextIndex, p);
        return true;
    }
  return false; // Something is wrong, fall back to default.
}
