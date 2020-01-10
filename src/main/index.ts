import {
  TextDocument,
  TextDocumentWillSaveEvent,
} from 'vscode';

// import {
//   ImportSorterConfig,
//   ImportSorterConfigLoader,
// } from '../config';
import { ImportParser } from '../parser';

export class ImportSorterExtension {
  // private _configLoader?: ImportSorterConfigLoader;

  // get config(): ImportSorterConfig {
  //   if (!this._configLoader) {
  //     this._configLoader = new ImportSorterConfigLoader();
  //   }
  //   return this._configLoader.config;
  // }

  sortImportsBeforeSavingDocument(event: TextDocumentWillSaveEvent) {
    const { document } = event;
    if (!this.isSupported(document)) return;

    const sourceText = document.getText();
    const { fsPath: fileName } = document.uri;
    const parser = new ImportParser(sourceText, fileName);
  }

  private isSupported(document: TextDocument) {
    const { languageId } = document;
    return languageId === 'typescript' || languageId === 'typescriptreact';
  }
}
