import { DeepReadonly } from 'utility-types';

import { GroupRule } from './grouping';
import {
  SegSymbol,
  SortRule,
  SortRules,
} from './sorting';
import { KeepUnusedRule } from './unused';

export { GroupRule, KeepUnusedRule, SegSymbol, SortRule, SortRules };

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
    maxBindingNamesPerLine: number;
    maxDefaultAndBindingNamesPerLine: number;
    maxExportNamesPerLine: number;
    maxNamesPerWrappedLine: number;
    keepUnused: KeepUnusedRule[];
    EmptyLinesBetweenGroups: number;
    // From other configs
    maxLineLength: number;
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

export type ComposeConfig = DeepReadonly<{
  maxLength: number;
  maxWords: { withDefault: number; withoutDefault: number; wrapped: number; exported: number };
  groupSep: string;
  tab: string;
  quote: (s: string) => string;
  comma: string;
  semi: string;
  bracket: (s: string) => string;
  lastNewLine: boolean;
  nl: string;
}>;

export function configForCompose({
  maxLineLength,
  maxBindingNamesPerLine,
  maxDefaultAndBindingNamesPerLine,
  maxExportNamesPerLine,
  maxNamesPerWrappedLine,
  EmptyLinesBetweenGroups,
  tabType,
  tabSize,
  quoteMark,
  trailingComma,
  hasSemicolon,
  bracketSpacing,
  insertFinalNewline,
  eol,
}: Configuration): ComposeConfig {
  const nl = eol === 'CRLF' ? '\r\n' : '\n';
  return {
    maxLength: (maxLineLength ?? 80) || Number.MAX_SAFE_INTEGER,
    maxWords: {
      withoutDefault: (maxBindingNamesPerLine ?? 1) || Number.MAX_SAFE_INTEGER,
      withDefault: (maxDefaultAndBindingNamesPerLine ?? 2) || Number.MAX_SAFE_INTEGER,
      wrapped: (maxNamesPerWrappedLine ?? 1) || Number.MAX_SAFE_INTEGER,
      exported: maxExportNamesPerLine || Number.MAX_SAFE_INTEGER,
    },
    groupSep: nl.repeat((EmptyLinesBetweenGroups ?? 1) + 1),
    tab: tabType?.toLowerCase() === 'tab' ? '\t' : ' '.repeat(tabSize ?? 2),
    quote:
      quoteMark?.toLowerCase() === 'double' ? (s: string) => `"${s}"` : (s: string) => `'${s}'`,
    comma: trailingComma?.toLowerCase() === 'none' ? '' : ',',
    semi: hasSemicolon === false ? '' : ';',
    bracket: bracketSpacing === false ? (s: string) => `{${s}}` : (s: string) => `{ ${s} }`,
    lastNewLine: insertFinalNewline !== false,
    nl,
  };
}
