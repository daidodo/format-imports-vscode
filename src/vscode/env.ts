/* eslint-disable @typescript-eslint/no-unsafe-member-access */

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
  return vscode.extensions.all
    .filter(e => !e.packageJSON.isBuiltin)
    .map(({ id, packageJSON }) => {
      const { displayName, version } = packageJSON;
      return `${id}@${version}` + (displayName ? ` (${displayName})` : '');
    });
}

export function workspacesInfo() {
  return {
    rootPaths: vscode.workspace.workspaceFolders?.map(f => f.uri.path),
  };
}
