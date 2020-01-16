interface GroupRule {
  regex: string;
  level: number;
}

export interface Configuration {
  configurationFileName?: string;
  exclude?: string[];
  groupRules?: GroupRule[];
  maximumLineLength?: number;
  maximumWords?: number;
  tabSize?: number;
  tabType?: 'space' | 'tab';
  quoteMark?: 'single' | 'double';
  trailingComma?: 'none' | 'multiLine';
  hasSemicolon?: boolean;
}
