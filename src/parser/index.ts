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
import {
  calcLineRange,
  parseCommentsAndLines,
} from './lines';

export default function parseSource(sourceText: string, fileName: string) {
  const sourceFile = createSourceFile(fileName, sourceText, ScriptTarget.Latest);
  const allIdentifiers = new Set<string>();
  const importNodes: ImportNode[] = [];
  const insertLine = getInsertLine(sourceFile, sourceText);
  const parseNode = (node: Node) => {
    switch (node.kind) {
      case SyntaxKind.ImportDeclaration: {
        const n = ImportNode.fromDecl(node as ImportDeclaration, sourceFile, sourceText);
        if (n) importNodes.push(n);
        return;
      }
      case SyntaxKind.ImportEqualsDeclaration:
        importNodes.push(
          ImportNode.fromEqDecl(node as ImportEqualsDeclaration, sourceFile, sourceText),
        );
        return;
      case SyntaxKind.Identifier:
        allIdentifiers.add(node.getText(sourceFile));
    }
    node.forEachChild(parseNode);
  };
  parseNode(sourceFile);
  return { allIdentifiers, importNodes, insertLine };
}

export { ImportNode };

export { LineRange, RangeAndEmptyLines, NameBinding } from './types';

function getInsertLine(sourceFile: SourceFile, sourceText: string) {
  const firstNode = sourceFile.getChildren().find(n => !n.getFullStart());
  if (!firstNode) return 0;
  const { declLineRange, leadingComments, trailingComments } = parseCommentsAndLines(
    firstNode,
    sourceFile,
    sourceText,
  );
  return calcLineRange(declLineRange, leadingComments, trailingComments).startLine.line;
}
