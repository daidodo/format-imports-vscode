import {
  CommentRange,
  getLeadingCommentRanges,
  getTrailingCommentRanges,
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
import {
  LineRange,
  NameBinding,
  NodeComment,
} from './types';

export default class ImportNode {
  private readonly sourceText_: string;
  private readonly sourceFile_: SourceFile;
  private readonly node_: ImportDeclaration | ImportEqualsDeclaration;

  private moduleIdentifier_: string;
  private defaultName_?: NameBinding;
  private names_?: NameBinding[];
  private lineRange_: LineRange;
  private leadingComments_?: NodeComment[];
  private trailingComments_?: NodeComment[];

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

  private constructor(
    node: ImportDeclaration | ImportEqualsDeclaration,
    sourceFile: SourceFile,
    sourceText: string,
    moduleIdentifier: string,
    defaultName?: NameBinding,
    names?: NameBinding[],
  ) {
    this.node_ = node;
    this.sourceFile_ = sourceFile;
    this.sourceText_ = sourceText;
    this.moduleIdentifier_ = normalizePath(moduleIdentifier);
    this.defaultName_ = defaultName;
    this.names_ = names;
    this.lineRange_ = {
      startLine: sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)),
      endLine: sourceFile.getLineAndCharacterOfPosition(node.getEnd()),
    };
    this.leadingComments_ = this.parseLeadingComments();
    this.trailingComments_ = getTrailingCommentRanges(sourceText, node.getEnd())?.map(
      this.transformComment.bind(this),
    );
  }

  private parseLeadingComments() {
    const node = this.node_;
    const fullStart = node.getFullStart();
    const text = this.sourceText_;
    const comments = getLeadingCommentRanges(text, fullStart)?.map(
      this.transformComment.bind(this),
    );
    // Skip initial comments that separated by empty line(s) from the first import statement.
    if (fullStart === 0 && comments && comments.length > 0) {
      const results = [];
      let nextStartLine = this.lineRange_.startLine.line;
      for (let i = comments.length - 1; i >= 0; --i) {
        const comment = comments[i];
        if (comment.endLine.line + 1 < nextStartLine) return results.reverse();
        results.push(comment);
        nextStartLine = comment.startLine.line;
      }
    }
    return comments;
  }

  private transformComment(range: CommentRange): NodeComment {
    const s = this.sourceFile_;
    const startLine = s.getLineAndCharacterOfPosition(range.pos);
    const endLine = s.getLineAndCharacterOfPosition(range.end);
    return { range, startLine, endLine };
  }
}
