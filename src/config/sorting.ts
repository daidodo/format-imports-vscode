/* eslint-disable tsdoc/syntax */

/**
 * Char segments used in the sorting rules.
 *
 * * 'az' - Lower case letters, i.e. [a-z].
 * * 'AZ' - Upper case letters, i.e. [A-Z].
 * * 'aA' - Both case letters and lower case first, i.e. [a-zA-Z] and `'a' < 'A' < 'b' < 'B' < ...`
 * * 'Aa' - Both case letters and upper case first, i.e. [a-zA-Z] and `'A' < 'a' < 'B' < 'b' < ...`
 * * '_' - Chars with ASCII from 91 to 96, i.e. `[`, `\`, `]`, `^`, `_`, `` ` ``(backtick).
 */
export type SortRule = ('az' | 'AZ' | 'aA' | 'Aa' | '_')[];

export interface SortRules {
  /**
   * Sorting rule for import paths.
   */
  paths: SortRule;

  /**
   * Sorting rule for imported names.
   */
  names: SortRule;
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
