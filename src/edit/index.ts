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
      last.end = cur.end;
    } else merged.push(cur);
  });
  return merged;
}

function decideRange(range: RangeAndEmptyLines): LineRange {
  return range;
  // const { leadingEmptyLines, startLine: declStart, endLine: declEnd } = range;
  // const fullStart = declStart.line - leadingEmptyLines;
  // const fullEnd = declEnd.line + trailingEmptyLines;
  // // Preserve one empty line between prev and next statements if there were empty line(s).
  // const startLine = !leadingEmptyLines
  //   ? declStart
  //   : { line: fullStart ? fullStart + 1 : 0, character: 0 };
  // const endLine = !trailingEmptyLines
  //   ? declEnd
  //   : leadingEmptyLines || !fullStart
  //   ? { line: fullEnd, character: 0 }
  //   : { line: fullEnd - 1, character: 0 };
  // return { startLine, endLine };
}
