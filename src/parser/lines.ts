import {
  CommentRange,
  getLeadingCommentRanges,
  getTrailingCommentRanges,
  Node,
  SourceFile,
} from 'typescript';

import {
  LineRange,
  NodeComment,
} from './types';

export function parseCommentsAndLines(node: Node, sourceFile: SourceFile, sourceText: string) {
  const sourceLines = sourceText.split(/\r?\n/).map(s => s.trimRight());
  const declLineRange: LineRange = {
    startLine: sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)),
    endLine: sourceFile.getLineAndCharacterOfPosition(node.getEnd()),
  };
  const leadingComments = parseLeadingComments(node, declLineRange, sourceFile, sourceText);
  const trailingComments = getTrailingCommentRanges(sourceText, node.getEnd())?.map(
    transformComment.bind(undefined, sourceFile, sourceText),
  );
  const declAndCommentsLineRange = calcLineRange(declLineRange, leadingComments, trailingComments);
  const { startLine, endLine } = declAndCommentsLineRange;
  const leadingEmptyLines = getLeadingEmptyLines(sourceLines, startLine.line);
  const trailingEmptyLines = getTrailingEmptyLines(sourceLines, endLine.line);
  return {
    declLineRange,
    leadingComments,
    trailingComments,
    declAndCommentsLineRange,
    leadingEmptyLines,
    trailingEmptyLines,
  };
}

export function calcLineRange(
  declLineRange: LineRange,
  leadingComments?: NodeComment[],
  trailingComments?: NodeComment[],
): LineRange {
  return {
    startLine: leadingComments?.[0].startLine ?? declLineRange.startLine,
    endLine: trailingComments?.reverse()?.[0].endLine ?? declLineRange.endLine,
  };
}

function parseLeadingComments(
  node: Node,
  lineRange: LineRange,
  sourceFile: SourceFile,
  sourceText: string,
) {
  const fullStart = node.getFullStart();
  const comments = getLeadingCommentRanges(sourceText, fullStart)?.map(
    transformComment.bind(undefined, sourceFile, sourceText),
  );
  // Skip initial comments that separated by empty line(s) or triple-slash comment(s)
  // from the first import statement.
  if (fullStart === 0 && comments && comments.length > 0) {
    const results = [];
    let nextStartLine = lineRange.startLine.line;
    for (let i = comments.length - 1; i >= 0; --i) {
      const comment = comments[i];
      const { startLine, endLine, text } = comment;
      if (endLine.line + 1 < nextStartLine || isTripleSlashComment(text)) return results.reverse();
      results.push(comment);
      nextStartLine = startLine.line;
    }
  }
  return comments;
}

function transformComment(
  sourceFile: SourceFile,
  sourceText: string,
  range: CommentRange,
): NodeComment {
  const startLine = sourceFile.getLineAndCharacterOfPosition(range.pos);
  const endLine = sourceFile.getLineAndCharacterOfPosition(range.end);
  const text = sourceText.slice(range.pos, range.end);
  return { range, startLine, endLine, text };
}

function isTripleSlashComment(text: string) {
  return text.trimLeft().search(/^\/\/\/\s*</) >= 0;
}

function getLeadingEmptyLines(sourceLines: string[], index: number) {
  let i = index - 1;
  for (; i >= 0 && !sourceLines[i]; --i);
  return index - i - 1;
}

function getTrailingEmptyLines(sourceLines: string[], index: number) {
  let i = index + 1;
  for (; i < sourceLines.length && !sourceLines[i]; ++i);
  return i - index - 1;
}
