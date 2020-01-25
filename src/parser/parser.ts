import {
  ExpressionStatement,
  ImportDeclaration,
  ImportEqualsDeclaration,
  Node,
  SourceFile,
  StringLiteral,
  SyntaxKind,
} from 'typescript';

import ImportNode from './ImportNode';
import {
  isDisabled,
  parseLineRanges,
} from './lines';
import {
  InsertRange,
  RangeAndEmptyLines,
} from './types';

interface Params {
  sourceFile: SourceFile;
  sourceText: string;
  importNodes: ImportNode[];
  allIds: Set<string>;
  // If 'range' is undefined, insert before the first ImportNode.
  insertPoint?: { range?: InsertRange };
}

export function parseSource(sourceFile: SourceFile, sourceText: string) {
  const p: Params = { sourceFile, sourceText, importNodes: [], allIds: new Set<string>() };
  const [syntaxList] = sourceFile.getChildren();
  if (syntaxList && syntaxList.kind === SyntaxKind.SyntaxList)
    for (const node of syntaxList.getChildren()) if (!process(node, p)) break;
  return p;
}

function process(node: Node, p: Params) {
  const { sourceFile, sourceText, importNodes } = p;
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
  } = parseLineRanges(node, sourceFile, sourceText);
  if (isDisabled(fileComments)) return false; // File is excluded
  if (isUseStrict(node)) return true; // Skip 'use strict' directive
  const range: RangeAndEmptyLines = {
    ...declAndCommentsLineRange,
    fullStart,
    leadingNewLines,
    trailingNewLines,
    fullEnd,
    eof,
  };
  const disabled = isDisabled(leadingComments) || isDisabled(trailingComments);
  const { kind } = node;
  if (kind === SyntaxKind.ImportDeclaration) {
    if (disabled) return true;
    const n = ImportNode.fromDecl(
      node as ImportDeclaration,
      range,
      leadingComments,
      trailingCommentsText,
    );
    if (n) importNodes.push(n);
    findInsertPoint(p, range, n);
  } else if (kind === SyntaxKind.ImportEqualsDeclaration) {
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
    parseId(node, p);
    findInsertPoint(p, range);
  }
  return true;
}

function findInsertPoint(p: Params, range: RangeAndEmptyLines, node?: ImportNode) {
  if (p.insertPoint) return;
  const { fullStart, leadingNewLines, start } = range;
  p.insertPoint = node ? {} : { range: { fullStart, leadingNewLines, commentStart: start } };
}

function parseId(node: Node, p: Params) {
  const { sourceFile, allIds } = p;
  switch (node.kind) {
    case SyntaxKind.Identifier:
      allIds.add(node.getText(sourceFile));
      break;
    case SyntaxKind.JsxElement:
    case SyntaxKind.JsxSelfClosingElement:
    case SyntaxKind.JsxFragment:
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
