import ts, {
  ScriptTarget,
  TranspileOptions,
} from 'typescript';

import {
  ComposeConfig,
  configForCompose,
  Configuration,
} from '../config';
import {
  apply,
  getEditsForExports,
  getEditsForImports,
} from '../edit';
import {
  ExportNode,
  getUnusedIds,
  ImportNode,
  InsertNodeRange,
  parseSource,
  UnusedId,
} from '../parser';
import {
  Sorter,
  sortExports,
  sortImports,
} from '../sort';

export default function formatSource(
  fileName: string,
  sourceText: string,
  config: Configuration = {},
  tsConfig: TranspileOptions = {},
) {
  const sourceFile = ts.createSourceFile(fileName, sourceText, ScriptTarget.Latest);
  const unusedIds = () => getUnusedIds(fileName, sourceFile, sourceText, tsConfig);
  const { importNodes, importsInsertPoint, exportNodes } = parseSource(
    sourceFile,
    sourceText,
    config,
  );
  const { edits, sorter, composeConfig } = formatImports(
    importNodes,
    importsInsertPoint,
    unusedIds,
    config,
  );
  formatExports(exportNodes, config, sorter, composeConfig);
  return apply(sourceText, sourceFile, edits);
}

function formatImports(
  importNodes: ImportNode[],
  insertPoint: { range?: InsertNodeRange } | undefined,
  unusedIds: () => UnusedId[],
  config: Configuration,
) {
  if (!insertPoint || !importNodes.length) return { edits: [] };
  const composeConfig = configForCompose(config);
  const { groups, sorter } = sortImports(importNodes, unusedIds(), config);
  const edits = getEditsForImports(importNodes, groups, composeConfig, insertPoint.range);
  return { edits, sorter, composeConfig };
}

function formatExports(
  exportNodes: ExportNode[],
  config: Configuration,
  sorter?: Sorter,
  composeConfig?: ComposeConfig,
) {
  if (!exportNodes.length) return [];
  sortExports(exportNodes, config, sorter);
  return getEditsForExports(exportNodes, composeConfig ?? configForCompose(config));
}
