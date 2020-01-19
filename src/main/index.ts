import { TextDocument, TextDocumentWillSaveEvent, window } from 'vscode';

import composeInsertSource from '../compose';
import loadConfig from '../config';
import { getDeleteEdits, getEdits } from '../edit';
import parseSource from '../parser';
import sortImports from '../sort';

export default function sortImportsBeforeSavingDocument(event: TextDocumentWillSaveEvent) {
  window.showInformationMessage('TS Import Sorter starts.');
  const { document } = event;
  if (!isSupported(document)) return;

  const sourceText = document.getText();
  const { uri: fileUri } = document;
  const { fsPath: fileName } = fileUri;
  try {
    window.showInformationMessage('TS Import Sorter: parsing source');
    const { allIds, importNodes, insertLine } = parseSource(sourceText, fileName);
    const { deleteEdits, noFinalNewLine } = getDeleteEdits(importNodes, insertLine);
    window.showInformationMessage('TS Import Sorter: loading config');
    const config = loadConfig(fileUri);
    window.showInformationMessage('TS Import Sorter: sorting');
    const groups = sortImports(importNodes, allIds, config);
    const insertSource = composeInsertSource(groups, config, noFinalNewLine);
    const edits = getEdits(deleteEdits, insertSource, insertLine.line);
    window.showInformationMessage('TS Import Sorter: editing source');
    event.waitUntil(edits);
    window.showInformationMessage('TS Import Sorter: finished');
  } catch (e) {
    window.showErrorMessage(
      `TSImportSorter failed: ${e.message}.
      Please report a bug on https://github.com/daidodo/tsimportsorter`,
    );
  }
}

function isSupported(document: TextDocument) {
  const { languageId } = document;
  return languageId === 'typescript' || languageId === 'typescriptreact';
}
