/* eslint-disable @typescript-eslint/no-unsafe-call */

import log4js, {
  AppenderModule,
  LoggingEvent,
} from 'log4js';
import { OutputChannel } from 'vscode';

import { projectRoot } from './env';

export function initLog(channel: OutputChannel) {
  return log4js
    .configure({
      appenders: {
        vscChannel: {
          type: getAppenderModule(channel),
          layoutNormal: {
            type: 'basic',
          },
        },
      },
      categories: { default: { appenders: ['vscChannel'], level: 'info' } },
    })
    .getLogger();
}

export function uninitLog() {
  log4js.shutdown();
}

export function logger(category?: string) {
  return log4js.getLogger(category);
}

function getAppenderModule(channel: OutputChannel): AppenderModule {
  return {
    configure(config: any, layouts: any) {
      const { layoutNormal: n, timezoneOffset } = config;
      const { layout: getLayout, basicLayout } = layouts;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const normalLayout = getLayout(n.type, n) ?? basicLayout;
      return (event: LoggingEvent) => {
        const msg = normalLayout(event, timezoneOffset);
        channel.appendLine(stripInfo(msg));
      };
    },
  };
}

/**
 * Strip sensitive info in stack trace message.
 */
function stripInfo(msg: string) {
  const rootPath = projectRoot();
  const reg = new RegExp(rootPath, 'g');
  // TODO: Remove the hack.
  return msg ? msg : msg.replace(reg, 'Project');
}
