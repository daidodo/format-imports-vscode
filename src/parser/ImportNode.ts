import {
  ImportDeclaration,
  ImportEqualsDeclaration,
  Node,
  SourceFile,
  SyntaxKind,
} from 'typescript';

import {
  assert,
  assertNonNull,
  normalizePath,
} from '../utils';
import { NameBinding } from './types';

export default class ImportNode {
  private readonly sourceText_: string;
  private readonly sourceFile_: SourceFile;
  private readonly node_: Node;

  private moduleIdentifier_: string;
  private defaultName_?: NameBinding;
  private names_?: NameBinding[];

  constructor(node: Node, sourceFile: SourceFile, sourceText: string) {
    this.node_ = node;
    this.sourceFile_ = sourceFile;
    this.sourceText_ = sourceText;
    const { moduleIdentifier, defaultName, names } =
      node.kind === SyntaxKind.ImportDeclaration
        ? this.fromDeclaration()
        : this.fromEqualsDeclaration();
    this.moduleIdentifier_ = normalizePath(moduleIdentifier);
    this.defaultName_ = defaultName;
    this.names_ = names;
  }

  private fromDeclaration() {
    const s = this.sourceFile_;
    const node = this.node_ as ImportDeclaration;

    const { importClause } = node;
    assertNonNull(importClause);
    const { name, namedBindings } = importClause;
    const defaultName = name
      ? { propertyName: name.text }
      : namedBindings && namedBindings.kind === SyntaxKind.NamespaceImport
      ? { aliasName: namedBindings.name.text }
      : undefined;
    const names =
      namedBindings && namedBindings.kind === SyntaxKind.NamedImports
        ? namedBindings.elements.map(e => {
            const { name, propertyName } = e;
            return propertyName
              ? { aliasName: name.text, propertyName: propertyName.text }
              : { propertyName: name.text };
          })
        : undefined;

    return { moduleIdentifier: node.moduleSpecifier.getText(s), defaultName, names };
  }

  private fromEqualsDeclaration() {
    const s = this.sourceFile_;
    const node = this.node_ as ImportEqualsDeclaration;
    const defaultName = { propertyName: node.name.text };

    const { moduleReference } = node;
    assert(moduleReference.kind === SyntaxKind.ExternalModuleReference);
    const { expression } = moduleReference;
    assert(expression.kind === SyntaxKind.StringLiteral);
    const moduleIdentifier = expression.getText(s);

    return { moduleIdentifier, defaultName, names: undefined };
  }
}
