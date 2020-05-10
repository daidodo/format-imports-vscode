import log4js, {
  AppenderModule,
  LoggingEvent,
} from 'log4js';
import path from 'path';
import { OutputChannel } from 'vscode';

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

function getAppenderModule(channel: OutputChannel): AppenderModule {
  return {
    configure(config: any, layouts: any) {
      // const { layoutNormal: n, layoutError: e, layoutCritical: c, timezoneOffset } = config;
      const { layoutNormal: n, timezoneOffset } = config;
      const { layout: getLayout, basicLayout } = layouts;
      const normalLayout = getLayout(n.type, n) ?? basicLayout;
      // const errorLayout = getLayout(e.type, e) ?? basicLayout;
      // const criticalLayout = getLayout(c.type, c) ?? basicLayout;
      return (event: LoggingEvent) => {
        // const { level } = event;
        // const layout = level.isLessThanOrEqualTo('info')
        //   ? normalLayout
        //   : level.isLessThanOrEqualTo('error')
        //   ? errorLayout
        //   : criticalLayout;
        // const msg = layout(event, timezoneOffset);
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
  const rootPath = path.resolve(__dirname, '../..').replace(/\\/g, '\\\\');
  const reg = new RegExp(rootPath, 'g');
  return msg.replace(reg, 'Project');
}
