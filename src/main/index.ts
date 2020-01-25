import ts, { ScriptTarget } from 'typescript';
import {
  TextDocument,
  TextDocumentWillSaveEvent,
  window,
} from 'vscode';

import composeInsertSource from '../compose';
import loadConfig, { isExcluded } from '../config';
import {
  getDeleteEdits,
  getEdits,
} from '../edit';
import {
  getUnusedIds,
  parseSource,
} from '../parser';
import sortImports from '../sort';

export default function sortImportsBeforeSavingDocument(event: TextDocumentWillSaveEvent) {
  const { document } = event;
  if (!isSupported(document)) return;

  const { uri: fileUri, languageId } = document;
  const { fsPath: fileName } = fileUri;
  try {
    const { config, tsConfig } = loadConfig(fileUri, languageId);
    if (!config.formatOnSave) return;
    if (isExcluded(fileName, config)) return;

    const sourceText = document.getText();
    const sourceFile = ts.createSourceFile(fileName, sourceText, ScriptTarget.Latest);
    const { importNodes, allIds, insertPoint } = parseSource(sourceFile, sourceText);
    if (!insertPoint || !importNodes.length) return;
    const { range: insertRange } = insertPoint;

    const unusedIds = getUnusedIds(fileName, sourceFile, sourceText, tsConfig);
    const { deleteEdits, insertPos } = getDeleteEdits(importNodes, insertRange, config);
    const groups = sortImports(importNodes, allIds, unusedIds, config);
    const { pos, leadingNewLines, trailingNewLines } = insertPos;
    const insertSource = composeInsertSource(groups, config, leadingNewLines, trailingNewLines);
    const edits = getEdits(deleteEdits, insertSource, pos);
    event.waitUntil(edits);
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
