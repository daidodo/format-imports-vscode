/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import os from 'os';
import path from 'path';
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
  const items = vscode.extensions.all.map(({ id, packageJSON }) => {
    const { displayName, version, isBuiltin } = packageJSON;
    const idv = `${id}@${version}`;
    const desc = displayName ? `${displayName} (${idv})` : idv;
    return { isBuiltin, desc };
  });
  return {
    builtIn: items.filter(i => i.isBuiltin).map(i => i.desc),
    installed: items.filter(i => !i.isBuiltin).map(i => i.desc),
  };
}

export function workspacesInfo() {
  return {
    rootPaths: vscode.workspace.workspaceFolders?.map(f => f.uri.path),
  };
}

const PROJECT_ROOT = path.resolve(__dirname, '../..').replace(/\\/g, '\\\\');

export function projectRoot() {
  return PROJECT_ROOT;
}
