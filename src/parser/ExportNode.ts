import {
  ExportDeclaration,
  StringLiteral,
  SyntaxKind,
} from 'typescript';

import { normalizePath } from '../utils';
import Statement from './Statement';
import {
  NameBinding,
  NodeComment,
  RangeAndEmptyLines,
} from './types';

export default class ExportNode extends Statement {
  readonly moduleIdentifier?: string;
  private readonly names_: NameBinding[];

  static fromDecl(
    node: ExportDeclaration,
    range: RangeAndEmptyLines,
    leadingComments: NodeComment[] | undefined,
    trailingCommentsText: string,
  ) {
    const { exportClause, moduleSpecifier } = node;
    if (!exportClause || exportClause.kind !== SyntaxKind.NamedExports) return undefined;
    const names: NameBinding[] = exportClause.elements
      .filter(e => e.kind === SyntaxKind.ExportSpecifier)
      .map(({ name, propertyName }) =>
        propertyName
          ? { aliasName: name.text, propertyName: propertyName.text }
          : { propertyName: name.text },
      );
    if (moduleSpecifier && moduleSpecifier.kind !== SyntaxKind.StringLiteral) return undefined;
    const moduleIdentifier = moduleSpecifier && (moduleSpecifier as StringLiteral).text;
    return new ExportNode(moduleIdentifier, names, range, leadingComments, trailingCommentsText);
  }

  private constructor(
    moduleIdentifier: string | undefined,
    names: NameBinding[],
    range: RangeAndEmptyLines,
    leadingComments: NodeComment[] | undefined,
    trailingCommentsText: string,
  ) {
    super(range, leadingComments, trailingCommentsText);
    this.moduleIdentifier = moduleIdentifier && normalizePath(moduleIdentifier);
    this.names_ = names;
  }
}
