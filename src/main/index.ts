import {
  TextDocument,
  TextDocumentWillSaveEvent,
  window,
} from 'vscode';

import composeInsertSource from '../compose';
import loadConfig, { Configuration } from '../config';
import {
  getDeleteEdits,
  getEdits,
} from '../edit';
import parseSource from '../parser';
import sortImports from '../sort';

export default function sortImportsBeforeSavingDocument(event: TextDocumentWillSaveEvent) {
  const { document } = event;
  if (!isSupported(document)) return;

  const { uri: fileUri } = document;
  const { fsPath: fileName } = fileUri;
  const sourceText = document.getText();
  try {
    const config = loadConfig(fileUri);
    if (isExcluded(fileName, config)) return;
    const { allIds, importNodes, insertLine } = parseSource(sourceText, fileName);
    const { deleteEdits, noFinalNewLine } = getDeleteEdits(importNodes, insertLine);
    const groups = sortImports(importNodes, allIds, config);
    const insertSource = composeInsertSource(groups, config, noFinalNewLine);
    const edits = getEdits(deleteEdits, insertSource, insertLine.line);
    event.waitUntil(edits);
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

function isExcluded(fileName: string, config: Configuration) {
  const { exclude } = config;
  for (const p of exclude ?? []) if (new RegExp(p).exec(fileName)) return true;
  return false;
}
