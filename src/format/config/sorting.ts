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
 * String comparison rule.
 *
 * If it's 'none', then there is no sorting at all.
 */
export type CompareRule = SegSymbol[] | 'none';

/**
 * Symbols for different styles of imports from [ESLint](https://eslint.org/docs/rules/sort-imports#membersyntaxsortorder):
 * - none - import module without exported bindings.
 * - all - import all members provided by exported bindings.
 * - multiple - import multiple members.
 * - single - import single member.
 */
type SyntaxTypeSymbol = 'none' | 'all' | 'single' | 'multiple';

/**
 * The order of the above different types of imports.
 */
type SyntaxSortRule = [SyntaxTypeSymbol, SyntaxTypeSymbol, SyntaxTypeSymbol, SyntaxTypeSymbol];

export interface SortRules {
  /**
   * The order of different styles of imports from [ESLint](https://eslint.org/docs/rules/sort-imports#membersyntaxsortorder).
   *
   * If undefined, imports will NOT be distinguished and sorted by types.
   */
  syntaxOrder?: SyntaxSortRule;

  /**
   * Sorting rule for import paths.
   */
  paths?: CompareRule;

  /**
   * Sorting rule for imported names.
   */
  names?: CompareRule;
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
