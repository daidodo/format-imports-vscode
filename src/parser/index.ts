import {
  ImportDeclaration,
  ImportEqualsDeclaration,
  Node,
  SourceFile,
  SyntaxKind,
} from 'typescript';

import ImportNode from './ImportNode';
import { parseLineRanges } from './lines';
import {
  InsertLine,
  NodeComment,
} from './types';

export { ImportNode };

export { LineRange, RangeAndEmptyLines, NameBinding, NodeComment, InsertLine } from './types';

export function parseSource(sourceText: string, sourceFile: SourceFile) {
  const allIds = new Set<string>();
  const importNodes: ImportNode[] = [];
  const parseNode = (node: Node) => {
    switch (node.kind) {
      case SyntaxKind.ImportDeclaration:
        importNodes.push(ImportNode.fromDecl(node as ImportDeclaration, sourceFile, sourceText));
        return;
      case SyntaxKind.ImportEqualsDeclaration:
        importNodes.push(
          ImportNode.fromEqDecl(node as ImportEqualsDeclaration, sourceFile, sourceText),
        );
        return;
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
  return { allIds, importNodes };
}

export function getInsertLine(
  sourceFile: SourceFile,
  sourceText: string,
): {
  fileComments?: NodeComment[];
  insertLine: InsertLine;
} {
  const firstNode = sourceFile.getChildren().find(n => !n.getFullStart());
  if (!firstNode) return { insertLine: { line: 0, leadingNewLines: 0 } };
  const {
    fileComments,
    fullStart,
    leadingNewLines: nl,
    declAndCommentsLineRange: decl,
  } = parseLineRanges(firstNode, sourceFile, sourceText);
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
  return { fileComments, insertLine: { line, leadingNewLines, needlessSpaces } };
}
