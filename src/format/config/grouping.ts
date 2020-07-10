import { SortRules } from './sorting';

export interface GroupRule {
  /**
   * - "all": This group is for all imports, i.e. script and non-script imports.
   * - "scripts": This group is for script imports, e.g. `import 'some_scripts';`
   * - `undefined`: This group is for non-script imports.
   */
  flag?: 'all' | 'scripts' | undefined;

  /**
   * Import path pattern.
   * If it's defined, an import matching the pattern will fall into this group no matter
   * it matches one of `subGroups` or not.
   * If it's `undefined`, only imports matching one of `subGroups` fall into this group.
   *
   * If both `regex` and `subGroups` are `undefined`, then this is a *fall-back* group,
   * i.e. any cases don't match any other groups (within the parent) will fall into this group.
   */
  regex?: string;

  /**
   * Sorting rules for this group.
   *
   * If it's `undefined`, or either `paths` or `names` is `undefined`, then inherit
   * either or both of them from the parent.
   *
   * If it's "none", or either `paths` or `names` is "none", then don't sort either or both of them.
   */
  sort?: 'none' | SortRules;

  /**
   * Sub-groups and rules. Imports will be sorted as the same order as sub groups defined.
   * - `string` elems will be expanded to `{ regex: elem }`.
   * - `string[]` elems will be expanded to `{ subGroups: elem }`.
   */
  subGroups?: (string | string[] | GroupRule)[];
}
