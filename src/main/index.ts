import {
  TextDocument,
  TextDocumentWillSaveEvent,
} from 'vscode';

import { getDeleteEdits } from '../edit';
// import {
//   ImportSorterConfig,
//   ImportSorterConfigLoader,
// } from '../config';
import parseImportNodes from '../parser';

export class ImportSorterExtension {
  sortImportsBeforeSavingDocument(event: TextDocumentWillSaveEvent) {
    const { document } = event;
    if (!this.isSupported(document)) return;

    const sourceText = document.getText();
    const { fsPath: fileName } = document.uri;
    const { allIdentifiers, importNodes, insertLine } = parseImportNodes(sourceText, fileName);
    const deleteEdits = getDeleteEdits(importNodes);
    console.log('deleteEdits: ', deleteEdits);
  }

  private isSupported(document: TextDocument) {
    const { languageId } = document;
    return languageId === 'typescript' || languageId === 'typescriptreact';
  }
}
