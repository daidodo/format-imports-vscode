// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import {
  ExtensionContext,
  Range,
  TextDocument,
  TextDocumentWillSaveEvent,
  TextEdit,
  window,
  workspace,
} from 'vscode';

import loadConfig, { isExcluded } from './config';
import formatSource from './main';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: ExtensionContext) {
  const beforeSave = workspace.onWillSaveTextDocument(event =>
    sortImportsBeforeSavingDocument(event),
  );
  context.subscriptions.push(beforeSave);
}

// this method is called when your extension is deactivated
// export function deactivate() {}

function sortImportsBeforeSavingDocument(event: TextDocumentWillSaveEvent) {
  const { document } = event;
  if (!isSupported(document)) return;

  const { uri: fileUri, languageId, eol } = document;
  const { fsPath: fileName } = fileUri;
  try {
    const { config, tsConfig } = loadConfig(fileUri, languageId, eol);
    if (!config.formatOnSave) return;
    if (isExcluded(fileName, config)) return;
    const newSourceText = formatSource(fileName, document.getText(), config, tsConfig);
    if (newSourceText === undefined) return;
    event.waitUntil(Promise.resolve([TextEdit.replace(fullRange(document), newSourceText)]));
  } catch (e) {
    window.showErrorMessage(
      `Error found: ${e.message}.
      If you believe this is a bug, please report on https://github.com/daidodo/tsimportsorter`,
    );
  }
}

function isSupported(document: TextDocument) {
  const SUPPORTED = new Set(['typescript', 'typescriptreact', 'javascript', 'javascriptreact']);
  return SUPPORTED.has(document.languageId);
}

function fullRange(document: TextDocument) {
  const lastLine = document.lineCount - 1;
  const lastCharacter = document.lineAt(lastLine).text.length;
  return new Range(0, 0, lastLine, lastCharacter);
}
