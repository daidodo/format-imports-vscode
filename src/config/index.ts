import { readFileSync } from 'fs';
import cloneDeep from 'lodash.clonedeep';
import {
  Uri,
  workspace,
} from 'vscode';

import {
  assertNonNull,
  findFileFromPathAndParents,
} from '../utils';
import { Configuration } from './types';

export { Configuration };

export default function loadConfig(fileUri: Uri): Configuration {
  const wsConfig = workspaceConfig(fileUri);
  const { configurationFileName: fname } = wsConfig;
  const fConfig = fileConfig(fname, fileUri);
  const pkgConfig = packageConfig(fileUri);
  return merge(wsConfig, fConfig, pkgConfig);
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
  const { importSorter: config } = JSON.parse(readFileSync(packageFile, 'utf8'));
  return config as Configuration;
}

function fileConfig(filename: string | undefined, fileUri: Uri) {
  if (!filename) return {};
  const [configFile] = findFileFromPathAndParents(filename, fileUri.path);
  if (!configFile) return {};
  return JSON.parse(readFileSync(configFile, 'utf8')) as Configuration;
}

function merge(...configs: Configuration[]) {
  return configs.reduce((a, b) => {
    const { exclude: e1 } = a;
    const { exclude: e2 } = b;
    const exclude = !e1 ? e2 : !e2 ? e1 : [...e1, ...e2];
    return { ...a, ...b, exclude };
  });
}
