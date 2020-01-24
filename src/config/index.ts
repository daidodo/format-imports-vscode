import { Uri } from 'vscode';

import { loadIsConfig } from './importSorter';
import { loadTsConfig } from './tsconfig';
import { Configuration } from './types';

export { Configuration };

export default function loadConfig(fileUri: Uri, languageId:string) {
  const config = loadIsConfig(fileUri, languageId);
  const tsConfig = loadTsConfig();
  return { config, tsConfig };
}

export function isExcluded(fileName: string, config: Configuration) {
  const { exclude } = config;
  for (const p of exclude ?? []) if (new RegExp(p).test(fileName)) return true;
  return false;
}
