import { LineAndCharacter } from 'typescript';
import {
  Position,
  Range,
  TextEdit,
} from 'vscode';

import { Configuration } from '../config';
import {
  ImportNode,
  InsertRange,
  LineRange,
  RangeAndEmptyLines,
} from '../parser';

export { apply } from './apply';

interface InsertPos {
  pos: LineAndCharacter;
  leadingNewLines: number;
  trailingNewLines: number;
}

export function getEdits(edits: TextEdit[], insertText: string, pos: LineAndCharacter) {
  const insertEdit = insertText
    ? TextEdit.insert(new Position(pos.line, pos.character), insertText)
    : undefined;
  return insertEdit ? [...edits, insertEdit] : edits;
}

export function getDeleteEdits(
  nodes: ImportNode[],
  insertRange: InsertRange | undefined,
  config: Configuration,
) {
  const [first, ...rest] = merge(nodes.map(n => n.range));
  const { ranges: r1, insertPos } = decideDeleteAndInsert(first, insertRange, config);
  const r2 = rest.map(decideDelete);
  const deleteEdits = [...r1, ...r2].map(({ start, end }) =>
    TextEdit.delete(
      new Range(new Position(start.line, start.character), new Position(end.line, end.character)),
    ),
  );
  return { deleteEdits, insertPos };
}

function merge(ranges: RangeAndEmptyLines[]) {
  return ranges.reduce((r, c) => {
    if (!r.length) return [c];
    const last = r[r.length - 1];
    const { fullStart, end, trailingNewLines, fullEnd, eof } = c;
    if (last.end.pos >= fullStart.pos) {
      r[r.length - 1] = { ...last, end, trailingNewLines, fullEnd, eof };
      return r;
    } else return [...r, c];
  }, [] as RangeAndEmptyLines[]);
}

function decideDeleteAndInsert(
  range: RangeAndEmptyLines,
  insertRange: InsertRange | undefined,
  config: Configuration,
) {
  if (!insertRange) {
    // Insert at 'range' (which will be deleted)
    const EL = config.insertFinalNewline ? 1 : 0;
    const { fullStart, leadingNewLines: ln, fullEnd, eof } = range;
    const leadingNewLines = !fullStart.pos ? 0 : Math.min(Math.max(ln, 1), 2);
    const trailingNewLines = eof ? EL : 2;
    return {
      ranges: [{ start: fullStart, end: fullEnd }],
      insertPos: { pos: fullStart, leadingNewLines, trailingNewLines },
    };
  }
  const { ranges, ...rest } = decideInsert(insertRange);
  const d = decideDelete(range);
  return { ranges: [...ranges, d], ...rest };
}

function decideInsert(insertRange: InsertRange): { ranges: LineRange[]; insertPos: InsertPos } {
  const { fullStart, leadingNewLines: ln, commentStart } = insertRange;
  const ranges = fullStart.pos < commentStart.pos ? [{ start: fullStart, end: commentStart }] : [];
  const leadingNewLines = !fullStart.pos ? 0 : Math.min(Math.max(ln, 1), 2);
  return { ranges, insertPos: { pos: fullStart, leadingNewLines, trailingNewLines: 2 } };
}

function decideDelete(
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
  // Current statement is at the beginning of the file
  if (!fullStart.pos) return { start: fullStart, end: fullEnd };
  // Prev and current statements are in the same line
  if (!leadingNewLines) {
    const start = fullStart;
    const ends = eof
      ? [cmEnd, cmEnd, { line: fullEnd.line - 1, character: 0 }]
      : [cmEnd, cmEnd, cmEnd, { line: fullEnd.line - 2, character: 0 }];
    const end = ends[Math.min(trailingNewLines, ends.length - 1)];
    return { start, end };
  } else if (leadingNewLines === 1) {
    // No empty lines are between prev and current statements
    const start = cmStart;
    const ends = eof ? [fullEnd] : [fullEnd, cmEnd, { line: fullEnd.line - 1, character: 0 }];
    const end = ends[Math.min(trailingNewLines, ends.length - 1)];
    return { start, end };
  } else if (leadingNewLines === 2) {
    // One empty line is between prev and current statements
    const start = eof ? { line: cmStart.line - 1, character: 0 } : cmStart;
    return { start, end: fullEnd };
  } else {
    // More than one empty lines are between prev and current statements
    const start = { line: fullStart.line + (eof ? 1 : 2), character: 0 };
    return { start, end: fullEnd };
  }
}
