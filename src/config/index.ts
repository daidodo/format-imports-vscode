import { Uri } from 'vscode';

import { loadIsConfig } from './importSorter';
import { loadTsConfig } from './tsconfig';
import {
  ComposeConfig,
  Configuration,
} from './types';

export { Configuration, ComposeConfig };

export default function loadConfig(fileUri: Uri, languageId: string) {
  const config = loadIsConfig(fileUri, languageId);
  const tsConfig = loadTsConfig(fileUri.fsPath);
  return { config, tsConfig };
}

export function isExcluded(fileName: string, config: Configuration) {
  const { exclude } = config;
  for (const p of exclude ?? []) if (new RegExp(p).test(fileName)) return true;
  return false;
}

export function configForCompose({
  maximumLineLength,
  maximumBindingNamesPerLine,
  maximumDefaultAndBindingNamesPerLine,
  maximumNamesPerWrappedLine,
  tabType,
  tabSize,
  quoteMark,
  trailingComma,
  hasSemicolon,
  bracketSpacing,
  insertFinalNewline,
  eol,
}: Configuration): ComposeConfig {
  return {
    maxLength: maximumLineLength || Number.MAX_SAFE_INTEGER,
    maxWords: {
      withoutDefault: maximumBindingNamesPerLine || Number.MAX_SAFE_INTEGER,
      withDefault: maximumDefaultAndBindingNamesPerLine || Number.MAX_SAFE_INTEGER,
      wrapped: maximumNamesPerWrappedLine || Number.MAX_SAFE_INTEGER,
    },
    tab: tabType === 'tab' ? '\t' : ' '.repeat(tabSize ?? 2),
    quote: quoteMark === 'double' ? (s: string) => `"${s}"` : (s: string) => `'${s}'`,
    comma: trailingComma === 'none' ? '' : ',',
    semi: hasSemicolon === false ? '' : ';',
    bracket: bracketSpacing === false ? (s: string) => `{${s}}` : (s: string) => `{ ${s} }`,
    lastNewLine: insertFinalNewline !== false,
    nl: eol === 'CRLF' ? '\r\n' : '\n',
  };
}
