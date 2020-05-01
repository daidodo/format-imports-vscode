import {
  ExportDeclaration,
  StringLiteral,
  SyntaxKind,
} from 'typescript';

import { composeNodeAsNames } from '../compose';
import { ComposeConfig } from '../config';
import { normalizePath } from '../utils';
import Statement, { StatementArgs } from './Statement';
import { NameBinding } from './types';

export default class ExportNode extends Statement {
  private readonly moduleIdentifier_?: string;
  names: NameBinding[];

  static fromDecl(node: ExportDeclaration, args: StatementArgs) {
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
    return new ExportNode(moduleIdentifier, names, args);
  }

  private constructor(
    moduleIdentifier: string | undefined,
    names: NameBinding[],
    args: StatementArgs,
  ) {
    super(args);
    this.moduleIdentifier_ = moduleIdentifier && normalizePath(moduleIdentifier);
    this.names = names;
  }

  empty() {
    return this.names.length < 1;
  }

  merge(node: ExportNode) {
    if (this.moduleIdentifier_ !== node.moduleIdentifier_ || !this.canMergeComments(node))
      return false;
    this.names.push(...node.names);
    node.names = [];
    return this.mergeComments(node);
  }

  compose(config: ComposeConfig) {
    const { leadingText, trailingText, tailingLength } = this.composeComments(config);
    const importText = this.composeExport(tailingLength, config);
    return leadingText + importText + trailingText;
  }

  private composeExport(commentLength: number, config: ComposeConfig) {
    const { quote, semi } = config;
    const path = this.moduleIdentifier_;
    const from = path ? 'from ' + quote(path) : undefined;
    return composeNodeAsNames('export', undefined, this.names, from, commentLength, config) + semi;
  }
}
