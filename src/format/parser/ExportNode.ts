import {
  ExportDeclaration,
  StringLiteral,
  SyntaxKind,
} from 'typescript';

import { composeNodeAsNames } from '../compose';
import { ComposeConfig } from '../config';
import { NameBinding } from '../types';
import { getNameBinding } from './helper';
import { normalizePath } from './path';
import Statement, { StatementArgs } from './Statement';

export default class ExportNode extends Statement {
  private readonly moduleIdentifier_?: string;
  private readonly isTypeOnly_: boolean;
  names: NameBinding[];

  static fromDecl(node: ExportDeclaration, args: StatementArgs) {
    const { exportClause, moduleSpecifier, isTypeOnly } = node;
    if (!exportClause || exportClause.kind !== SyntaxKind.NamedExports) return undefined;
    const names = exportClause.elements
      .filter(e => e.kind === SyntaxKind.ExportSpecifier)
      .map(getNameBinding);
    if (moduleSpecifier && moduleSpecifier.kind !== SyntaxKind.StringLiteral) return undefined;
    const moduleIdentifier = moduleSpecifier && (moduleSpecifier as StringLiteral).text;
    return new ExportNode(moduleIdentifier, names, args, isTypeOnly);
  }

  private constructor(
    moduleIdentifier: string | undefined,
    names: NameBinding[],
    args: StatementArgs,
    isTypeOnly: boolean,
  ) {
    super(args);
    this.moduleIdentifier_ = moduleIdentifier && normalizePath(moduleIdentifier, args.config);
    this.isTypeOnly_ = isTypeOnly;
    this.names = names;
  }

  empty() {
    return this.names.length < 1;
  }

  merge(node: ExportNode) {
    if (
      this.empty() ||
      this.moduleIdentifier_ !== node.moduleIdentifier_ ||
      this.isTypeOnly_ !== node.isTypeOnly_ ||
      !this.canMergeComments(node)
    )
      return false;
    // For `export { A } from 'a'`, merge to the front.
    // For `export { A }`, merge to the end.
    const src = this.moduleIdentifier_ ? node : this;
    const dst = this.moduleIdentifier_ ? this : node;
    dst.names.push(...src.names);
    src.names = [];
    return dst.mergeComments(src) && !!this.moduleIdentifier_;
  }

  compose(config: ComposeConfig) {
    const { leadingText, trailingText, tailingLength } = this.composeComments(config);
    const importText = this.composeExport(tailingLength, config);
    return leadingText + importText + trailingText;
  }

  private composeExport(commentLength: number, config: ComposeConfig) {
    const { quote, semi } = config;
    const verb = 'export' + (this.isTypeOnly_ ? ' type' : '');
    const path = this.moduleIdentifier_;
    const from = path ? 'from ' + quote(path) : undefined;
    const extraLength = commentLength + semi.length;
    return composeNodeAsNames(verb, undefined, this.names, from, extraLength, config) + semi;
  }
}
