import {
  Uri,
  workspace,
  WorkspaceConfiguration,
} from 'vscode';

import { merge } from './helper';
import { Configuration } from './types';

interface VscEditorConfig {
  formatOnSave: boolean;
  detectIndentation: boolean;
  insertSpaces: boolean;
  tabSize: number;
}

interface VscFilesConfig {
  insertFinalNewline: boolean;
  eol: '\n' | '\r\n' | 'auto';
}

export function loadVscConfig(fileUri: Uri, languageId: string): Configuration {
  const general = workspace.getConfiguration(undefined, fileUri);
  const langSpec = workspace.getConfiguration(`[${languageId}]`, fileUri);
  return merge(transform(general), transform(langSpec));
}

function transform(wsConfig: WorkspaceConfiguration) {
  const { formatOnSave, detectIndentation, insertSpaces, tabSize } =
    wsConfig.get<VscEditorConfig>('editor') ?? {};
  // if 'detectIndentation' is true, indentation is detected instead of from settings.
  const tabType =
    detectIndentation || insertSpaces === undefined
      ? undefined
      : insertSpaces
      ? ('space' as const)
      : ('tab' as const);
  const { insertFinalNewline, eol } = wsConfig.get<VscFilesConfig>('files') ?? {};
  return {
    formatOnSave,
    tabType,
    tabSize: detectIndentation ? undefined : tabSize,
    insertFinalNewline,
    eof: eol === 'auto' ? undefined : eol,
  };
}
