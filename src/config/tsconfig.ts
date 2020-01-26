import ts, { sys } from 'typescript';

import { findFileFromPathAndParents } from '../utils';

export function loadTsConfig(fileName: string) {
  const [configFile] = findFileFromPathAndParents('tsconfig.json', fileName);
  if (!configFile) return {};
  const { config } = ts.readConfigFile(configFile, sys.readFile.bind(sys));
  return config ?? {};
}
