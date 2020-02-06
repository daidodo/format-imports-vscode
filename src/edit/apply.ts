import { SourceFile } from 'typescript';
import { TextEdit } from 'vscode';

export function apply(sourceText: string, sourceFile: SourceFile, edits: TextEdit[]) {
  if (edits.length < 1) return sourceText;
  const sortedEdits = edits.sort(({ range: r1 }, { range: r2 }) => r1.start.compareTo(r2.start));
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
