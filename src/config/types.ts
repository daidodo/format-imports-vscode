
export interface Configuration {
  configurationFileName?: string;
  exclude?: string[];
  groupRules?: {
    regex: string;
    level: number;
  }[];
  maximumLineLength?: number;
  maximumWordsPerLine?: number;
  tabSize?: number;
  tabType?: 'space' | 'tab';
  quoteMark?: 'single' | 'double';
  trailingComma?: 'none' | 'multiLine';
  hasSemicolon?: boolean;
}
