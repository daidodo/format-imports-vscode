import {
  CompilerOptions,
  ExportDeclaration,
  ExpressionStatement,
  ImportDeclaration,
  ImportEqualsDeclaration,
  Node,
  SourceFile,
  StringLiteral,
  SyntaxKind,
} from 'typescript';

import { logger } from '../../common';
import { Configuration } from '../../config';
import { RangeAndEmptyLines } from '../types';
import ExportNode from './ExportNode';
import ImportNode from './ImportNode';
import {
  isDisabled,
  parseLineRanges,
} from './lines';
import ParseParams from './ParseParams';
import { StatementArgs } from './Statement';

export function parseSource(
  sourceFile: SourceFile,
  sourceText: string,
  config: Configuration,
  options?: CompilerOptions,
) {
  const p = new ParseParams(sourceFile, sourceText);
  for (const node of sourceFile.statements) if (!process(node, p, config, options)) break;
  return p;
}

function process(node: Node, p: ParseParams, config: Configuration, options?: CompilerOptions) {
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
  if (!force && isDisabled(fileComments)) {
    logger('parser.process').info('Disable comment found. Ignoring file.');
    return false;
  }
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
  const a = { range, leadingComments, trailingCommentsText, config };
  if (node.kind === SyntaxKind.ImportDeclaration)
    handleImport(p, disabled, range, () => ImportNode.fromDecl(node as ImportDeclaration, a));
  else if (node.kind === SyntaxKind.ImportEqualsDeclaration)
    handleImport(p, disabled, range, () =>
      ImportNode.fromEqDecl(node as ImportEqualsDeclaration, a),
    );
  else handleOthers(p, !formatExports || disabled, range, node, a, options);
  return true;
}

function handleImport(
  p: ParseParams,
  disabled: boolean,
  range: RangeAndEmptyLines,
  importNode: () => ImportNode | undefined,
) {
  if (!disabled) {
    p.updateImportInsertPoint(range);
    if (p.addImport(importNode())) return;
  }
  p.addUnhandledImportOrExport();
}

function handleOthers(
  p: ParseParams,
  disabled: boolean,
  range: RangeAndEmptyLines,
  node: Node,
  a: StatementArgs,
  options?: CompilerOptions,
) {
  parseId(node, p, options);
  p.updateImportInsertPoint(range);
  if (node.kind === SyntaxKind.ExportDeclaration) {
    if (!disabled) {
      const n = ExportNode.fromDecl(node as ExportDeclaration, a);
      if (p.addExport(n)) return;
    }
    p.addUnhandledImportOrExport();
  } else if (node.kind === SyntaxKind.ExportAssignment) p.addUnhandledImportOrExport();
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
 */
function parseId(node: Node, p: ParseParams, options?: CompilerOptions) {
  const { sourceFile, allIds } = p;
  switch (node.kind) {
    case SyntaxKind.Identifier:
      allIds.add(node.getText(sourceFile));
      break;
    case SyntaxKind.JsxElement:
    case SyntaxKind.JsxSelfClosingElement:
    case SyntaxKind.JsxFragment:
      // See: https://github.com/ionic-team/stencil/blob/master/BREAKING_CHANGES.md#import--h--is-required
      allIds.add(options?.jsxFactory === 'h' ? 'h' : 'React');
      break;
  }
  node.forEachChild(n => parseId(n, p, options));
}

function isUseStrict(node: Node) {
  if (node.kind !== SyntaxKind.ExpressionStatement) return false;
  const { expression } = node as ExpressionStatement;
  if (!expression || expression.kind !== SyntaxKind.StringLiteral) return false;
  return (expression as StringLiteral).text === 'use strict';
}
