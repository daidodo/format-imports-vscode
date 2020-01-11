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

export class ImportParser {
  private readonly sourceText_: string;
  private readonly sourceFile_: SourceFile;
  private allIds_ = new Set();
  private importNodes_: ImportNode[] = [];

  constructor(sourceText: string, fileName: string) {
    this.sourceText_ = sourceText;
    this.sourceFile_ = createSourceFile(fileName, sourceText, ScriptTarget.Latest);
    this.parseNode(this.sourceFile_);
    console.log('sourceFile_: ', this.sourceFile_);
  }

  private parseNode(node: Node) {
    const s = this.sourceFile_;
    const t = this.sourceText_;
    switch (node.kind) {
      case SyntaxKind.ImportDeclaration: {
        const n = ImportNode.fromDecl(node as ImportDeclaration, s, t);
        if (n) this.importNodes_.push(n);
        return;
      }
      case SyntaxKind.ImportEqualsDeclaration:
        this.importNodes_.push(ImportNode.fromEqDecl(node as ImportEqualsDeclaration, s, t));
        return;
      case SyntaxKind.Identifier:
        this.allIds_.add(node.getText(s));
    }
    node.forEachChild(this.parseNode.bind(this));
  }
}
