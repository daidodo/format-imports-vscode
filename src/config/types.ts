import { DeepReadonly } from 'utility-types';

export type Configuration = DeepReadonly<
  Partial<{
    configurationFileName: string;
    formatOnSave: boolean;
    exclude: string[];
    groupRules: {
      regex: string;
      level: number;
    }[];
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
