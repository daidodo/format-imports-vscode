import ts, { sys } from 'typescript';

import { parentFolder } from './helper';

export function loadTsConfig(fileName: string) {
  const configFile = ts.findConfigFile(fileName, sys.fileExists.bind(sys));
  if (!configFile) return undefined;
  const { config } = ts.readConfigFile(configFile, sys.readFile.bind(sys));
  const path = parentFolder(configFile);
  const { options } = ts.parseJsonConfigFileContent(config, sys, path);
  return options;
}
