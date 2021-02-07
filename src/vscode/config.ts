import {
  Configuration as BaseConfig,
  mergeConfig,
  resolveConfigForFile,
} from 'format-imports';
import cloneDeep from 'lodash.clonedeep';
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

export function resolveConfig(fileUri: Uri, languageId: string, eol: EndOfLine, force?: boolean) {
  const log = logger('vscode.resolveConfig');
  const { fsPath: fileName } = fileUri;
  log.info(`Start resolving configs for fileName: ${fileName}, languageId: ${languageId}`);
  const vscConfig = loadVscConfig(fileUri, languageId);
  const config = mergeConfig(vscConfig, {
    eol: eol === EndOfLine.CRLF ? 'CRLF' : 'LF',
    force,
  });
  return resolveConfigForFile(fileName, config);
}

function loadVscConfig(fileUri: Uri, languageId: string): Configuration {
  const log = logger('config.loadVscConfig');
  log.debug(`Start loading VSC config for fileName: ${fileUri.fsPath}, languageId: ${languageId}`);
  const wsConfig = workspaceConfig(fileUri);
  const general = workspace.getConfiguration(undefined, fileUri);
  const langSpec = workspace.getConfiguration(`[${languageId}]`, fileUri);
  log.debug('Finish loading VSC config');
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
