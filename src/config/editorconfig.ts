import {
  KnownProps,
  parseSync,
} from 'editorconfig';

import { Configuration } from './types';

export function loadEcConfig(fileName: string): Configuration {
  // https://editorconfig.org/#file-format-details
  const {
    indent_style: st,
    indent_size: sz,
    tab_width: tw,
    end_of_line: el,
    insert_final_newline: nl,
  } = parseSync(fileName);
  return {
    tabType: st === 'unset' ? undefined : st,
    tabSize: getTabSize(sz, tw),
    insertFinalNewline: nl === 'unset' ? undefined : nl,
    eol: el === 'lf' ? 'LF' : el === 'crlf' ? 'CRLF' : undefined,
  };
}

function getTabSize(indentSize: KnownProps['indent_size'], tabWidth: KnownProps['tab_width']) {
  if (typeof indentSize === 'number') return indentSize;
  if (indentSize === 'tab' && typeof tabWidth === 'number') return tabWidth;
  return undefined;
}
