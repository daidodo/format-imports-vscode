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
  getInsertLine,
  parseSource,
} from '../parser';
import sortImports from '../sort';
import { assertNonNull } from '../utils';

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
    const { insertLine, isFileDisabled } = getInsertLine(sourceFile, sourceText);
    if (isFileDisabled) return;
    assertNonNull(insertLine);
    const { allIds, importNodes } = parseSource(sourceText, sourceFile);
    if (!importNodes.length) return;
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
  const SUPPORTED = new Set(['typescript', 'typescriptreact', 'javascript', 'javascriptreact']);
  return SUPPORTED.has(document.languageId);
}

function isExcluded(fileName: string, config: Configuration) {
  const { exclude } = config;
  for (const p of exclude ?? []) if (new RegExp(p).test(fileName)) return true;
  return false;
}
