import {
  ImportDeclaration,
  ImportEqualsDeclaration,
  Node,
  SourceFile,
  SyntaxKind,
} from 'typescript';

import {
  assertNonNull,
  assert,
} from '../utils';
import ImportNode from './ImportNode';
import {
  parseLineRanges,
  isDisabled,
} from './lines';
import { InsertLine } from './types';

export { ImportNode };

export { LineRange, RangeAndEmptyLines, NameBinding, NodeComment, InsertLine } from './types';

export function parseSource(sourceText: string, sourceFile: SourceFile) {
  const allIds = new Set<string>();
  const importNodes: ImportNode[] = [];
  const parseNode = (node: Node) => {
    switch (node.kind) {
      case SyntaxKind.ImportDeclaration: {
        const n = ImportNode.fromDecl(node as ImportDeclaration, sourceFile, sourceText);
        if (n) importNodes.push(n);
        return;
      }
      case SyntaxKind.ImportEqualsDeclaration: {
        const n = ImportNode.fromEqDecl(node as ImportEqualsDeclaration, sourceFile, sourceText);
        if (n) importNodes.push(n);
        return;
      }
      case SyntaxKind.Identifier:
        allIds.add(node.getText(sourceFile));
        break;
      case SyntaxKind.JsxElement:
      case SyntaxKind.JsxFragment:
        allIds.add('React');
        break;
    }
    node.forEachChild(parseNode);
  };
  parseNode(sourceFile);
  return { allIds, importNodes: importNodes.filter(n => !n.disabled) };
}

export function getInsertLine(
  sourceFile: SourceFile,
  sourceText: string,
): {
  isFileDisabled?: boolean;
  insertLine?: InsertLine;
} {
  // Find first node that is NOT disabled.
  const [syntaxList] = sourceFile.getChildren();
  assertNonNull(syntaxList);
  assert(syntaxList.kind === SyntaxKind.SyntaxList);
  for (const node of syntaxList.getChildren()) {
    const {
      fileComments,
      disabled,
      fullStart,
      leadingNewLines: nl,
      declAndCommentsLineRange: decl,
    } = parseLineRanges(node, sourceFile, sourceText);
    const isFileDisabled = isDisabled(fileComments);
    if (isFileDisabled) return { isFileDisabled };
    if (disabled) continue;
    const { pos, line: l } = fullStart;
    if (!pos)
      return {
        insertLine: {
          line: 0,
          leadingNewLines: 0,
          needlessSpaces: { start: fullStart, end: decl.start },
        },
      };
    const leadingNewLines = nl < 2 ? 1 : 2;
    const line = l + leadingNewLines;
    const needlessSpaces = nl < 3 ? undefined : { start: { line, character: 0 }, end: decl.start };
    return { insertLine: { line, leadingNewLines, needlessSpaces } };
  }
  return { isFileDisabled: true };
}
