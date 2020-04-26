import { GroupRule } from './grouping';
import { SortRules } from './sorting';

export type Configuration = Readonly<
  Partial<{
    // From VS Code "tsImportSorter" settings
    configurationFileName: string;
    autoFormat: 'off' | 'onSave';
    formatExports: boolean;
    exclude: string[];
    excludeGlob: string[];
    groupRules: (string | string[] | GroupRule)[];
    sortRules: SortRules;
    maximumLineLength: number;
    maximumBindingNamesPerLine: number;
    maximumDefaultAndBindingNamesPerLine: number;
    maximumNamesPerWrappedLine: number;
    // From other configs
    tabType: 'space' | 'tab';
    tabSize: number;
    quoteMark: 'single' | 'double';
    trailingComma: 'none' | 'multiLine';
    hasSemicolon: boolean;
    insertFinalNewline: boolean;
    bracketSpacing: boolean;
    // Internal or not configurable
    eol: 'LF' | 'CRLF'; // This is not configurable because VS Code will format the file anyway.
    force: boolean; // Internal. Ignore exclude paths and file disable-comment.
  }>
>;

/**
 * Properties in `Configuration` that need to be merged instead of replaced.
 */
export const KEYS_TO_MERGE = ['exclude' as const, 'excludeGlob' as const, 'sortRules' as const];

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
