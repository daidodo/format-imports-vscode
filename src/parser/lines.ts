import {
  CommentRange,
  getLeadingCommentRanges,
  getTrailingCommentRanges,
  Node,
  SourceFile,
  TextRange,
} from 'typescript';

import {
  LineRange,
  NodeComment,
  Pos,
} from './types';

export function parseLineRanges(node: Node, sourceFile: SourceFile, sourceText: string) {
  // const sourceLines = sourceText.split(/\r?\n/).map(s => s.trimRight());
  const declEnd = node.getEnd();
  const declLineRange = transformRange(
    { pos: node.getStart(sourceFile), end: declEnd },
    sourceFile,
  );
  const { fullStart, leadingEmptyLines, commentsStart, leadingComments } = parseLeadingComments(
    node,
    declLineRange,
    sourceFile,
    sourceText,
  );
  const trailingComments = getTrailingCommentRanges(sourceText, declEnd)?.map(
    transformComment.bind(undefined, sourceFile, sourceText),
  );
  // All tailing comments text should keep unchanged including the leading spaces
  const commentsEnd = (trailingComments ?? []).reduce((e, c) => Math.max(e, c.end.pos), declEnd);
  const trailingCommentsText = sourceText.slice(declEnd, commentsEnd);

  const declAndCommentsLineRange = transformRange(
    { pos: commentsStart, end: commentsEnd },
    sourceFile,
  );
  // const { startLine, endLine } = declAndCommentsLineRange;
  // const trailingEmptyLines = getTrailingEmptyLines(sourceLines, endLine.line);
  return {
    fullStart,
    leadingEmptyLines,
    leadingComments,
    declLineRange,
    trailingComments,
    trailingCommentsText,
    declAndCommentsLineRange,
    // trailingEmptyLines,
  };
}

function transformRange({ pos, end }: TextRange, sourceFile: SourceFile): LineRange {
  return {
    start: transformPos(pos, sourceFile),
    end: transformPos(end, sourceFile),
  };
}

function transformPos(pos: number, sourceFile: SourceFile): Pos {
  return { pos, ...sourceFile.getLineAndCharacterOfPosition(pos) };
}

function parseLeadingComments(
  node: Node,
  declLineRange: LineRange,
  sourceFile: SourceFile,
  sourceText: string,
) {
  const fullStart = transformPos(node.getFullStart(), sourceFile);
  const comments = getLeadingCommentRanges(sourceText, fullStart.pos)?.map(
    transformComment.bind(undefined, sourceFile, sourceText),
  );
  // Skip initial comments that separated by empty line(s) or triple-slash comment(s)
  // from the first import statement.
  if (fullStart.pos === 0 && comments && comments.length > 0) {
    const results = [];
    let nextStartLine = declLineRange.start.line;
    for (let i = comments.length - 1; i >= 0; --i) {
      const comment = comments[i];
      const { start, end, text } = comment;
      const leadingEmptyLines = Math.max(0, nextStartLine - end.line - 1);
      if (0 < leadingEmptyLines || isTripleSlashComment(text)) {
        const leadingComments = results.reverse();
        const commentsStart = results[0]?.start.pos ?? declLineRange.start.pos;
        return {
          fullStart: transformPos(end.pos, sourceFile),
          leadingEmptyLines,
          commentsStart,
          leadingComments,
        };
      }
      results.push(comment);
      nextStartLine = start.line;
    }
  }
  // Find out leading empty lines
  const commentsStart =
    comments && comments.length > 0 ? comments[0].start.pos : declLineRange.start.pos;
  const leadingEmptyLines = (sourceText.slice(fullStart.pos, commentsStart).match(/\n/g) ?? [])
    .length;

  return { fullStart, leadingEmptyLines, commentsStart, leadingComments: comments };
}

function transformComment(
  sourceFile: SourceFile,
  sourceText: string,
  range: CommentRange,
): NodeComment {
  const text = sourceText.slice(range.pos, range.end);
  return { ...range, ...transformRange(range, sourceFile), text };
}

function isTripleSlashComment(text: string) {
  return text.trimLeft().search(/^\/\/\/\s*</) >= 0;
}

// function getTrailingEmptyLines(sourceLines: string[], index: number) {
//   let i = index + 1;
//   for (; i < sourceLines.length && !sourceLines[i]; ++i);
//   return i - index - 1;
// }
