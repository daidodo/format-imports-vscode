import {
  createSourceFile,
  ImportDeclaration,
  ImportEqualsDeclaration,
  Node,
  ScriptTarget,
  SyntaxKind,
} from 'typescript';

import ImportNode from './ImportNode';

export default function parseImportNodes(sourceText: string, fileName: string) {
  const sourceFile = createSourceFile(fileName, sourceText, ScriptTarget.Latest);
  const allIdentifiers = new Set<string>();
  const importNodes: ImportNode[] = [];
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
  return { allIdentifiers, importNodes };
}

export { ImportNode };

export { LineRange } from './types';
