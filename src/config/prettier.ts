import pt from 'prettier';

import { logger } from '../common';
import { Configuration } from './types';

// https://prettier.io/docs/en/options.html
export function loadPretConfig(fileName: string): Configuration {
  const log = logger('config.loadPretConfig');
  log.info('Prettier API version: ', pt.version);
  const config = pt.resolveConfig.sync(fileName, { useCache: false, editorconfig: true });
  if (!config) return {};
  const {
    printWidth,
    useTabs,
    tabWidth,
    semi,
    singleQuote,
    trailingComma,
    bracketSpacing,
    // endOfLine,
  } = config;
  return {
    maxLineLength: printWidth ?? 80,
    tabType: useTabs ? 'tab' : 'space',
    tabSize: tabWidth ?? 2,
    hasSemicolon: semi ?? true,
    quoteMark: singleQuote ? 'single' : 'double',
    trailingComma: trailingComma === 'all' ? 'multiLine' : 'none',
    bracketSpacing: bracketSpacing ?? true,
    // eol: endOfLine === 'lf' ? 'LF' : endOfLine === 'crlf' ? 'CRLF' : undefined,
    insertFinalNewline: true, // Prettier always enables it.
  };
}
