/* eslint-disable @typescript-eslint/camelcase */

// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import {
  commands,
  ExtensionContext,
  OutputChannel,
  Range,
  TextDocument,
  TextDocumentWillSaveEvent,
  TextEdit,
  TextEditor,
  window,
  workspace,
} from 'vscode';

import loadConfig, { isExcluded } from './config';
import {
  initLog,
  uninitLog,
} from './log';
import formatSource from './main';

let g_vscChannel: OutputChannel;

// This method is called when your extension is activated.
// Your extension is activated the very first time the command is executed.
export function activate(context: ExtensionContext) {
  g_vscChannel = window.createOutputChannel('JS/TS Import/Export Sorter');
  initLog(g_vscChannel);

  const sortCommand = commands.registerTextEditorCommand(
    'tsImportSorter.command.sortImports',
    sortImportsByCommand,
  );
  const beforeSave = workspace.onWillSaveTextDocument(event =>
    sortImportsBeforeSavingDocument(event),
  );
  context.subscriptions.push(sortCommand, beforeSave);

  // let lastActiveDocument: TextDocument | undefined;
  // const editorChanged = window.onDidChangeActiveTextEditor(event => {
  //   window.showInformationMessage(lastActiveDocument?.fileName ?? 'nil');
  //   lastActiveDocument = event?.document;
  // });
  // const focusChanged = window.onDidChangeWindowState(event => {
  //   if (event.focused) return;
  //   window.showInformationMessage('Focus changed: ' + lastActiveDocument?.fileName);
  // });
  // context.subscriptions.push(editorChanged, focusChanged);
}

// this method is called when your extension is deactivated
export function deactivate() {
  uninitLog();
  g_vscChannel.dispose();
}

function sortImportsByCommand(editor: TextEditor) {
  if (!editor) return;
  const { document } = editor;
  if (!document) return;
  const newSourceText = formatDocument(document, true);
  if (newSourceText === undefined) return;
  editor.edit(edit => edit.replace(fullRange(document), newSourceText));
}

function sortImportsBeforeSavingDocument(event: TextDocumentWillSaveEvent) {
  const { document } = event;
  const newSourceText = formatDocument(document);
  if (newSourceText === undefined) return;
  event.waitUntil(Promise.resolve([TextEdit.replace(fullRange(document), newSourceText)]));
}

function formatDocument(document: TextDocument, force?: boolean) {
  if (!isSupported(document)) return undefined;
  const { uri: fileUri, languageId, eol } = document;
  const { fsPath: fileName } = fileUri;
  try {
    const { config, tsCompilerOptions } = loadConfig(fileUri, languageId, eol, force);
    if (!force && config.autoFormat !== 'onSave') return undefined;
    if (isExcluded(fileName, config)) return undefined;
    const sourceText = document.getText();
    const newText = formatSource(fileName, sourceText, config, tsCompilerOptions);
    return newText === sourceText ? undefined : newText;
  } catch (e) {
    window.showErrorMessage(
      `Error found: ${e.message}.
      If you believe this is a bug, please report on https://github.com/daidodo/tsimportsorter`,
    );
  }
  return undefined;
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
