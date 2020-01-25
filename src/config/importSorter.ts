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
import { loadEcConfig } from './editorconfig';
import { merge } from './helper';
import { loadPretConfig } from './prettier';
import { Configuration } from './types';
import { loadVscConfig } from './vscode';

export function loadIsConfig(fileUri: Uri, languageId: string) {
  const { path: fileName } = fileUri;
  const wsConfig = workspaceConfig(fileUri);
  const vscConfig = loadVscConfig(fileUri, languageId);
  const ecConfig = loadEcConfig(fileName);
  const pretConfig = loadPretConfig(fileName);
  const fConfig = fileConfig(wsConfig.configurationFileName, fileName);
  const pkgConfig = packageConfig(fileName);
  return merge(wsConfig, vscConfig, ecConfig, pretConfig, fConfig, pkgConfig);
}

function workspaceConfig(fileUri: Uri) {
  const config = workspace
    .getConfiguration('tsImportSorter', fileUri)
    .get<Configuration>('configuration');
  assertNonNull(config, 'Missing configuration in workspace.');
  return cloneDeep(config);
}

function packageConfig(fileName: string) {
  const [packageFile] = findFileFromPathAndParents('package.json', fileName);
  if (!packageFile) return {};
  const { importSorter: config } = JSON.parse(fs.readFileSync(packageFile, 'utf8'));
  if (!config) return {};
  assert(isObject(config), `Bad "importSorter" config in "${packageFile}"`);
  return config as Configuration;
}

function fileConfig(filename: string | undefined, path: string) {
  if (!filename) return {};
  const [configFile] = findFileFromPathAndParents(filename, path);
  if (!configFile) return {};
  const config = JSON.parse(fs.readFileSync(configFile, 'utf8'));
  assert(isObject(config), `Bad config in "${configFile}"`);
  return config as Configuration;
}
