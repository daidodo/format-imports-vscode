export interface GroupRule {
  /**
   * - "all": This group is for all imports.
   * - "scripts": This group is for script imports, e.g. `import 'some_scripts';`
   * - `undefined`: This group is for other imports.
   */
  flag?: 'all' | 'scripts' | undefined;
  /**
   * Import path pattern. If it's `undefined` then use `subGroups` patterns instead.
   *
   * If both `regex` and `subGroups` are `undefined`, then this is a *fall-back* group,
   * i.e. any cases don't match any other groups (within the parent) will fall into this group.
   */
  regex?: string;
  /**
   * Sub-groups and rules. Imports will be sorted as the same order as sub groups defined.
   *
   * `string` elems will be expanded to `{ regex: elem }`.
   */
  subGroups?: (string | GroupRule)[];
}

export type Configuration = Readonly<
  Partial<{
    configurationFileName: string;
    autoFormat: 'off' | 'onSave';
    exclude: string[];
    excludeGlob: string[];
    groupRules: (string | GroupRule)[];
    maximumLineLength: number;
    maximumBindingNamesPerLine: number;
    maximumDefaultAndBindingNamesPerLine: number;
    maximumNamesPerWrappedLine: number;
    tabType: 'space' | 'tab';
    tabSize: number;
    quoteMark: 'single' | 'double';
    trailingComma: 'none' | 'multiLine';
    hasSemicolon: boolean;
    insertFinalNewline: boolean;
    bracketSpacing: boolean;
    eol: 'LF' | 'CRLF'; // This is not configurable because VS Code will format the file anyway.
    force: boolean; // Ignore exclude paths and file disable-comment.
  }>
>;

export interface ComposeConfig {
  maxLength: number;
  maxWords: { withDefault: number; withoutDefault: number; wrapped: number };
  tab: string;
  quote: (s: string) => string;
  comma: string;
  semi: string;
  bracket: (s: string) => string;
  lastNewLine: boolean;
  nl: string;
}
