import ts, { ScriptTarget } from 'typescript';

import { logger } from '../../common';
import {
  AllConfig,
  Configuration,
} from '../../config';
import {
  ComposeConfig,
  configForCompose,
  translateESLintConfig,
} from '../config';
import { ESLintConfigProcessed } from '../config/eslint';
import {
  apply,
  EditManager,
} from '../edit';
import {
  ExportNode,
  getUnusedIds,
  ImportNode,
  NameUsage,
  parseSource,
} from '../parser';
import {
  Sorter,
  sorterFromRules,
  sortExports,
  sortImports,
} from '../sort';
import { RangeAndEmptyLines } from '../types';

export function formatSource(
  fileName: string,
  sourceText: string,
  { config: originConfig, eslintConfig, tsCompilerOptions }: AllConfig,
) {
  const log = logger('parser.formatSource');
  log.info('config:', originConfig);
  log.info('eslintConfig:', eslintConfig);
  log.info('tsCompilerOptions:', tsCompilerOptions);
  const { config, processed } = translateESLintConfig(originConfig, eslintConfig);
  log.debug('Translated ESLint config to newConfig:', config);
  log.debug('ESLint config processed data:', processed);
  const sourceFile = ts.createSourceFile(fileName, sourceText, ScriptTarget.Latest);
  const { importNodes, importsInsertPoint: point, exportNodes, allIds, unhandled } = parseSource(
    sourceFile,
    sourceText,
    config,
    tsCompilerOptions,
  );
  const editManager = new EditManager([...importNodes, ...exportNodes]);
  if (editManager.empty()) return undefined;
  const composeConfig = configForCompose(config);
  log.debug('composeConfig:', composeConfig);
  const unusedIds = () =>
    getUnusedIds(allIds, importNodes, fileName, sourceFile, tsCompilerOptions);
  const sorter = sorterFromRules(config.sortRules);
  const text = formatImports(
    importNodes,
    point,
    unusedIds,
    config,
    composeConfig,
    sorter,
    processed,
  );
  if (text && point)
    editManager.insert({ range: point, text, minTrailingNewLines: composeConfig.groupEnd });
  const mustBeModule = unhandled > 0 || !!text; // If there are import/export declarations, it's must be a module.
  const edits = formatExports(exportNodes, composeConfig, sorter, mustBeModule);
  edits.forEach(e => editManager.insert(e));
  return apply(sourceText, sourceFile, editManager.generateEdits(composeConfig));
}

function formatImports(
  importNodes: ImportNode[],
  insertPoint: RangeAndEmptyLines | undefined,
  unusedIds: () => NameUsage,
  config: Configuration,
  composeConfig: ComposeConfig,
  sorter: Sorter,
  eslintProcessed?: ESLintConfigProcessed,
) {
  if (!insertPoint || !importNodes.length) return undefined;
  const groups = sortImports(importNodes, unusedIds(), config, sorter, eslintProcessed);
  const { groupSep } = composeConfig;
  return groups.compose(composeConfig, groupSep);
}

function formatExports(
  exportNodes: ExportNode[],
  composeConfig: ComposeConfig,
  sorter: Sorter,
  mustBeModule: boolean,
) {
  if (!exportNodes.length) return [];
  const sorted = sortExports(exportNodes, sorter.compareNames);
  const filtered = sorted.filter(n => !n.empty());
  const nodes = filtered.length > 0 || mustBeModule ? filtered : decideKeep(sorted);
  return nodes.map(n => ({ range: n.range, text: n.compose(composeConfig) }));
}

/**
 * Decide which export to keep if there are multiple empty exports and no imports.
 *
 * Scenarios:
 * 1. If there are both `export {} from 'a'` and `export {}`, keep only `export {}`.
 * 1. If there are `export {} from 'a'` and `export {} from 'b'`, keep the first of them.
 */
function decideKeep(emptyNodes: ExportNode[]) {
  const noPaths = emptyNodes.filter(n => !n.hasModuleIdentifier());
  if (noPaths.length < 1) return emptyNodes.slice(0, 1);
  return noPaths.slice(noPaths.length - 1);
}
