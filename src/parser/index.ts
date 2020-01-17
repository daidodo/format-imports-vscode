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

export { ImportNode };

export { LineRange, RangeAndEmptyLines, NameBinding, NodeComment } from './types';

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
        break;
      case SyntaxKind.JsxElement:
      case SyntaxKind.JsxFragment:
        allIdentifiers.add('React');
        break;
    }
    node.forEachChild(parseNode);
  };
  parseNode(sourceFile);
  return { allIdentifiers, importNodes, insertLine };
}

function getInsertLine(sourceFile: SourceFile, sourceText: string) {
  const firstNode = sourceFile.getChildren().find(n => !n.getFullStart());
  if (!firstNode) return 0;
  const { line, pos } = parseLineRanges(firstNode, sourceFile, sourceText).fullStart;
  return pos ? line + 2 : 0;
}
