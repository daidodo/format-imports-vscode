/* eslint-disable tsdoc/syntax */

/**
 * Symbols for char segments:
 * * 'az' - Lower case letters, i.e. [a-z].
 * * 'AZ' - Upper case letters, i.e. [A-Z].
 * * 'aA' - Both case letters and lower case first, i.e. [a-zA-Z] and `'a' < 'A' < 'b' < 'B' < ...`
 * * 'Aa' - Both case letters and upper case first, i.e. [a-zA-Z] and `'A' < 'a' < 'B' < 'b' < ...`
 * * '_' - Chars with ASCII from 91 to 96, i.e. `[`, `\`, `]`, `^`, `_`, `` ` ``(backtick).
 */
export type SegSymbol = 'az' | 'AZ' | 'aA' | 'Aa' | '_';

/**
 * Sorting rule, which can be:
 *
 * If it's 'none', then there is no sorting at all.
 */
export type SortRule = SegSymbol[] | 'none';

export interface SortRules {
  /**
   * Sort import statements by paths or first names.
   *
   * If by paths, the result is:
   * ```
   * import B from 'a';
   * import A from 'b';
   * ```
   *
   * If by names, the result is:
   * ```
   * import A from 'b';
   * import B from 'a';
   * ```
   */
  // sortImportsBy: 'paths' | 'names';
  /**
   * Sorting rule for import paths.
   */
  paths?: SortRule;

  /**
   * Sorting rule for imported names.
   */
  names?: SortRule;
}

/*
The following are internal analysis about all sorting rules:

paths: ['_', 'aA']
names: ['_', 'aA']

imports:
  paths
  default < namespace < binding names
    default/namespace: names
    binding names

binding names:
  [propertyName, aliasName]
    propertyName: default < others, names
    aliasName: names
*/
