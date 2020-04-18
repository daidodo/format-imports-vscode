import minimatch from 'minimatch';
import {
  EndOfLine,
  Uri,
} from 'vscode';

import { merge } from './helper';
import { loadImportSorterConfig } from './importSorter';
import { loadTsConfig } from './tsconfig';
import {
  ComposeConfig,
  Configuration,
} from './types';

export { GroupRule } from './grouping';
export { SegSymbol, SortRule, SortRules } from './sorting';
export { Configuration, ComposeConfig };

export default function loadConfig(
  fileUri: Uri,
  languageId: string,
  eol: EndOfLine,
  force?: boolean,
) {
  const config = merge(loadImportSorterConfig(fileUri, languageId), {
    eol: eol === EndOfLine.CRLF ? 'CRLF' : 'LF',
    force,
  });
  const tsConfig = loadTsConfig(fileUri.fsPath);
  return { config, tsConfig };
}

export function isExcluded(fileName: string, config: Configuration) {
  const { exclude, excludeGlob, force } = config;
  if (force) return false;
  // glob
  for (const p of excludeGlob ?? []) if (minimatch(fileName, p, { matchBase: true })) return true;
  // regex
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
  eol,
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
    nl: eol === 'CRLF' ? '\r\n' : '\n',
  };
}
