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
    tabSize: number;
    tabType: 'space' | 'tab';
    quoteMark: 'single' | 'double';
    trailingComma: 'none' | 'multiLine';
    hasSemicolon: boolean;
    insertFinalNewline: boolean;
    bracketSpacing: boolean;
    eol: 'LF' | 'CRLF';
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
