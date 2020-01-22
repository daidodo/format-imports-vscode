import { sep } from 'path';
import ts, { sys } from 'typescript';
import { workspace } from 'vscode';

import { isRegularFile } from '../utils';

export function loadTsConfig() {
  const configFile = `${workspace.rootPath}${sep}tsconfig.json`;
  if (!isRegularFile(configFile)) return {};
  const { config } = ts.readConfigFile(configFile, sys.readFile.bind(sys));
  return config ?? {};
}
