import { LineAndCharacter } from 'typescript';
import {
  Position,
  Range,
  TextEdit,
} from 'vscode';

import { ComposeConfig } from '../config';
import {
  ImportNode,
  InsertRange,
  RangeAndEmptyLines,
} from '../parser';

export { apply } from './apply';

export interface InsertPos {
  pos: LineAndCharacter;
  leadingNewLines?: number;
  trailingNewLines?: number;
}

interface DeleteRange {
  start: LineAndCharacter;
  end: LineAndCharacter;
  text?: string; // Text to replace
}

export function getEdits(edits: TextEdit[], insertText: string | undefined, pos: LineAndCharacter) {
  return insertText
    ? [...edits, TextEdit.insert(new Position(pos.line, pos.character), insertText)]
    : edits;
}

export function getDeleteEdits(
  nodes: ImportNode[],
  insertRange: InsertRange | undefined,
  config: ComposeConfig,
) {
  const [first, ...rest] = merge(nodes.map(n => n.range));
  const { ranges: r1, insertPos } = decideInsert(first, insertRange, config);
  const r2 = rest.map(r => decideDelete(r, config));
  const deleteEdits = [...r1, ...r2].map(({ start: s, end: e, text }) => {
    const r = new Range(new Position(s.line, s.character), new Position(e.line, e.character));
    return text ? TextEdit.replace(r, text) : TextEdit.delete(r);
  });
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
  }, new Array<RangeAndEmptyLines>());
}

function decideInsert(
  range: RangeAndEmptyLines,
  insertRange: InsertRange | undefined,
  config: ComposeConfig,
): { ranges: DeleteRange[]; insertPos: InsertPos } {
  if (insertRange) {
    const { fullStart: fs, leadingNewLines: ln, commentStart: cs } = insertRange;
    const ext = fs.pos < cs.pos ? [{ start: fs, end: cs }] : [];
    const leadingNewLines = !fs.pos ? 0 : Math.min(Math.max(ln, 1), 2);
    return {
      ranges: [decideDelete(range, config), ...ext],
      insertPos: { pos: fs, leadingNewLines, trailingNewLines: 2 },
    };
  }
  // Insert at 'range' (which will be deleted)
  const { leadingNewLines, trailingNewLines, ...rest } = decideDelete(range, config, true);
  return {
    ranges: [rest],
    insertPos: { pos: range.fullStart, leadingNewLines, trailingNewLines },
  };
}

function decideDelete(
  range: RangeAndEmptyLines,
  config: ComposeConfig,
  insert = false,
): DeleteRange & {
  leadingNewLines?: number; // Leading new lines if insert at fullStart
  trailingNewLines?: number; // Trailing new lines if insert at fullStart
} {
  const {
    fullStart,
    leadingNewLines,
    start: cmStart,
    trailingNewLines,
    end: cmEnd,
    fullEnd,
    eof,
  } = range;
  const ln = Math.min(Math.max(leadingNewLines, 1), 2);
  const { nl, lastNewLine } = config;
  // Current statement is at the beginning of the file
  if (!fullStart.pos)
    return { start: fullStart, end: fullEnd, trailingNewLines: eof ? (lastNewLine ? 1 : 0) : 2 };
  // Current statement is at the end of the file
  if (eof)
    return {
      start: fullStart,
      end: fullEnd,
      text: lastNewLine ? nl : undefined,
      leadingNewLines: ln,
    };
  // Current statement is also the insert point
  if (insert)
    return {
      start: fullStart,
      end: fullEnd,
      leadingNewLines: ln,
      trailingNewLines: 2,
    };
  // Prev and current statements are in the same line
  if (!leadingNewLines) {
    const ends = [cmEnd, cmEnd, cmEnd, { line: fullEnd.line - 2, character: 0 }];
    const end = ends[Math.min(trailingNewLines, ends.length - 1)];
    return { start: fullStart, end };
  } else if (leadingNewLines === 1) {
    // No empty lines are between prev and current statements
    const ends = [fullEnd, cmEnd, { line: fullEnd.line - 1, character: 0 }];
    const end = ends[Math.min(trailingNewLines, ends.length - 1)];
    return { start: cmStart, end };
  } else if (leadingNewLines === 2) {
    // One empty line is between prev and current statements
    return { start: cmStart, end: fullEnd };
  } else {
    // More than one empty lines are between prev and current statements
    const start = { line: fullStart.line + 2, character: 0 };
    return { start, end: fullEnd };
  }
}
