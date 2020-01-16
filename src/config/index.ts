import { readFileSync } from 'fs';
import {
  cloneDeep,
  merge,
} from 'lodash';
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

export default function loadConfig(fileUri: Uri) {
  const config = workspaceConfig(fileUri);
  merge(config, packageConfig(fileUri));
  merge(config, fileConfig(config.configurationFileName ?? '', fileUri));
  return config;
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
  if (!packageFile) return;
  const { importSorter: config } = JSON.parse(readFileSync(packageFile, 'utf8'));
  return config as Configuration;
}

function fileConfig(filename: string, fileUri: Uri) {
  const [configFile] = findFileFromPathAndParents(filename, fileUri.path);
  if (!configFile) return;
  return JSON.parse(readFileSync(configFile, 'utf8')) as Configuration;
}
