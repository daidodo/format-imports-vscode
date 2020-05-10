import {
  SortRule,
  SortRules,
} from '../config';
import { ImportNode } from '../parser';
import {
  Binding,
  NameBinding,
} from '../types';
import Segment, { Params } from './Segment';

export type Comparator = (a: string | undefined, b: string | undefined) => number;
type InnerComparator = (a: string | undefined, b: string | undefined, c: boolean) => number;

export interface Sorter extends SortRules {
  comparePaths?: Comparator;
  compareNames?: Comparator;
}

export function sorterFromRules(rules: SortRules | undefined): Sorter {
  return {
    ...rules,
    comparePaths: comparatorFromRule(rules?.paths),
    compareNames: comparatorFromRule(rules?.names),
  };
}

export function updateSorterWithRules(sorter: Sorter, rules: SortRules | undefined) {
  if (!rules) return sorter;
  const r = { ...sorter };
  const { paths, names } = rules;
  if (paths && paths !== r.paths) {
    r.paths = paths;
    r.comparePaths = comparatorFromRule(paths);
  }
  if (names && names !== r.names) {
    r.names = names;
    r.compareNames = comparatorFromRule(names);
  }
  return r;
}

export function compareNodes(
  a: ImportNode,
  b: ImportNode,
  comparePaths: Comparator,
  compareNames: Comparator | undefined,
) {
  return (
    comparePaths(a.moduleIdentifier, b.moduleIdentifier) ||
    (compareNames
      ? compareDefaultName(a.defaultName, b.defaultName, compareNames) ||
        compareBinding(a.binding, b.binding, compareNames)
      : 0)
  );
}

/**
 * Put default import in front of binding imports to highlight, e.g.:
 *
 * ```ts
 * import D from './a';         // comment to disable merge
 * import * as A from './a';    // namespace binding import
 * import { B, C } from './a';  // named binding import
 * ```
 */
function compareDefaultName(a: string | undefined, b: string | undefined, compare: Comparator) {
  if (!a) return b ? 1 : 0;
  if (!b) return -1;
  return compare(a, b);
}

/**
 * Compare bindings.
 *
 * Note that namespace binding is sorted in front of named bindings, e.g.:
 *
 * ```ts
 * import * as C from './a';    // namespace binding import
 * import { A, B } from './a';  // named binding import
 * ```
 */
function compareBinding(a: Binding | undefined, b: Binding | undefined, compare: Comparator) {
  if (!a) return b ? -1 : 0;
  if (!b) return 1;
  if (a.type === 'named' && b.type === 'named')
    return compareBindingName(a.names[0], b.names[0], compare);
  // Put namespace binding in front of named bindings.
  if (a.type === 'named') return 1;
  if (b.type === 'named') return -1;
  return compare(a.alias, b.alias);
}

export function compareBindingName(a: NameBinding, b: NameBinding, compare: Comparator) {
  if (!a) return b ? -1 : 0;
  else if (!b) return 1;
  // 'default' < 'x as default' < 'default as x' < others
  if (isDefault(a)) return isDefault(b) ? 0 : -1;
  else if (isDefault(b)) return 1;
  const { propertyName: pa, aliasName: aa } = a;
  const { propertyName: pb, aliasName: ab } = b;
  if (isAsDefault(a)) return isAsDefault(b) ? comparePropertyName(pa, pb, compare) : -1;
  else if (isAsDefault(b)) return 1;
  return comparePropertyName(pa, pb, compare) || compare(aa, ab);
}

function isDefault(a: NameBinding) {
  return a.propertyName === 'default' && !a.aliasName;
}

function isAsDefault(a: NameBinding) {
  return !!a.propertyName && a.aliasName === 'default';
}

/**
 * Compare propertyName of named bindings.
 *
 * Note that `default as X` is sorted in front of other names to highlight, e.g.:
 *
 * ```ts
 * import { default as C, A, B } from './a';
 * ```
 */
function comparePropertyName(a: string, b: string, compare: Comparator) {
  if (!a) return b ? -1 : 0;
  if (!b) return 1;
  // Put 'default as X' in front of any other binding names to highlight.
  if (a === 'default') return b === 'default' ? 0 : -1;
  if (b === 'default') return 1;
  return compare(a, b);
}

// Default comparator
const COMPARE_DEF: Comparator = (a, b) => {
  if (!a) return !b ? 0 : -1;
  if (!b) return 1;
  return a < b ? -1 : a > b ? 1 : 0;
};

function comparatorFromRule(rule: SortRule | undefined) {
  if (rule === 'none') return undefined;
  const p = { map: new Map<number, Segment>() };
  rule?.forEach((s, i) => new Segment(s, i, p));
  return !checkAndComplete(p, rule?.length ?? 0) ? COMPARE_DEF : comparatorFromP(p);
}

function comparatorFromP(p: Params): Comparator {
  const { map, sensitive } = p;
  const c = comparatorFromMap(map);
  if (sensitive) return (a, b) => c(a, b, true);
  return (a, b) => c(a, b, false) || c(a, b, true);
}

function comparatorFromMap(map: Map<number, Segment>): InnerComparator {
  return (a, b, c) => {
    if (!a) return !b ? 0 : -1;
    if (!b) return 1;
    let i = 0;
    for (; i < a.length && i < b.length; ++i) {
      const n1 = a.charCodeAt(i);
      const n2 = b.charCodeAt(i);
      if (n1 === n2) continue;
      const s1 = map.get(n1);
      const s2 = map.get(n2);
      if (!s1 || !s2) return COMPARE_DEF(a.charAt(i), b.charAt(i));
      if (s1 !== s2) return s1.rank - s2.rank;
      const r = s1.compare(n1, n2, c);
      if (r) return r;
    }
    return i < a.length ? 1 : i < b.length ? -1 : 0;
  };
}

/**
 * Check and complete the rule if needed.
 *
 * @returns false - The rule is a no-op; true - The rule is completed.
 */
function checkAndComplete(p: Params, nextIndex: number) {
  const m = (p.mask ?? 0) & 0b111;
  // The rule is a no-op, e.g. [], ['az'].
  if (!m || !(m & (m - 1))) return false;
  // If the rule is incomplete, append the missing segment.
  switch (0b111 - m) {
    case 0b1:
      new Segment('az', nextIndex, p);
      break;
    case 0b10:
      new Segment('AZ', nextIndex, p);
      break;
    case 0b100:
      new Segment('_', nextIndex, p);
      break;
  }
  return true;
}
