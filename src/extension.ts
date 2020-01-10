// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import {
  ExtensionContext,
  workspace,
} from 'vscode';

import { ImportSorterExtension as ImportSorterExtensionOld } from './import-sorter-extension';
import { ImportSorterExtension } from './main';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: ExtensionContext) {
  {
    const importSorterExtension = new ImportSorterExtensionOld();
    const beforeSave = workspace.onWillSaveTextDocument(event =>
      importSorterExtension.sortModifiedDocumentImportsFromOnBeforeSaveCommand(event),
    );
    context.subscriptions.push(beforeSave);
  }
  {
    const extension = new ImportSorterExtension();
    const beforeSave = workspace.onWillSaveTextDocument(event =>
      extension.sortImportsBeforeSavingDocument(event),
    );
    context.subscriptions.push(beforeSave);
  }
}

// this method is called when your extension is deactivated
// eslint-disable-next-line @typescript-eslint/no-empty-function
export function deactivate() {}
