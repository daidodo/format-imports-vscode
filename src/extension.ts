// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import {
  ExtensionContext,
  workspace,
} from 'vscode';

import { ImportSorterExtension } from './import-sorter-extension';

console.log("Extension activated!");
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: ExtensionContext) {
  const importSorterExtension = new ImportSorterExtension();

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  // let helloCmd = vscode.commands.registerCommand("extension.helloWorld", () => {
  //   // The code you place here will be executed every time your command is executed

  //   // Display a message box to the user
  //   vscode.window.showErrorMessage("Hello, DoZerg!");
  // });

  // let greetCmd = vscode.commands.registerCommand("extension.greet", () => {
  //   // The code you place here will be executed every time your command is executed

  //   // Display a message box to the user
  //   vscode.window.showErrorMessage("Greetings, DoZerg!");
  // });

  const onWillSaveTextDocument = workspace.onWillSaveTextDocument(event =>
    importSorterExtension.sortModifiedDocumentImportsFromOnBeforeSaveCommand(
      event
    )
  );

  context.subscriptions.push(onWillSaveTextDocument);
}

// this method is called when your extension is deactivated
// eslint-disable-next-line @typescript-eslint/no-empty-function
export function deactivate() {}
