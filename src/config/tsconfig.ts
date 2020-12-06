import ts, { sys } from 'typescript';

import { logger } from '../common';
import { parentFolder } from './helper';

export function loadTsConfig(fileName: string) {
  const log = logger('config.loadTsConfig');
  log.debug('Find TS config for fileName:', fileName);
  try {
    const configFile = ts.findConfigFile(fileName, sys.fileExists.bind(sys));
    if (!configFile) return undefined;
    log.debug('Load TS config for fileName:', fileName);
    const { config } = ts.readConfigFile(configFile, sys.readFile.bind(sys));
    const path = parentFolder(configFile);
    const { options } = ts.parseJsonConfigFileContent(config, sys, path);
    return options;
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : `${e}`;
    log.warn('Failed loading TS config:', msg);
    return undefined;
  }
}
