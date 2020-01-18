import { LineAndCharacter } from 'typescript';
import {
  Position,
  Range,
  TextEdit,
} from 'vscode';

import {
  ImportNode,
  RangeAndEmptyLines,
} from '../parser';

// eslint-disable-next-line @typescript-eslint/require-await
export async function getEdits(edits: TextEdit[], insertText: string, insertLine: number) {
  const insertEdit = TextEdit.insert(new Position(insertLine, 0), insertText);
  return [...edits, insertEdit];
}

export function getDeleteEdits(nodes: ImportNode[]) {
  const ranges = nodes.map(n => n.rangeAndEmptyLines);
  const merged = mergeRanges(ranges);
  return merged
    .map(decideRange)
    .map(({ start, end }) =>
      TextEdit.delete(
        new Range(new Position(start.line, start.character), new Position(end.line, end.character)),
      ),
    );
}

function mergeRanges(ranges: RangeAndEmptyLines[]) {
  const merged: RangeAndEmptyLines[] = [];
  ranges.forEach(cur => {
    if (!merged.length) merged.push(cur);
    const last = merged[merged.length - 1];
    if (last.end >= cur.fullStart) {
      last.end = cur.end;
      last.trailingNewLines = cur.trailingNewLines;
      last.fullEnd = cur.fullEnd;
      last.eof = cur.eof;
    } else merged.push(cur);
  });
  return merged;
}

function decideRange(
  range: RangeAndEmptyLines,
): { start: LineAndCharacter; end: LineAndCharacter } {
  const {
    fullStart,
    leadingNewLines,
    start: cmStart,
    trailingNewLines,
    end: cmEnd,
    fullEnd,
    eof,
  } = range;
  if (!fullStart.pos) return { start: fullStart, end: fullEnd };
  // Preserve one empty line between prev and next statements if there were empty line(s).
  if (!leadingNewLines) {
    const start = fullStart;
    const ends = eof
      ? [cmEnd, cmEnd, { line: fullEnd.line - 1, character: 0 }]
      : [cmEnd, cmEnd, cmEnd, { line: fullEnd.line - 2, character: 0 }];
    const end = ends[Math.min(trailingNewLines, ends.length - 1)];
    return { start, end };
  } else if (leadingNewLines === 1) {
    const start = cmStart;
    const end = eof || trailingNewLines < 2 ? fullEnd : { line: fullEnd.line - 1, character: 0 };
    return { start, end };
  } else if (leadingNewLines === 2) {
    const start = eof ? { line: cmStart.line - 1, character: 0 } : cmStart;
    return { start, end: fullEnd };
  } else {
    const start = { line: fullStart.line + (eof ? 1 : 2), character: 0 };
    return { start, end: fullEnd };
  }
}
