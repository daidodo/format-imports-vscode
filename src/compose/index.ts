import { Configuration } from '../config';
import { ImportNode } from '../parser';

export interface ComposeConfig {
  maxLength: number;
  maxWords: number;
  tab: string;
  quote: (s: string) => string;
  comma: string;
  semi: string;
}

export default function composeImportGroups(groups: ImportNode[][], config: Configuration) {
  const c = configForCompose(config);
  return groups.map(g => g.map(n => n.compose(c)).join('\n') + '\n').join('\n') + '\n';
}

function configForCompose(config: Configuration): ComposeConfig {
  const { tabType, tabSize, quoteMark, trailingComma, hasSemicolon } = config;
  return {
    maxLength: config.maximumLineLength ?? Number.MAX_SAFE_INTEGER,
    maxWords: config.maximumWordsPerLine ?? Number.MAX_SAFE_INTEGER,
    tab: tabType === 'tab' ? '\t' : ' '.repeat(tabSize ?? 2),
    quote: quoteMark === 'double' ? (s: string) => `"${s}"` : (s: string) => `'${s}'`,
    comma: trailingComma === 'none' ? '' : ',',
    semi: hasSemicolon === false ? '' : ';',
  };
}
