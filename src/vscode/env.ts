import os from 'os';
import vscode from 'vscode';

export function osInfo() {
  return {
    arch: os.arch(),
    platform: os.platform(),
    type: os.type(),
    release: os.release(),
    totalmem: os.totalmem(),
    freemem: os.freemem(),
    EOL: os.EOL,
  };
}

export function vscodeInfo() {
  return { version: vscode.version };
}

export function extensionsInfo() {
  return vscode.extensions.all.map(e => ({
    displayName: e.packageJSON.displayName,
    id: e.id,
    version: e.packageJSON.version,
  }));
}

export function workspacesInfo() {
  return {
    rootPaths: vscode.workspace.workspaceFolders?.map(f => f.uri.path),
  };
}
