import { LineAndCharacter } from 'typescript';
import {
  Position,
  Range,
  TextEdit,
} from 'vscode';

import {
  ImportNode,
  InsertLine,
  RangeAndEmptyLines,
} from '../parser';

// eslint-disable-next-line @typescript-eslint/require-await
export async function getEdits(edits: TextEdit[], insertText: string, insertLine: number) {
  const insertEdit = TextEdit.insert(new Position(insertLine, 0), insertText);
  return [...edits, insertEdit];
}

export function getDeleteEdits(nodes: ImportNode[], insertLine: InsertLine) {
  const ranges = nodes.map(n => n.rangeAndEmptyLines);
  const merged = mergeRanges(ranges);
  const { line, leadingNewLines } = insertLine;
  const insert = { line, character: 0 };
  let noFinalNewLine = false;
  const deleteEdits = merged.map(decideRange).map(({ start, end, emptyLines }) => {
    if (compare(start, insert) <= 0) noFinalNewLine = leadingNewLines < 2 && emptyLines > 0;
    return TextEdit.delete(
      new Range(new Position(start.line, start.character), new Position(end.line, end.character)),
    );
  });
  return { deleteEdits, noFinalNewLine };
}

function mergeRanges(ranges: RangeAndEmptyLines[]) {
  const merged: RangeAndEmptyLines[] = [];
  ranges
    .sort((a, b) => a.start.pos - b.start.pos)
    .forEach(cur => {
      if (!merged.length) merged.push(cur);
      else {
        const last = merged[merged.length - 1];
        if (last.end.pos >= cur.fullStart.pos) {
          last.end = cur.end;
          last.trailingNewLines = cur.trailingNewLines;
          last.fullEnd = cur.fullEnd;
          last.eof = cur.eof;
        } else merged.push(cur);
      }
    });
  return merged;
}

/**
 *
 * @returns
 *    * start: Start position to delete.
 *    * end: End position to delete.
 *    * emptyLines: Empty lines preserved after deletion.
 */
function decideRange(
  range: RangeAndEmptyLines,
): { start: LineAndCharacter; end: LineAndCharacter; emptyLines: number } {
  const {
    fullStart,
    leadingNewLines,
    start: cmStart,
    trailingNewLines,
    end: cmEnd,
    fullEnd,
    eof,
  } = range;
  // No empty lines if there are no prev statements/comments.
  if (!fullStart.pos) return { start: fullStart, end: fullEnd, emptyLines: 0 };
  // Preserve one empty line between prev and next (if any) statements if there were empty line(s).
  if (!leadingNewLines) {
    const start = fullStart;
    const ends = eof
      ? [cmEnd, cmEnd, { line: fullEnd.line - 1, character: 0 }]
      : [cmEnd, cmEnd, cmEnd, { line: fullEnd.line - 2, character: 0 }];
    const empties = eof ? [0, 1] : [0, 0, 1];
    const end = ends[Math.min(trailingNewLines, ends.length - 1)];
    const emptyLines = empties[Math.min(trailingNewLines, empties.length - 1)];
    return { start, end, emptyLines };
  } else if (leadingNewLines === 1) {
    const start = cmStart;
    const ends = eof ? [fullEnd] : [fullEnd, cmEnd, { line: fullEnd.line - 1, character: 0 }];
    const end = ends[Math.min(trailingNewLines, ends.length - 1)];
    return { start, end, emptyLines: eof || trailingNewLines > 0 ? 1 : 0 };
  } else if (leadingNewLines === 2) {
    const start = eof ? { line: cmStart.line - 1, character: 0 } : cmStart;
    return { start, end: fullEnd, emptyLines: 1 };
  } else {
    const start = { line: fullStart.line + (eof ? 1 : 2), character: 0 };
    return { start, end: fullEnd, emptyLines: 1 };
  }
}

function compare(a: LineAndCharacter, b: LineAndCharacter) {
  const l = a.line - b.line;
  return l ? l : a.character - b.character;
}
