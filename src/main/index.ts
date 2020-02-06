import ts, {
  ScriptTarget,
  TranspileOptions,
} from 'typescript';

import composeInsertSource from '../compose';
import { Configuration } from '../config';
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

  const unusedIds = getUnusedIds(fileName, sourceFile, sourceText, tsConfig);
  const { deleteEdits, insertPos } = getDeleteEdits(importNodes, insertRange, config);
  const groups = sortImports(importNodes, allIds, unusedIds, config);
  const { pos, leadingNewLines, trailingNewLines } = insertPos;
  const insertSource = composeInsertSource(groups, config, leadingNewLines, trailingNewLines);
  const edits = getEdits(deleteEdits, insertSource, pos);

  return apply(sourceText, sourceFile, edits);
}
