import {
  createSourceFile,
  ImportDeclaration,
  ImportEqualsDeclaration,
  Node,
  ScriptTarget,
  SourceFile,
  SyntaxKind,
} from 'typescript';

import ImportNode from './ImportNode';
import { parseLineRanges } from './lines';
import { InsertLine } from './types';

export { ImportNode };

export { LineRange, RangeAndEmptyLines, NameBinding, NodeComment, InsertLine } from './types';

export default function parseSource(sourceText: string, fileName: string) {
  const sourceFile = createSourceFile(fileName, sourceText, ScriptTarget.Latest);
  const allIds = new Set<string>();
  const importNodes: ImportNode[] = [];
  const insertLine = getInsertLine(sourceFile, sourceText);
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
  return { allIds, importNodes, insertLine };
}

function getInsertLine(sourceFile: SourceFile, sourceText: string): InsertLine {
  const firstNode = sourceFile.getChildren().find(n => !n.getFullStart());
  if (!firstNode) return { line: 0, leadingNewLines: 0 };
  const { fullStart, leadingNewLines: l } = parseLineRanges(firstNode, sourceFile, sourceText);
  const { pos, line } = fullStart;
  const leadingNewLines = !pos ? 0 : l < 2 ? 1 : 2;
  return { line: line + leadingNewLines, leadingNewLines };
}
