import fs from 'fs';

import {
  assert,
  logger,
} from '../common';
import {
  findFileFromPathAndParents,
  mergeConfig,
} from './helper';
import { loadPretConfig } from './prettier';
import { Configuration } from './types';

export function loadImportSorterConfig(config: Configuration, sourceFileName: string) {
  const log = logger('config.loadImportSorterConfig');
  const { configurationFileName: cfgFileName } = config;
  log.debug('Load Prettier/EditorConfig config.');
  const pretConfig = loadPretConfig(sourceFileName);
  log.debug('Load import-sorter config from', cfgFileName);
  const fConfig = fileConfig(cfgFileName, sourceFileName);
  log.debug('Load package.json config.');
  const pkgConfig = packageConfig(sourceFileName);
  return mergeConfig(config, pretConfig, fConfig, pkgConfig);
}

function packageConfig(fileName: string) {
  const [packageFile] = findFileFromPathAndParents('package.json', fileName);
  if (!packageFile) return {};
  const { importSorter: config } = JSON.parse(fs.readFileSync(packageFile, 'utf8'));
  if (!config) return {};
  assert(isObject(config), `Bad "importSorter" config in "${packageFile}"`);
  return config as Configuration;
}

// Exported for testing purpose
export function fileConfig(filename: string | undefined, path?: string) {
  if (!filename) return {};
  const [configFile] = findFileFromPathAndParents(filename, path);
  if (!configFile) return {};
  const config = JSON.parse(fs.readFileSync(configFile, 'utf8'));
  assert(isObject(config), `Bad config in "${configFile}"`);
  return config as Configuration;
}

function isObject(v: any) {
  return typeof v === 'object' && !Array.isArray(v) && v !== null;
}
