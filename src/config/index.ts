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
  const normalized = fileName.replace(/\\/g, '/');
  for (const p of exclude ?? []) {
    const r = new RegExp(p);
    if (r.test(fileName) || r.test(normalized)) return true;
  }
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
}: Configuration): ComposeConfig {
  return {
    maxLength: (maximumLineLength ?? 80) || Number.MAX_SAFE_INTEGER,
    maxWords: {
      withoutDefault: (maximumBindingNamesPerLine ?? 1) || Number.MAX_SAFE_INTEGER,
      withDefault: (maximumDefaultAndBindingNamesPerLine ?? 2) || Number.MAX_SAFE_INTEGER,
      wrapped: (maximumNamesPerWrappedLine ?? 1) || Number.MAX_SAFE_INTEGER,
    },
    tab: tabType?.toLowerCase() === 'tab' ? '\t' : ' '.repeat(tabSize ?? 2),
    quote:
      quoteMark?.toLowerCase() === 'double' ? (s: string) => `"${s}"` : (s: string) => `'${s}'`,
    comma: trailingComma?.toLowerCase() === 'none' ? '' : ',',
    semi: hasSemicolon === false ? '' : ';',
    bracket: bracketSpacing === false ? (s: string) => `{${s}}` : (s: string) => `{ ${s} }`,
    lastNewLine: insertFinalNewline !== false,
    // nl: eol === 'CRLF' ? '\r\n' : '\n',
    nl: '\n', // Always be LF as VS Code will format it.
  };
}
