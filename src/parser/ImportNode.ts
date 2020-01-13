import {
  ImportDeclaration,
  ImportEqualsDeclaration,
  SourceFile,
  StringLiteral,
  SyntaxKind,
} from 'typescript';

import {
  assert,
  normalizePath,
} from '../utils';
import { parseCommentsAndLines } from './lines';
import {
  LineRange,
  NameBinding,
  NodeComment,
  RangeAndEmptyLines,
} from './types';

export default class ImportNode {
  private readonly node_: ImportDeclaration | ImportEqualsDeclaration;

  private moduleIdentifier_: string;
  private defaultName_?: NameBinding;
  private names_?: NameBinding[];
  private declLineRange_: LineRange;
  private leadingComments_?: NodeComment[];
  private trailingComments_?: NodeComment[];
  private declAndCommentsLineRange_: LineRange;
  private leadingEmptyLines_: number;
  private trailingEmptyLines_: number;

  static fromDecl(node: ImportDeclaration, sourceFile: SourceFile, sourceText: string) {
    const { importClause, moduleSpecifier } = node;
    if (!importClause) return undefined; // import 'some/scripts'

    // moduleIdentifier
    assert(moduleSpecifier.kind === SyntaxKind.StringLiteral);
    const moduleIdentifier = (moduleSpecifier as StringLiteral).text;

    // defaultName & names
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

    return new ImportNode(node, sourceFile, sourceText, moduleIdentifier, defaultName, names);
  }

  static fromEqDecl(node: ImportEqualsDeclaration, sourceFile: SourceFile, sourceText: string) {
    const { moduleReference } = node;
    assert(moduleReference.kind === SyntaxKind.ExternalModuleReference);
    const { expression } = moduleReference;
    assert(expression.kind === SyntaxKind.StringLiteral);
    const moduleIdentifier = expression.getText(sourceFile);
    const defaultName = { propertyName: node.name.text };
    return new ImportNode(node, sourceFile, sourceText, moduleIdentifier, defaultName);
  }

  get rangeAndEmptyLines(): RangeAndEmptyLines {
    return {
      ...this.declAndCommentsLineRange_,
      leadingEmptyLines: this.leadingEmptyLines_,
      trailingEmptyLines: this.trailingEmptyLines_,
    };
  }

  private constructor(
    node: ImportDeclaration | ImportEqualsDeclaration,
    sourceFile: SourceFile,
    sourceText: string,
    moduleIdentifier: string,
    defaultName?: NameBinding,
    names?: NameBinding[],
  ) {
    this.node_ = node;
    this.moduleIdentifier_ = normalizePath(moduleIdentifier);
    this.defaultName_ = defaultName;
    this.names_ = names;
    const {
      declLineRange,
      leadingComments,
      trailingComments,
      declAndCommentsLineRange,
      leadingEmptyLines,
      trailingEmptyLines,
    } = parseCommentsAndLines(node, sourceFile, sourceText);
    this.declLineRange_ = declLineRange;
    this.declAndCommentsLineRange_ = declAndCommentsLineRange;
    this.leadingComments_ = leadingComments;
    this.trailingComments_ = trailingComments;
    this.leadingEmptyLines_ = leadingEmptyLines;
    this.trailingEmptyLines_ = trailingEmptyLines;
  }
}
