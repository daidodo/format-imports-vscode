// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { ExtensionContext, workspace, window } from 'vscode';

import sortImportsBeforeSavingDocument from './main';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: ExtensionContext) {
  window.showInformationMessage('TS Import Sorter: activating.');
  const beforeSave = workspace.onWillSaveTextDocument(event =>
    sortImportsBeforeSavingDocument(event),
  );
  context.subscriptions.push(beforeSave);
  window.showInformationMessage('TS Import Sorter: activated.');
}

// this method is called when your extension is deactivated
// export function deactivate() {}
