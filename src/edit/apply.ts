import { SourceFile } from 'typescript';

import { Edit } from './types';

export function apply(sourceText: string, sourceFile: SourceFile, edits: Edit[]) {
  if (edits.length < 1) return undefined;
  const sortedEdits = edits.sort(({ range: r1 }, { range: r2 }) => r1.start.pos - r2.start.pos);
  let text = '';
  let cur = 0;
  sortedEdits.forEach(({ range, newText }) => {
    const { start, end } = range;
    const pos = sourceFile.getPositionOfLineAndCharacter(start.line, start.character);
    if (cur < pos) text += sourceText.slice(cur, pos);
    text += newText;
    cur = Math.max(cur, sourceFile.getPositionOfLineAndCharacter(end.line, end.character));
  });
  text += sourceText.slice(cur);
  return text;
}
