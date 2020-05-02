import {
  ExportDeclaration,
  ExpressionStatement,
  ImportDeclaration,
  ImportEqualsDeclaration,
  Node,
  SourceFile,
  StringLiteral,
  SyntaxKind,
} from 'typescript';

import { Configuration } from '../config';
import ExportNode from './ExportNode';
import ImportNode from './ImportNode';
import {
  isDisabled,
  parseLineRanges,
} from './lines';
import ParseParams from './ParseParams';
import { RangeAndEmptyLines } from './types';

export function parseSource(sourceFile: SourceFile, sourceText: string, config: Configuration) {
  const p = new ParseParams(sourceFile, sourceText);
  const [syntaxList] = sourceFile.getChildren();
  if (syntaxList && syntaxList.kind === SyntaxKind.SyntaxList)
    for (const node of syntaxList.getChildren()) if (!process(node, p, config)) break;
  return p;
}

function process(node: Node, p: ParseParams, config: Configuration) {
  const { force, formatExports } = config;
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
  } = parseLineRanges(node, p);
  if (!force && isDisabled(fileComments)) return false; // File is disabled
  if (isUseStrict(node)) return true; // Skip 'use strict' directive
  p.checkFileComments = false; // No more checks for global comments after non-'use strict' statement
  const range: RangeAndEmptyLines = {
    ...declAndCommentsLineRange,
    fullStart,
    leadingNewLines,
    trailingNewLines,
    fullEnd,
    eof,
  };
  const disabled = isDisabled(leadingComments) || isDisabled(trailingComments);
  const a = { range, leadingComments, trailingCommentsText };
  if (node.kind === SyntaxKind.ImportDeclaration) {
    if (disabled) return true;
    const n = ImportNode.fromDecl(node as ImportDeclaration, a);
    p.addImport(n);
    p.updateImportInsertPoint(range);
  } else if (node.kind === SyntaxKind.ImportEqualsDeclaration) {
    if (disabled) return true;
    const n = ImportNode.fromEqDecl(node as ImportEqualsDeclaration, a);
    p.addImport(n);
    p.updateImportInsertPoint(range);
  } else {
    // parseId(node, p);
    p.updateImportInsertPoint(range);
    if (formatExports && !disabled && node.kind === SyntaxKind.ExportDeclaration) {
      const n = ExportNode.fromDecl(node as ExportDeclaration, a);
      p.addExport(n);
    }
  }
  return true;
}

/**
 * Traverse node and find out all referenced names.
 * The result is used only in removing unused names.
 *
 * This function is deprecated because it's less accurate and reliable
 * compared to TS compiler error/warning messages.
 *
 * Keep the code just for regression purposes.
 * @deprecated In favor to TS compiler error/warning messages.
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
 */

function isUseStrict(node: Node) {
  if (node.kind !== SyntaxKind.ExpressionStatement) return false;
  const { expression } = node as ExpressionStatement;
  if (expression.kind !== SyntaxKind.StringLiteral) return false;
  return (expression as StringLiteral).text === 'use strict';
}
