import { DeepReadonly } from 'utility-types';

import { Configuration } from '../../config';

export type ComposeConfig = DeepReadonly<ReturnType<typeof configForCompose>>;

export function configForCompose({
  maxLineLength,
  maxBindingNamesPerLine,
  maxDefaultAndBindingNamesPerLine,
  maxExportNamesPerLine,
  maxNamesPerWrappedLine,
  emptyLinesBetweenGroups,
  emptyLinesAfterAllImports,
  tabType,
  tabSize,
  quoteMark,
  trailingComma,
  hasSemicolon,
  bracketSpacing,
  insertFinalNewline,
  eol,
}: Configuration) {
  const nl = eol === 'CRLF' ? '\r\n' : '\n';
  return {
    maxLength: (maxLineLength ?? 80) || Number.MAX_SAFE_INTEGER,
    maxWords: {
      withoutDefault: (maxBindingNamesPerLine ?? 1) || Number.MAX_SAFE_INTEGER,
      withDefault: (maxDefaultAndBindingNamesPerLine ?? 2) || Number.MAX_SAFE_INTEGER,
      wrapped: (maxNamesPerWrappedLine ?? 1) || Number.MAX_SAFE_INTEGER,
      exported: maxExportNamesPerLine || Number.MAX_SAFE_INTEGER,
    },
    groupSep: nl.repeat((emptyLinesBetweenGroups ?? 1) + 1),
    groupEnd: (emptyLinesAfterAllImports ?? 1) + 1,
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
