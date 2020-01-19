import {
  createSourceFile,
  ScriptTarget,
} from 'typescript';
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
import {
  parseSource,
  getInsertLine,
  NodeComment,
} from '../parser';
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
    const sourceFile = createSourceFile(fileName, sourceText, ScriptTarget.Latest);
    const { insertLine, fileComments } = getInsertLine(sourceFile, sourceText);
    if (isDisabled(fileComments)) return;
    const { allIds, importNodes } = parseSource(sourceText, sourceFile);
    const { deleteEdits, noFinalNewLine } = getDeleteEdits(importNodes, insertLine);
    const groups = sortImports(importNodes, allIds, config);
    const insertSource = composeInsertSource(groups, config, noFinalNewLine);
    const edits = getEdits(deleteEdits, insertSource, insertLine.line);
    event.waitUntil(edits);
  } catch (e) {
    window.showErrorMessage(
      `Error found: ${e.message}.
      If you believe this is a bug, please report on https://github.com/daidodo/tsimportsorter`,
    );
  }
}

function isSupported(document: TextDocument) {
  const { languageId } = document;
  return languageId === 'typescript' || languageId === 'typescriptreact';
}

function isExcluded(fileName: string, config: Configuration) {
  const { exclude } = config;
  for (const p of exclude ?? []) if (new RegExp(p).test(fileName)) return true;
  return false;
}

function isDisabled(comments: NodeComment[] | undefined) {
  for (const c of comments ?? []) {
    // ts-import-sorter: disable
    /* ts-import-sorter: disable */
    if (
      /^\s*\/\/\s*ts-import-sorter:\s*disable\s*$/.test(c.text) ||
      /^\s*\/\*\s*ts-import-sorter:\s*disable\s*\*\/$/.test(c.text)
    )
      return true;
  }
  return false;
}
