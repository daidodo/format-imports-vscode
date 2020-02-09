import ts, {
  CommentRange,
  Node,
  SourceFile,
  TextRange,
} from 'typescript';

import {
  LineRange,
  NodeComment,
  Pos,
} from './types';

export function parseLineRanges(
  node: Node,
  sourceFile: SourceFile,
  sourceText: string,
  lastCommentEnd?: Pos,
) {
  const declEnd = node.getEnd();
  const declLineRange = transformRange(
    { pos: node.getStart(sourceFile), end: declEnd },
    sourceFile,
  );
  const {
    fileComments,
    fullStart,
    leadingNewLines,
    commentsStart,
    leadingComments,
  } = parseLeadingComments(node, declLineRange, sourceFile, sourceText, lastCommentEnd);
  const trailingComments = ts
    .getTrailingCommentRanges(sourceText, declEnd)
    ?.map(transformComment.bind(undefined, sourceFile, sourceText));
  // All tailing comments text should keep unchanged including the leading spaces
  const commentsEnd = (trailingComments ?? []).reduce((e, c) => Math.max(e, c.end.pos), declEnd);
  const trailingCommentsText = sourceText.slice(declEnd, commentsEnd);

  const declAndCommentsLineRange = transformRange(
    { pos: commentsStart, end: commentsEnd },
    sourceFile,
  );
  const { trailingNewLines, fullEnd: fullEndPos, eof } = getTrailingNewLines(
    sourceText,
    commentsEnd,
  );
  return {
    fileComments,
    fullStart,
    leadingNewLines,
    leadingComments,
    declLineRange,
    trailingComments,
    trailingCommentsText,
    declAndCommentsLineRange,
    trailingNewLines,
    fullEnd: transformPos(fullEndPos, sourceFile),
    eof,
  };
}

export function isDisabled(comments: NodeComment[] | undefined) {
  for (const c of comments ?? []) {
    // ts-import-sorter: disable
    /* ts-import-sorter: disable */
    if (
      /^\s*\/\/\s*ts-import-sorter:\s*disable\s*$/.test(c.text) ||
      /^\s*\/\*\s*ts-import-sorter:\s*disable\s*\*\/$/.test(c.text)
    )
      return true;
  }
  return false;
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
  lastCommentEnd?: Pos,
) {
  const fullStart = lastCommentEnd ?? transformPos(node.getFullStart(), sourceFile);
  const comments = ts
    .getLeadingCommentRanges(sourceText, fullStart.pos)
    ?.map(transformComment.bind(undefined, sourceFile, sourceText));
  // Skip initial comments that separated by empty line(s) or triple-slash comment(s)
  // from the first import statement.
  if (fullStart.pos === 0 && comments && comments.length > 0) {
    const results = [];
    let nextStartLine = declLineRange.start.line;
    for (let i = comments.length - 1; i >= 0; --i) {
      const comment = comments[i];
      const { start, end, text } = comment;
      const leadingNewLines = nextStartLine - end.line;
      if (1 < leadingNewLines || isTripleSlashComment(text)) {
        const leadingComments = results.reverse();
        const commentsStart = results[0]?.start.pos ?? declLineRange.start.pos;
        const fileComments = comments.slice(0, i + 1);
        return {
          fullStart: transformPos(end.pos, sourceFile),
          leadingNewLines,
          commentsStart,
          leadingComments,
          fileComments,
        };
      }
      results.push(comment);
      nextStartLine = start.line;
    }
  }
  // Find out leading empty lines
  const commentsStart = comments?.[0]?.start.pos ?? declLineRange.start.pos;
  const leadingNewLines = sourceText.slice(fullStart.pos, commentsStart).match(/\n/g)?.length ?? 0;

  return { fullStart, leadingNewLines, commentsStart, leadingComments: comments };
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

function getTrailingNewLines(sourceText: string, pos: number) {
  const input = sourceText.slice(pos);
  const text = /^\s*/u.exec(input)?.[0];
  const trailingNewLines = text?.match(/\n/g)?.length ?? 0;
  return { trailingNewLines, fullEnd: pos + (text?.length ?? 0), eof: input === text };
}
