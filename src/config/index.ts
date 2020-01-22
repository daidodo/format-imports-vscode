import fs from 'fs';
import cloneDeep from 'lodash.clonedeep';
import {
  Uri,
  workspace,
} from 'vscode';

import {
  assert,
  assertNonNull,
  findFileFromPathAndParents,
  isObject,
} from '../utils';
import { loadTsConfig } from './tsconfig';
import { Configuration } from './types';

export { Configuration };

export default function loadConfig(fileUri: Uri) {
  const wsConfig = workspaceConfig(fileUri);
  const { configurationFileName: fname } = wsConfig;
  const fConfig = fileConfig(fname, fileUri);
  const pkgConfig = packageConfig(fileUri);
  const tsConfig = loadTsConfig();
  return { config: merge(wsConfig, fConfig, pkgConfig), tsConfig };
}

function workspaceConfig(fileUri: Uri) {
  const config = workspace
    .getConfiguration('tsImportSorter', fileUri)
    .get<Configuration>('configuration');
  assertNonNull(config, 'Missing configuration for workspace.');
  return cloneDeep(config);
}

function packageConfig(fileUri: Uri) {
  const [packageFile] = findFileFromPathAndParents('package.json', fileUri.path);
  if (!packageFile) return {};
  const { importSorter: config } = JSON.parse(fs.readFileSync(packageFile, 'utf8'));
  if (!config) return {};
  assert(isObject(config), `Bad "importSorter" config in "${packageFile}"`);
  return config as Configuration;
}

function fileConfig(filename: string | undefined, fileUri: Uri) {
  if (!filename) return {};
  const [configFile] = findFileFromPathAndParents(filename, fileUri.path);
  if (!configFile) return {};
  const config = JSON.parse(fs.readFileSync(configFile, 'utf8'));
  assert(isObject(config), `Bad config in "${configFile}"`);
  return config as Configuration;
}

function merge(...configs: Configuration[]) {
  return configs.reduce((a, b) => {
    const { exclude: e1 } = a;
    const { exclude: e2 } = b;
    const exclude = !e1 ? e2 : !e2 ? e1 : [...e1, ...e2];
    return { ...a, ...b, exclude };
  });
}
