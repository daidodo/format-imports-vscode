/**
 * This is for keeping unused names.
 * `string` elems will be expanded to `{ path: elem }`.
 */
export type KeepUnusedRule =
  | string
  | {
      /**
       * Import path pattern.
       * If it's `undefined` or empty, the rule will be ignored.
       */
      path: string;
      /**
       * Imported name pattern.
       * If it's `undefined` or empty, all names will match.
       */
      names?: string[];
    };
