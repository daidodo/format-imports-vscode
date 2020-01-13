import {
  Position,
  Range,
  TextEdit,
} from 'vscode';

import {
  ImportNode,
  LineRange,
  RangeAndEmptyLines,
} from '../parser';

export function getDeleteEdits(nodes: ImportNode[]) {
  const ranges = nodes.map(n => n.rangeAndEmptyLines);
  const merged = mergeRanges(ranges);
  return merged
    .map(decideRange)
    .map(({ startLine, endLine }) =>
      TextEdit.delete(
        new Range(
          new Position(startLine.line, startLine.character),
          new Position(endLine.line, endLine.character),
        ),
      ),
    );
}

function mergeRanges(ranges: RangeAndEmptyLines[]) {
  const merged: RangeAndEmptyLines[] = [];
  ranges.forEach(range => {
    if (!merged.length) merged.push(range);
    const last = merged[merged.length - 1];
    if (
      last.endLine.line + last.trailingEmptyLines + 1 >=
      range.startLine.line - range.leadingEmptyLines
    ) {
      last.endLine = range.endLine;
      last.trailingEmptyLines = range.trailingEmptyLines;
    } else merged.push(range);
  });
  return merged;
}

function decideRange(range: RangeAndEmptyLines): LineRange {
  const { leadingEmptyLines, trailingEmptyLines, startLine: declStart, endLine: declEnd } = range;
  const fullStart = declStart.line - leadingEmptyLines;
  const fullEnd = declEnd.line + trailingEmptyLines;
  // Preserve one empty line between prev. and next statements if there were empty line(s).
  const startLine = !leadingEmptyLines
    ? declStart
    : { line: fullStart ? fullStart + 1 : 0, character: 0 };
  const endLine = !trailingEmptyLines
    ? declEnd
    : leadingEmptyLines || !fullStart
    ? { line: fullEnd, character: 0 }
    : { line: fullEnd - 1, character: 0 };
  return { startLine, endLine };
}
