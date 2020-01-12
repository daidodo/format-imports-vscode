import {
  Position,
  Range,
  TextEdit,
} from 'vscode';

import {
  ImportNode,
  LineRange,
} from '../parser';

interface RangeAndEmptyLines extends LineRange {
  leadingEmptyLines: number;
  trailingEmptyLines: number;
}

export function getDeleteEdits(sourceText: string, nodes: ImportNode[]) {
  const sourceLines = sourceText.split(/\r?\n/).map(s => s.trimRight());
  const ranges = getRanges(sourceLines, nodes);
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

function getRanges(sourceLines: string[], nodes: ImportNode[]): RangeAndEmptyLines[] {
  return nodes
    .map(n => {
      const { lineRange } = n;
      return {
        ...lineRange,
        leadingEmptyLines: leadingEmptyLines(sourceLines, lineRange.startLine.line),
        trailingEmptyLines: trailingEmptyLines(sourceLines, lineRange.endLine.line),
      };
    })
    .sort((a, b) => a.startLine.line - b.startLine.line);
}

function leadingEmptyLines(sourceLines: string[], index: number) {
  let i = index - 1;
  for (; i >= 0 && !sourceLines[i]; --i);
  return index - i - 1;
}

function trailingEmptyLines(sourceLines: string[], index: number) {
  let i = index + 1;
  for (; i < sourceLines.length && !sourceLines[i]; ++i);
  return i - index - 1;
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
