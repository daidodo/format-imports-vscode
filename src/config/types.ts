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
