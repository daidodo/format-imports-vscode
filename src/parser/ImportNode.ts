import {
  ImportDeclaration,
  ImportEqualsDeclaration,
  SourceFile,
  StringLiteral,
  SyntaxKind,
} from 'typescript';

import {
  composeComments,
  ComposeConfig,
  composeName,
  composeNames,
} from '../compose';
import {
  assert,
  assertNonNull,
  normalizePath,
} from '../utils';
import { parseLineRanges } from './lines';
import {
  LineRange,
  NameBinding,
  NodeComment,
  Pos,
  RangeAndEmptyLines,
} from './types';

export default class ImportNode {
  private readonly node_: ImportDeclaration | ImportEqualsDeclaration;

  private moduleIdentifier_: string;
  private defaultName_?: NameBinding;
  private names_?: NameBinding[];
  private fullStart_: Pos;
  private leadingEmptyLines_: number;
  private leadingComments_?: NodeComment[];
  // private declLineRange_: LineRange;
  // private trailingComments_?: NodeComment[];
  private trailingCommentsText_: string;
  private declAndCommentsLineRange_: LineRange;

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
    const moduleIdentifier = (expression as StringLiteral).text;
    const defaultName = { propertyName: node.name.text };
    return new ImportNode(node, sourceFile, sourceText, moduleIdentifier, defaultName);
  }

  get rangeAndEmptyLines(): RangeAndEmptyLines {
    return {
      ...this.declAndCommentsLineRange_,
      fullStart: this.fullStart_,
      leadingEmptyLines: this.leadingEmptyLines_,
    };
  }

  removeUnusedNames(allNames: Set<string>) {
    if (!isNameUsed(this.defaultName_, allNames)) this.defaultName_ = undefined;
    this.names_ = this.names_?.filter(n => isNameUsed(n, allNames));
    if (this.names_?.length === 0) this.names_ = undefined;
    return this.defaultName_ || this.names_ ? this : undefined;
  }

  match(regex: string) {
    return !!new RegExp(regex).exec(this.moduleIdentifier_);
  }

  compare(node: ImportNode) {
    return (
      idComparator(this.moduleIdentifier_, node.moduleIdentifier_) ||
      nameComparator(this.defaultName_, node.defaultName_)
    );
  }

  compose(config: ComposeConfig) {
    const leadingText = composeComments(this.leadingComments_) ?? '';
    const importText = this.composeImport(config);
    const trailingText = this.trailingCommentsText_;
    return leadingText + importText + trailingText;
  }

  /**
   * @returns true if `node` is fully merged to `this`; Or false if `node` still has names thus can't be ignored.
   */
  merge(node: ImportNode) {
    const { moduleIdentifier_, node_ } = node;
    if (
      this.moduleIdentifier_ !== moduleIdentifier_ ||
      this.node_.kind !== node_.kind ||
      (this.hasLeadingComments && node.hasLeadingComments) ||
      (this.hasTailingComments && node.hasTailingComments)
    )
      return false;
    // Take and merge binding names from node
    if (this.names_ && node.names_) this.names_ = this.names_.concat(node.names_);
    else if (!this.names_) this.names_ = node.names_;
    if (this.names_) {
      this.names_ = this.names_.sort(nameComparator).reduce((r, n) => {
        if (!r.length) return [n];
        const last = r[r.length - 1];
        return nameComparator(last, n) ? [...r, n] : r;
      }, [] as NameBinding[]);
    }
    node.names_ = undefined;
    // Try to merge default name from node
    if (!this.defaultName_) {
      this.defaultName_ = node.defaultName_;
    } else if (node.defaultName_ && nameComparator(this.defaultName_, node.defaultName_))
      return false;
    node.defaultName_ = undefined;
    // Take comments if any
    if (!this.leadingComments_) this.leadingComments_ = node.leadingComments_;
    if (!this.trailingCommentsText_) this.trailingCommentsText_ = node.trailingCommentsText_;
    node.leadingComments_ = undefined;
    node.trailingCommentsText_ = '';

    return true;
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
      fullStart,
      leadingEmptyLines,
      leadingComments,
      // declLineRange,
      // trailingComments,
      trailingCommentsText,
      declAndCommentsLineRange,
    } = parseLineRanges(node, sourceFile, sourceText);
    // this.declLineRange_ = declLineRange;
    this.declAndCommentsLineRange_ = declAndCommentsLineRange;
    this.leadingComments_ = leadingComments;
    // this.trailingComments_ = trailingComments;
    this.trailingCommentsText_ = trailingCommentsText;
    this.leadingEmptyLines_ = leadingEmptyLines;
    this.fullStart_ = fullStart;
  }

  private get hasLeadingComments() {
    return !!this.leadingComments_ && this.leadingComments_.length > 0;
  }

  private get hasTailingComments() {
    return !!this.trailingCommentsText_;
  }

  private composeImport(config: ComposeConfig) {
    switch (this.node_.kind) {
      case SyntaxKind.ImportDeclaration:
        return this.composeDecl(config);
      case SyntaxKind.ImportEqualsDeclaration:
        return this.composeEqDecl(config);
    }
  }

  // import A = require('B');
  composeEqDecl(config: ComposeConfig) {
    const { quote, semi } = config;
    const path = this.moduleIdentifier_;
    const name = this.defaultName_?.propertyName;
    assertNonNull(name);
    return `import ${name} = require(${quote(path)})${semi}`;
  }

  /**
   * Default name examples:
   * ```
   *    import A from 'B';
   *    import * as A from 'B';
   * ```
   *
   * Binding names examples:
   * ```
   *    import { A, B as C } from 'D';
   *    import {
   *      A, B,
   *      C as D,
   *    } from 'E';
   * ```
   *
   * Mixed examples:
   * ```
   *    import A, { B, C } from 'D';
   *    import * as A, {
   *      B,
   *      C as D,
   *      E,
   *    } from 'F';
   * ```
   */
  composeDecl(config: ComposeConfig) {
    const { maxLength } = config;
    const { text, type } = this.composeDeclImpl(config, false);
    if (maxLength >= text.length || type !== 'line') return text;
    return this.composeDeclImpl(config, true).text;
  }

  composeDeclImpl(config: ComposeConfig, forceWrap: boolean) {
    const { quote, semi } = config;
    const path = this.moduleIdentifier_;
    const { text, type } = composeNames(this.names_, config, forceWrap);
    const names = [composeName(this.defaultName_), text].filter(s => !!s).join(', ');
    return { text: `import ${names} from ${quote(path)}${semi}`, type };
  }
}

export function isNameUsed(nameBinding: NameBinding | undefined, allNames: Set<string>) {
  const name = nameBinding?.aliasName ?? nameBinding?.propertyName;
  return !!name && allNames.has(name);
}

function idComparator(aa: string | undefined, bb: string | undefined) {
  if (aa === undefined) return bb === undefined ? 0 : -1;
  else if (bb === undefined) return 1;
  const a = aa.toLowerCase();
  const b = bb.toLowerCase();
  return a < b ? -1 : a > b ? 1 : aa < bb ? -1 : aa > bb ? 1 : 0;
}

function nameComparator(a: NameBinding | undefined, b: NameBinding | undefined) {
  if (!a) return b ? -1 : 0;
  else if (!b) return 1;
  const { propertyName: pa, aliasName: aa } = a;
  const { propertyName: pb, aliasName: ab } = b;
  return idComparator(pa, pb) || idComparator(aa, ab);
}
