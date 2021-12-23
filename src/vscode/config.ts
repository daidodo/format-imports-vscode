import {
  Configuration as BaseConfig,
  mergeConfig,
  resolveConfigForFile,
} from 'format-imports';
import cloneDeep from 'lodash.clonedeep';
import NodeCache from 'node-cache';
import {
  EndOfLine,
  Uri,
  workspace,
  WorkspaceConfiguration,
} from 'vscode';

import SortActionProvider from './actions';
import { logger } from './log';

interface Configuration extends BaseConfig {
  readonly autoFormat?: 'off' | 'onSave';
  readonly development?: {
    readonly enableDebug?: boolean;
  };
}

interface VscEditorConfig {
  detectIndentation: boolean;
  insertSpaces: boolean;
  tabSize: number;
  codeActionsOnSave?: { [kind: string]: boolean } | string[];
}

interface VscFilesConfig {
  insertFinalNewline: boolean;
  eol: '\n' | '\r\n' | 'auto';
}

const CACHE = new NodeCache({ stdTTL: 2 });

export function resolveConfig(fileUri: Uri, languageId: string, eol: EndOfLine, force?: boolean) {
  const log = logger('vscode.resolveConfig');
  const { fsPath: fileName } = fileUri;
  log.info('Resolving config for fileName:', fileName, 'languageId:', languageId);
  const c = CACHE.get(fileName);
  if (c && typeof c === 'object') {
    log.debug('Resolved config in cache:', c);
    return c as Configuration;
  }
  const { config: vscConfig, codeAction } = loadVscConfig(fileUri, languageId);
  const c1 = mergeConfig(vscConfig, {
    eol: eol === EndOfLine.CRLF ? 'CRLF' : 'LF',
    force,
  });
  log.debug('Loaded codeAction:', codeAction, 'and VSCode config:', c1);
  const c2 = resolveConfigForFile(fileName, c1);
  const r = codeAction ? mergeConfig(c2, { autoFormat: 'off' }) : c2;
  CACHE.set(fileName, r);
  return r;
}

function loadVscConfig(fileUri: Uri, languageId: string) {
  const log = logger('vscode.loadVscConfig');
  log.debug('Loading VSCode config for fileName:', fileUri.fsPath);
  const wsConfig = workspaceConfig(fileUri);
  const general = workspace.getConfiguration(undefined, fileUri);
  const langSpec = workspace.getConfiguration(`[${languageId}]`, fileUri);
  const { config: c1, codeAction: a1 } = transform(general);
  const { config: c2, codeAction: a2 } = transform(langSpec);
  return { config: mergeConfig(wsConfig, c1, c2), codeAction: a1 || a2 };
}

function workspaceConfig(fileUri: Uri) {
  const config = workspace
    .getConfiguration('tsImportSorter', fileUri)
    .get<Configuration>('configuration');
  logger().level = config?.development?.enableDebug ? 'debug' : 'info';
  if (!config) return {};
  return cloneDeep(config);
}

function transform(wsConfig: WorkspaceConfiguration) {
  const { detectIndentation, insertSpaces, tabSize, codeActionsOnSave } =
    wsConfig.get<VscEditorConfig>('editor') ?? {};
  // If 'detectIndentation' is true, indentation is detected instead of from settings.
  const tabType =
    detectIndentation || insertSpaces === undefined
      ? undefined
      : insertSpaces
      ? ('space' as const)
      : ('tab' as const);
  const actionId = SortActionProvider.ACTION_ID;
  const codeAction =
    codeActionsOnSave &&
    (Array.isArray(codeActionsOnSave)
      ? codeActionsOnSave.includes(actionId)
      : codeActionsOnSave[actionId]);
  const { insertFinalNewline: nl, eol } = wsConfig.get<VscFilesConfig>('files') ?? {};
  return {
    config: {
      tabType,
      tabSize: detectIndentation ? undefined : tabSize,
      insertFinalNewline: nl ? true : ('preserve' as const),
      eof: eol === 'auto' ? undefined : eol,
    },
    codeAction,
  };
}
