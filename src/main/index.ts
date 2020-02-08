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
  parseSource,
} from '../parser';
import sortImports from '../sort';

export default function formatSource(
  fileName: string,
  sourceText: string,
  config: Configuration = {},
  tsConfig: TranspileOptions = {},
) {
  const sourceFile = ts.createSourceFile(fileName, sourceText, ScriptTarget.Latest);
  const { importNodes, allIds, insertPoint } = parseSource(sourceFile, sourceText);
  if (!insertPoint || !importNodes.length) return;
  const { range: insertRange } = insertPoint;

  const composeConfig = configForCompose(config);
  const unusedIds = getUnusedIds(fileName, sourceFile, sourceText, tsConfig);
  const { deleteEdits, insertPos } = getDeleteEdits(importNodes, insertRange, composeConfig);
  const groups = sortImports(importNodes, allIds, unusedIds, config);
  const insertSource = composeInsertSource(groups, insertPos, composeConfig);
  const edits = getEdits(deleteEdits, insertSource, insertPos.pos);

  return apply(sourceText, sourceFile, edits);
}
