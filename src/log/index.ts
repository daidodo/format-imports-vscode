import log4js from 'log4js';
import { OutputChannel } from 'vscode';

import { getAppenderModule } from './channel';

export function initLog(channel: OutputChannel) {
  log4js.configure({
    appenders: {
      vscChannel: {
        type: getAppenderModule(channel),
        layoutNormal: {
          type: 'basic',
        },
        // layoutError: {
        //   type: 'pattern',
        //   pattern: '[%d] [%p] %c - %m (%f:%l)',
        // },
        // layoutCritical: {
        //   type: 'pattern',
        //   pattern: '[%d] [%p] %c - %m%n%s',
        // },
      },
    },
    categories: { default: { appenders: ['vscChannel'], level: 'info' } },
  });
}

export function logger(category?: string) {
  return log4js.getLogger(category);
}

export function uninitLog() {
  log4js.shutdown();
}
