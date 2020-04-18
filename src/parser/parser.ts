import ts, {
  ExpressionStatement,
  ImportDeclaration,
  ImportEqualsDeclaration,
  Node,
  SourceFile,
  StringLiteral,
  SyntaxKind,
} from 'typescript';

import { Configuration } from '../config';
import ImportNode from './ImportNode';
import {
  isDisabled,
  parseLineRanges,
} from './lines';
import {
  InsertNodeRange,
  Pos,
  RangeAndEmptyLines,
} from './types';

interface Params {
  sourceFile: SourceFile;
  sourceText: string;
  importNodes: ImportNode[];
  allIds: Set<string>;
  // If 'range' is undefined, insert before the first ImportNode.
  insertPoint?: { range?: InsertNodeRange };
  lastCommentEnd?: Pos;
  checkFileComments: boolean;
}

export function parseSource(sourceFile: SourceFile, sourceText: string, config: Configuration) {
  const p: Params = {
    sourceFile,
    sourceText,
    importNodes: [],
    allIds: new Set<string>(),
    lastCommentEnd: shebangEnd(sourceFile, sourceText),
    checkFileComments: true,
  };
  const [syntaxList] = sourceFile.getChildren();
  if (syntaxList && syntaxList.kind === SyntaxKind.SyntaxList)
    for (const node of syntaxList.getChildren()) if (!process(node, p, config)) break;
  return p;
}

function shebangEnd(sourceFile: SourceFile, sourceText: string) {
  const shebang = ts.getShebang(sourceText);
  if (!shebang) return undefined;
  const pos = shebang.length;
  return { pos, ...sourceFile.getLineAndCharacterOfPosition(pos) };
}

function process(node: Node, p: Params, config: Configuration) {
  const { sourceFile, sourceText, importNodes, lastCommentEnd, checkFileComments } = p;
  const { force } = config;
  const {
    fileComments,
    fullStart,
    leadingNewLines,
    leadingComments,
    // declLineRange,
    trailingComments,
    trailingCommentsText,
    declAndCommentsLineRange,
    trailingNewLines,
    fullEnd,
    eof,
  } = parseLineRanges(node, sourceFile, sourceText, lastCommentEnd, checkFileComments);
  if (!force && isDisabled(fileComments)) return false; // File is disabled
  p.lastCommentEnd = declAndCommentsLineRange.end;
  if (isUseStrict(node)) return true; // Skip 'use strict' directive
  p.checkFileComments = false; // No more checks for file comments after non-'use strict' statement
  const range: RangeAndEmptyLines = {
    ...declAndCommentsLineRange,
    fullStart,
    leadingNewLines,
    trailingNewLines,
    fullEnd,
    eof,
  };
  const disabled = isDisabled(leadingComments) || isDisabled(trailingComments);
  if (node.kind === SyntaxKind.ImportDeclaration) {
    if (disabled) return true;
    const n = ImportNode.fromDecl(
      node as ImportDeclaration,
      range,
      leadingComments,
      trailingCommentsText,
    );
    if (n) importNodes.push(n);
    findInsertPoint(p, range, n);
  } else if (node.kind === SyntaxKind.ImportEqualsDeclaration) {
    if (disabled) return false;
    const n = ImportNode.fromEqDecl(
      node as ImportEqualsDeclaration,
      range,
      leadingComments,
      trailingCommentsText,
    );
    if (n) importNodes.push(n);
    findInsertPoint(p, range, n);
  } else {
    // parseId(node, p);
    findInsertPoint(p, range);
  }
  return true;
}

function findInsertPoint(p: Params, range: RangeAndEmptyLines, node?: ImportNode) {
  if (p.insertPoint) return;
  const { fullStart, leadingNewLines, start } = range;
  p.insertPoint = node ? {} : { range: { fullStart, leadingNewLines, commentStart: start } };
}

/**
 * Traverse node and find out all referenced names.
 * The result is used only in removing unused names.
 *
 * This function is deprecated because it's less accurate and reliable
 * compared to TS compiler error/warning messages.
 *
 * Keep the code just for regression purposes.
 *
 * @deprecated In favor to TS compiler error/warning messages.
 */
function parseId(node: Node, p: Params) {
  const { sourceFile, allIds } = p;
  switch (node.kind) {
    case SyntaxKind.Identifier:
      allIds.add(node.getText(sourceFile));
      break;
    case SyntaxKind.JsxElement:
    case SyntaxKind.JsxSelfClosingElement:
    case SyntaxKind.JsxFragment:
      // This is NOT always true with StencilJS.
      // See: https://github.com/ionic-team/stencil/blob/master/BREAKING_CHANGES.md#import--h--is-required
      allIds.add('React');
      break;
  }
  node.forEachChild(n => parseId(n, p));
}

function isUseStrict(node: Node) {
  if (node.kind !== SyntaxKind.ExpressionStatement) return false;
  const { expression } = node as ExpressionStatement;
  if (expression.kind !== SyntaxKind.StringLiteral) return false;
  return (expression as StringLiteral).text === 'use strict';
}
