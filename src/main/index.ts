import {
  TextDocument,
  TextDocumentWillSaveEvent,
} from 'vscode';

import composeInsertSource from '../compose';
import loadConfig from '../config';
import { getDeleteEdits } from '../edit';
import parseSource from '../parser';
import sortImports from '../sort';

export class ImportSorterExtension {
  sortImportsBeforeSavingDocument(event: TextDocumentWillSaveEvent) {
    const { document } = event;
    if (!this.isSupported(document)) return;

    const sourceText = document.getText();
    const { uri: fileUri } = document;
    const { fsPath: fileName } = fileUri;
    const { allIdentifiers, importNodes, insertLine } = parseSource(sourceText, fileName);
    const deleteEdits = getDeleteEdits(importNodes);
    const config = loadConfig(fileUri);
    const groups = sortImports(importNodes, allIdentifiers, config);
    const insertSource = composeInsertSource(groups, config);
    console.log('deleteEdits: ', deleteEdits);
  }

  private isSupported(document: TextDocument) {
    const { languageId } = document;
    return languageId === 'typescript' || languageId === 'typescriptreact';
  }
}
