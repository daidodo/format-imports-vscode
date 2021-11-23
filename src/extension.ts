import {
  commands,
  ExtensionContext,
  languages,
  Range,
  TextDocument,
  TextDocumentWillSaveEvent,
  TextEdit,
  TextEditor,
  TextEditorEdit,
  workspace,
} from 'vscode';

import SortActionProvider from './vscode/actions';
import {
  initChannel,
  uninitChannel,
  vscChannel,
} from './vscode/channel';
import {
  osInfo,
  vscodeInfo,
} from './vscode/env';
import { formatDocument } from './vscode/format';
import {
  initLog,
  uninitLog,
} from './vscode/log';
import type { TriggeredFrom } from './vscode/types';

// This method is called when your extension is activated.
// Your extension is activated the very first time the command is executed.
export function activate(context: ExtensionContext) {
  initChannel();
  const log = initLog(vscChannel);
  log.info('os:', osInfo());
  log.info('vscode:', vscodeInfo());
  // log.info('extensions:', extensionsInfo());

  const sortCommand = commands.registerTextEditorCommand(
    'tsImportSorter.command.sortImports',
    sortImportsByCommand,
  );
  const beforeSave = workspace.onWillSaveTextDocument(event =>
    sortImportsBeforeSavingDocument(event),
  );
  context.subscriptions.push(
    sortCommand,
    beforeSave,
    languages.registerCodeActionsProvider(
      ['javascript', 'javascriptreact', 'typescript', 'typescriptreact'],
      new SortActionProvider(),
      { providedCodeActionKinds: SortActionProvider.ACTION_KINDS },
    ),
  );

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
  uninitChannel();
}

function sortImportsByCommand(editor: TextEditor, _: TextEditorEdit, from?: TriggeredFrom) {
  if (!editor) return;
  const { document } = editor;
  if (!document) return;
  const newSourceText = formatDocument(document, from === 'codeAction' ? from : 'onCommand');
  if (newSourceText === undefined) return;
  void editor.edit(edit => edit.replace(fullRange(document), newSourceText));
}

function sortImportsBeforeSavingDocument(event: TextDocumentWillSaveEvent) {
  const { document } = event;
  const newSourceText = formatDocument(document, 'onSave');
  if (newSourceText === undefined) return;
  event.waitUntil(Promise.resolve([TextEdit.replace(fullRange(document), newSourceText)]));
}

function fullRange(document: TextDocument) {
  const lastLine = document.lineCount - 1;
  const lastCharacter = document.lineAt(lastLine).text.length;
  return new Range(0, 0, lastLine, lastCharacter);
}
