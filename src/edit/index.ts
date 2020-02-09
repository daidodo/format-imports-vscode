import { LineAndCharacter } from 'typescript';
import {
  Position,
  Range,
  TextEdit,
} from 'vscode';

import { ComposeConfig } from '../config';
import {
  ImportNode,
  InsertNodeRange,
  RangeAndEmptyLines,
} from '../parser';

export { apply } from './apply';

export interface InsertPos {
  pos: LineAndCharacter;
  end: LineAndCharacter;
  leadingNewLines?: number;
  trailingNewLines?: number;
}

interface DeleteRange {
  start: LineAndCharacter;
  end: LineAndCharacter;
  text?: string; // Text to replace
}

export function getEdits(
  edits: TextEdit[],
  insertText: string | undefined,
  insertPos: { pos: LineAndCharacter; end: LineAndCharacter },
) {
  if (!insertText) return edits;
  const { pos, end } = insertPos;
  return [
    TextEdit.replace(
      new Range(new Position(pos.line, pos.character), new Position(end.line, end.character)),
      insertText,
    ),
    ...edits, // Deletions must be after insertion
  ];
}

export function getDeleteEdits(
  nodes: ImportNode[],
  insertRange: InsertNodeRange | undefined,
  config: ComposeConfig,
) {
  const [first, ...rest] = merge(nodes.map(n => n.range));
  const { deleteRange, insertPos } = decideInsert(first, insertRange, config);
  const r2 = rest.map(r => decideDelete(r, config));
  const deleteEdits = [deleteRange, ...r2].map(({ start: s, end: e, text }) => {
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
  insertRange: InsertNodeRange | undefined,
  config: ComposeConfig,
): { deleteRange: DeleteRange; insertPos: InsertPos } {
  if (insertRange) {
    const { fullStart: fs, leadingNewLines: ln, commentStart: cs } = insertRange;
    const leadingNewLines = !fs.pos ? 0 : Math.min(Math.max(ln, 1), 2);
    return {
      deleteRange: decideDelete(range, config),
      insertPos: { pos: fs, end: cs, leadingNewLines, trailingNewLines: 2 },
    };
  }
  // Insert at 'range' (which will be deleted)
  const { leadingNewLines, trailingNewLines, ...deleteRange } = decideDelete(range, config);
  const { fullStart: pos, fullEnd: end } = range;
  return {
    deleteRange,
    insertPos: { pos, end, leadingNewLines, trailingNewLines },
  };
}

function decideDelete(
  range: RangeAndEmptyLines,
  config: ComposeConfig,
): DeleteRange & {
  leadingNewLines?: number; // Leading new lines if insert at fullStart
  trailingNewLines?: number; // Trailing new lines if insert at fullStart
} {
  const { fullStart, leadingNewLines, trailingNewLines, end: cmEnd, fullEnd, eof } = range;
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
  // Prev and current statements are in the same line
  if (!leadingNewLines) {
    const ends = [cmEnd, fullEnd];
    const nls = [0, 1, 2];
    const end = ends[Math.min(trailingNewLines, ends.length - 1)];
    const tn = nls[Math.min(trailingNewLines, nls.length - 1)];
    const text = nl.repeat(tn);
    return { start: fullStart, end, text, leadingNewLines: ln, trailingNewLines: 2 - tn };
  } else if (leadingNewLines === 1) {
    // No empty lines are between prev and current statements
    const nls = [1, 2];
    const tn = nls[Math.min(trailingNewLines, nls.length - 1)];
    const text = nl.repeat(tn);
    return { start: fullStart, end: fullEnd, text, leadingNewLines: ln, trailingNewLines: 2 - tn };
  }
  // One or more empty lines are between prev and current statements
  return { start: fullStart, end: fullEnd, text: nl.repeat(2), leadingNewLines: 2 };
}
