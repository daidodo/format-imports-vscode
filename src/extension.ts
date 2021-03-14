import {
  formatSourceFromFile,
  isFileExcludedByConfig,
} from 'format-imports';
import { URLSearchParams } from 'url';
import {
  commands,
  ExtensionContext,
  OutputChannel,
  Range,
  TextDocument,
  TextDocumentWillSaveEvent,
  TextEdit,
  TextEditor,
  Uri,
  window,
  workspace,
} from 'vscode';

import {
  extensionsInfo,
  initLog,
  logger,
  osInfo,
  resolveConfig,
  uninitLog,
  vscodeInfo,
} from './vscode';

let g_vscChannel: OutputChannel;

// This method is called when your extension is activated.
// Your extension is activated the very first time the command is executed.
export function activate(context: ExtensionContext) {
  g_vscChannel = window.createOutputChannel('JS/TS Import/Export Sorter');
  const log = initLog(g_vscChannel);
  log.info('os:', osInfo());
  log.info('vscode:', vscodeInfo());
  log.info('extensions:', extensionsInfo());

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
  void editor.edit(edit => edit.replace(fullRange(document), newSourceText));
}

function sortImportsBeforeSavingDocument(event: TextDocumentWillSaveEvent) {
  const { document } = event;
  const newSourceText = formatDocument(document);
  if (newSourceText === undefined) return;
  event.waitUntil(Promise.resolve([TextEdit.replace(fullRange(document), newSourceText)]));
}

const ISSUE_URL =
  'https://github.com/daidodo/format-imports-vscode/issues/new?assignees=&labels=&template=exception_report.md&';

function formatDocument(document: TextDocument, force?: boolean) {
  const log = logger('vscode.formatDocument');
  if (!isSupported(document)) return undefined;
  const { uri: fileUri, languageId, eol } = document;
  const { fsPath: fileName } = fileUri;
  try {
    const config = resolveConfig(fileUri, languageId, eol, force);
    if (!force && config.autoFormat !== 'onSave') {
      log.info('Auto format is', config.autoFormat);
      return undefined;
    }
    if (isFileExcludedByConfig(fileName, config)) {
      const { exclude, excludeGlob } = config;
      log.info('Excluded fileName:', fileName, 'via config:', { exclude, excludeGlob });
      return undefined;
    }
    const sourceText = document.getText();
    const newText = formatSourceFromFile(sourceText, fileName, config);
    log.info('Finished', newText === undefined ? 'format with no-op' : 'format');
    return newText;
  } catch (e: unknown) {
    log.error('Found exception:', e);
    void window
      .showErrorMessage(
        'Something is wrong. Please open the logs and report an issue.',
        'Open logs & report an issue',
      )
      .then(v => {
        if (!v) return;
        g_vscChannel.show();
        const p = new URLSearchParams({
          title: `Exception: ${e instanceof Error ? e.message : e}`,
        });
        void commands.executeCommand('vscode.open', Uri.parse(ISSUE_URL + p.toString()));
      });
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
