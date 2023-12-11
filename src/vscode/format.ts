import {
  formatSourceFromFile,
  isFileExcludedByConfig,
} from 'format-imports';
import { URLSearchParams } from 'url';
import {
  commands,
  TextDocument,
  Uri,
  window,
} from 'vscode';

import { vscChannel } from './channel';
import { resolveConfig } from './config';
import { logger } from './log';
import { TriggeredFrom } from './types';

const ISSUE_URL =
  'https://github.com/daidodo/format-imports-vscode/issues/new?assignees=&labels=&template=exception_report.md&';

export async function formatDocument(document: TextDocument, from: TriggeredFrom) {
  const log = logger('vscode.formatDocument');
  if (!isSupported(document)) return undefined;
  const { uri: fileUri, languageId, eol } = document;
  const { fsPath: fileName } = fileUri;
  log.debug('Triggered from:', from);
  try {
    const config = await resolveConfig(fileUri, languageId, eol, from === 'onCommand');
    if (from === 'onSave' && config.autoFormat !== 'onSave') {
      log.info('Auto format is', config.autoFormat);
      return undefined;
    }
    if (isFileExcludedByConfig(fileName, config)) {
      const { exclude, excludeGlob } = config;
      log.info('Excluded fileName:', fileName, 'via config:', { exclude, excludeGlob });
      return undefined;
    }
    const sourceText = document.getText();
    const newText = await formatSourceFromFile(sourceText, fileName, config);
    log.info('Finished', newText === undefined ? 'format with no-op' : 'format');
    return newText;
  } catch (e: unknown) {
    log.error('Found exception:', e);
    void window
      .showErrorMessage(
        'Something is wrong. Please open the logs and report an issue.',
        'Open logs & report an issue',
      )
      .then(v => {
        if (!v) return;
        vscChannel.show();
        const p = new URLSearchParams({
          title: `Exception: ${e instanceof Error ? e.message : e}`,
        });
        void commands.executeCommand('vscode.open', Uri.parse(ISSUE_URL + p.toString()));
      });
  }
  return undefined;
}

export const SUPPORTED_LANGUAGE_IDS = [
  'typescript',
  'typescriptreact',
  'javascript',
  'javascriptreact',
  'vue',
];

function isSupported(document: TextDocument) {
  return SUPPORTED_LANGUAGE_IDS.includes(document.languageId);
}
