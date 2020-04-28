import ts, {
  ScriptTarget,
  TranspileOptions,
} from 'typescript';

import composeInsertSource from '../compose';
import {
  configForCompose,
  Configuration,
} from '../config';
import {
  apply,
  getDeleteEdits,
  getEdits,
} from '../edit';
import {
  getUnusedIds,
  ImportNode,
  InsertNodeRange,
  parseSource,
  UnusedId,
} from '../parser';
import ExportNode from '../parser/ExportNode';
import sortImports from '../sort';

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
  const edits = [
    ...formatImports(importNodes, importsInsertPoint, unusedIds, config),
    ...formatExports(exportNodes, config),
  ];
  return apply(sourceText, sourceFile, edits);
}

function formatImports(
  importNodes: ImportNode[],
  insertPoint: { range?: InsertNodeRange } | undefined,
  unusedIds: () => UnusedId[],
  config: Configuration,
) {
  if (!insertPoint || !importNodes.length) return [];
  const composeConfig = configForCompose(config);
  const { range: insertRange } = insertPoint;
  const { deleteEdits, insertPos } = getDeleteEdits(importNodes, insertRange, composeConfig);
  const groups = sortImports(importNodes, unusedIds(), config);
  const insertSource = composeInsertSource(groups, insertPos, composeConfig);
  return getEdits(deleteEdits, insertSource, insertPos);
}

function formatExports(exportNodes: ExportNode[], config: Configuration) {
  // TODO
  return [];
}
