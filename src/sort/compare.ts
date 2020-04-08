import {
  Binding,
  ImportNode,
  NameBinding,
} from '../parser';
import { SortConfig } from './config';

export function compareNodes(a: ImportNode, b: ImportNode, config: SortConfig) {
  return (
    config.comparePaths(a.moduleIdentifier, b.moduleIdentifier) ||
    compareDefaultName(a.defaultName, b.defaultName, config) ||
    compareBinding(a.binding, b.binding, config)
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
function compareDefaultName(a: string | undefined, b: string | undefined, config: SortConfig) {
  if (!a) return b ? 1 : 0;
  if (!b) return -1;
  return config.compareNames(a, b);
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
function compareBinding(a: Binding | undefined, b: Binding | undefined, config: SortConfig) {
  if (!a) return b ? -1 : 0;
  if (!b) return 1;
  if (a.type === 'named' && b.type === 'named')
    return compareBindingName(a.names[0], b.names[0], config);
  // Put namespace binding in front of named bindings.
  if (a.type === 'named') return 1;
  if (b.type === 'named') return -1;
  return config.compareNames(a.alias, b.alias);
}

export function compareBindingName(a: NameBinding, b: NameBinding, config: SortConfig) {
  if (!a) return b ? -1 : 0;
  else if (!b) return 1;
  const { propertyName: pa, aliasName: aa } = a;
  const { propertyName: pb, aliasName: ab } = b;
  return comparePropertyName(pa, pb, config) || config.compareNames(aa, ab);
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
function comparePropertyName(a: string, b: string, config: SortConfig) {
  if (!a) return b ? -1 : 0;
  if (!b) return 1;
  // Put 'default as X' in front of any other binding names to highlight.
  if (a === 'default') return b === 'default' ? 0 : -1;
  if (b === 'default') return 1;
  return config.compareNames(a, b);
}
