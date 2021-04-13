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
    log.debug('Resolved config in cache');
    return c as Configuration;
  }
  const vscConfig = loadVscConfig(fileUri, languageId);
  const config = mergeConfig(vscConfig, {
    eol: eol === EndOfLine.CRLF ? 'CRLF' : 'LF',
    force,
  });
  log.debug('Loaded VSCode config');
  const r = resolveConfigForFile(fileName, config);
  CACHE.set(fileName, r);
  return r;
}

function loadVscConfig(fileUri: Uri, languageId: string): Configuration {
  const log = logger('vscode.loadVscConfig');
  log.debug('Loading VSCode config for fileName:', fileUri.fsPath);
  const wsConfig = workspaceConfig(fileUri);
  const general = workspace.getConfiguration(undefined, fileUri);
  const langSpec = workspace.getConfiguration(`[${languageId}]`, fileUri);
  return mergeConfig(wsConfig, transform(general), transform(langSpec));
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
  const { detectIndentation, insertSpaces, tabSize } =
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
    tabType,
    tabSize: detectIndentation ? undefined : tabSize,
    insertFinalNewline,
    eof: eol === 'auto' ? undefined : eol,
  };
}
