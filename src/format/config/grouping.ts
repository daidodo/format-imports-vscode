import { SortRules } from './sorting';

export interface GroupRule {
  /**
   * - "all": This group is for all imports, i.e. script and named (non-script) imports.
   * - "scripts": This group is for script imports, e.g. `import 'some_scripts';`.
   * - `named`: This group is for named (non-script) imports, e.g. `import React from 'react';`.
   * - `undefined`: Infer the flag from its parent and subGroups.
   */
  flag?: 'all' | 'scripts' | 'named';

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
   * Sort import statements by paths or first names.
   * If it's undefined, then use the parent's value, or 'paths' if this is a top group.
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
  sortImportsBy?: 'paths' | 'names';

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
   * - `string` items will be expanded to `{ regex: elem }`.
   * - `string[]` items will be expanded to `{ subGroups: elem }`.
   */
  subGroups?: (string | string[] | GroupRule)[];
}
