import {
  TextDocument,
  TextDocumentWillSaveEvent,
} from 'vscode';

import composeInsertSource from '../compose';
import loadConfig from '../config';
import {
  getDeleteEdits,
  getEdits,
} from '../edit';
import parseSource from '../parser';
import sortImports from '../sort';

export default function sortImportsBeforeSavingDocument(event: TextDocumentWillSaveEvent) {
  const { document } = event;
  if (!isSupported(document)) return;

  const sourceText = document.getText();
  const { uri: fileUri } = document;
  const { fsPath: fileName } = fileUri;
  const { allIds, importNodes, insertLine } = parseSource(sourceText, fileName);
  const { deleteEdits, noFinalNewLine } = getDeleteEdits(importNodes, insertLine);
  const config = loadConfig(fileUri);
  const groups = sortImports(importNodes, allIds, config);
  const insertSource = composeInsertSource(groups, config, noFinalNewLine);
  const edits = getEdits(deleteEdits, insertSource, insertLine.line);
  event.waitUntil(edits);
  const newSource = event.document.getText();
  console.log('newSource: ', newSource);
}

function isSupported(document: TextDocument) {
  const { languageId } = document;
  return languageId === 'typescript' || languageId === 'typescriptreact';
}
