import {
  ImportClause,
  ImportDeclaration,
  ImportEqualsDeclaration,
  NamedImportBindings,
  StringLiteral,
  SyntaxKind,
} from 'typescript';

import {
  composeComments,
  composeNodeAsNames,
  composeNodeAsParts,
} from '../compose';
import { ComposeConfig } from '../config';
import {
  assertNonNull,
  normalizePath,
} from '../utils';
import {
  Binding,
  NameBinding,
  NodeComment,
  RangeAndEmptyLines,
  UnusedId,
} from './types';
import { UnusedCode } from './unused';

export default class ImportNode {
  private readonly node_: ImportDeclaration | ImportEqualsDeclaration;

  private readonly moduleIdentifier_: string;
  private defaultName_?: string;
  private binding_?: Binding;

  readonly range: RangeAndEmptyLines;
  private leadingComments_?: NodeComment[];
  private trailingCommentsText_: string;

  static fromDecl(
    node: ImportDeclaration,
    range: RangeAndEmptyLines,
    leadingComments: NodeComment[] | undefined,
    trailingCommentsText: string,
  ) {
    const { importClause, moduleSpecifier } = node;
    if (moduleSpecifier.kind !== SyntaxKind.StringLiteral) return undefined;
    const moduleIdentifier = (moduleSpecifier as StringLiteral).text;
    const { defaultName, binding } = getDefaultAndBinding(importClause);
    return new ImportNode(
      node,
      moduleIdentifier,
      range,
      leadingComments,
      trailingCommentsText,
      defaultName,
      binding,
    );
  }

  static fromEqDecl(
    node: ImportEqualsDeclaration,
    range: RangeAndEmptyLines,
    leadingComments: NodeComment[] | undefined,
    trailingCommentsText: string,
  ) {
    const { moduleReference } = node;
    if (moduleReference.kind !== SyntaxKind.ExternalModuleReference) return undefined;
    const { expression } = moduleReference;
    if (expression.kind !== SyntaxKind.StringLiteral) return undefined;
    const moduleIdentifier = (expression as StringLiteral).text;
    const defaultName = node.name.text;
    return new ImportNode(
      node,
      moduleIdentifier,
      range,
      leadingComments,
      trailingCommentsText,
      defaultName,
    );
  }

  private constructor(
    node: ImportDeclaration | ImportEqualsDeclaration,
    moduleIdentifier: string,
    range: RangeAndEmptyLines,
    leadingComments: NodeComment[] | undefined,
    trailingCommentsText: string,
    defaultName?: string,
    binding?: Binding,
  ) {
    this.node_ = node;
    this.moduleIdentifier_ = normalizePath(moduleIdentifier);
    this.range = range;
    this.leadingComments_ = leadingComments;
    this.trailingCommentsText_ = trailingCommentsText;
    this.defaultName_ = defaultName;
    this.binding_ = binding;
  }

  get isScript() {
    return !this.defaultName_ && !this.binding_;
  }

  removeUnusedNames(allNames: Set<string>, unusedIds: UnusedId[]) {
    if (this.isScript) return this;
    const withinRange = unusedIds.filter(r => this.withinDeclRange(r.pos));
    if (withinRange.some(u => u.code === UnusedCode.ALL)) return undefined;
    const unusedNames = new Set(withinRange.map(r => r.id).filter((id): id is string => !!id));
    if (!isNameUsed(this.defaultName_, allNames, unusedNames)) this.defaultName_ = undefined;
    if (this.binding_) {
      if (this.binding_.type === 'named') {
        this.binding_.names = this.binding_.names.filter(n => isNameUsed(n, allNames, unusedNames));
        if (!this.binding_.names.length) this.binding_ = undefined;
      } else if (!isNameUsed(this.binding_.alias, allNames, unusedNames)) this.binding_ = undefined;
    }
    return this.defaultName_ || this.binding_ ? this : undefined;
  }

  match(regex: string) {
    return new RegExp(regex).test(this.moduleIdentifier_);
  }

  compare(node: ImportNode) {
    return (
      compareId(this.moduleIdentifier_, node.moduleIdentifier_) ||
      compareDefaultName(this.defaultName_, node.defaultName_) ||
      compareBinding(this.binding_, node.binding_)
    );
  }

  compose(config: ComposeConfig) {
    const leadingText = composeComments(this.leadingComments_, config) ?? '';
    const trailingText = this.trailingCommentsText_;
    const cmLen = trailingText.split(/\r?\n/)?.[0]?.length ?? 0;
    const importText = this.composeImport(cmLen, config);
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
      (this.hasTrailingComments && node.hasTrailingComments)
    )
      return false;
    const r1 = this.mergeBinding(node);
    const r2 = this.mergeDefaultName(node);
    const r = r1 && r2;
    // Take comments if can merge
    if (r) {
      if (!this.leadingComments_) this.leadingComments_ = node.leadingComments_;
      if (!this.trailingCommentsText_) this.trailingCommentsText_ = node.trailingCommentsText_;
      node.leadingComments_ = undefined;
      node.trailingCommentsText_ = '';
    }
    return r;
  }

  sortBindingNames() {
    if (this.binding_?.type === 'named')
      this.binding_.names = this.binding_.names
        .sort((a, b) => compareBindingName(a, b))
        .reduce((r, a) => {
          if (!r.length) return [a];
          const l = r[r.length - 1];
          return compareBindingName(l, a) ? [...r, a] : r;
        }, new Array<NameBinding>());
  }

  private get hasLeadingComments() {
    return !!this.leadingComments_ && this.leadingComments_.length > 0;
  }

  private get hasTrailingComments() {
    return !!this.trailingCommentsText_;
  }

  private withinDeclRange(pos: number) {
    const { start, end } = this.range;
    return start.pos <= pos && pos < end.pos;
  }

  private mergeBinding(node: ImportNode) {
    if (!node.binding_) return true;
    else if (this.binding_ === undefined) {
      this.binding_ = node.binding_;
      node.binding_ = undefined;
      return true;
    } else if (this.binding_.type === 'namespace') {
      if (node.binding_.type === 'namespace' && this.binding_.alias === node.binding_.alias) {
        node.binding_ = undefined;
        return true;
      }
      return false;
    } else if (node.binding_.type === 'namespace') return false;
    this.binding_.names = [...this.binding_.names, ...node.binding_.names];
    node.binding_ = undefined;
    return true;
  }

  private mergeDefaultName(node: ImportNode) {
    if (this.defaultName_ && node.defaultName_ && this.defaultName_ !== node.defaultName_)
      return false;
    if (!this.defaultName_) this.defaultName_ = node.defaultName_;
    node.defaultName_ = undefined;
    return true;
  }

  private composeImport(commentLength: number, config: ComposeConfig) {
    switch (this.node_.kind) {
      case SyntaxKind.ImportDeclaration:
        return this.composeDecl(commentLength, config);
      case SyntaxKind.ImportEqualsDeclaration:
        return this.composeEqDecl(commentLength, config);
    }
  }

  // import A = require('B');
  private composeEqDecl(commentLength: number, config: ComposeConfig) {
    const { quote, semi } = config;
    const path = this.moduleIdentifier_;
    const name = this.defaultName_;
    assertNonNull(name);
    const parts = [`${name} =`];
    const from = `require(${quote(path)})${semi}`;
    return composeNodeAsParts(parts, from, commentLength, config);
  }

  /**
   * Script import:
   * ```
   *    import 'A';
   * ```
   *
   * Default import:
   * ```
   *    import A from 'B';
   * ```
   *
   * Binding names import:
   * ```
   *    import { A, B as C } from 'D';
   *    import {
   *      A, B,
   *      C as D,
   *    } from 'E';
   * ```
   *
   * Namespace import:
   * ```
   *    import * as A from 'B';
   * ```
   *
   * Mixed examples:
   * ```
   *    import A, { B, C } from 'D';
   *    import A, {
   *      B,
   *      C as D,
   *      E,
   *    } from 'F';
   *    import A, * as B from 'C';
   *    import A, { default as B, C, D } from 'E';
   * ```
   */
  private composeDecl(commentLength: number, config: ComposeConfig) {
    const { quote, semi } = config;
    const path = this.moduleIdentifier_;
    const ending = quote(path) + semi;
    if (this.isScript) return `import ${ending}`;
    const from = `from ${ending}`;
    if (this.binding_?.type === 'named')
      return composeNodeAsNames(
        this.defaultName_,
        this.binding_.names,
        from,
        commentLength,
        config,
      );
    const parts = [];
    if (this.defaultName_) parts.push(this.defaultName_);
    if (this.binding_?.type === 'namespace') parts.push(`* as ${this.binding_.alias}`);
    return composeNodeAsParts(parts, from, commentLength, config);
  }
}

function isNameUsed(
  name: NameBinding | string | undefined,
  allNames: Set<string>,
  unusedNames: Set<string>,
) {
  if (!name) return false;
  const n = typeof name === 'string' ? name : name.aliasName ?? name.propertyName;
  return !!n && allNames.has(n) && !unusedNames.has(n);
}

function getDefaultAndBinding(importClause: ImportClause | undefined) {
  if (!importClause) return {};
  const { name, namedBindings } = importClause;
  let defaultName = name && name.text;
  const binding = getBinding(namedBindings);
  if (!defaultName && binding?.type === 'named') {
    const { names } = binding;
    const i = names.findIndex(n => n.propertyName === 'default' && n.aliasName);
    if (i >= 0) {
      defaultName = names[i].aliasName;
      names.splice(i, 1);
    }
  }
  return { defaultName, binding };
}

function getBinding(nb: NamedImportBindings | undefined): Binding | undefined {
  if (!nb) return;
  if (nb.kind === SyntaxKind.NamespaceImport) return { type: 'namespace', alias: nb.name.text };
  const names = nb.elements.map(e => {
    const { name, propertyName } = e;
    return propertyName
      ? { aliasName: name.text, propertyName: propertyName.text }
      : { propertyName: name.text };
  });
  return { type: 'named', names };
}

/**
 * @param def - If true, 'default' is less than any other non-empty strings
 */
function compareId(aa: string | undefined, bb: string | undefined, def?: boolean) {
  if (!aa) return bb ? -1 : 0;
  if (!bb) return 1;
  if (def) {
    if (aa === 'default') return bb === 'default' ? 0 : -1;
    if (bb === 'default') return 1;
  }
  const a = aa.toLowerCase();
  const b = bb.toLowerCase();
  return a < b ? -1 : a > b ? 1 : aa < bb ? 1 : aa > bb ? -1 : 0;
}

function compareDefaultName(a: string | undefined, b: string | undefined) {
  if (!a) return b ? 1 : 0;
  if (!b) return -1;
  return compareId(a, b);
}

function compareBinding(a: Binding | undefined, b: Binding | undefined) {
  if (!a) return b ? -1 : 0;
  if (!b) return 1;
  if (a.type === 'named' && b.type === 'named') return compareBindingName(a.names[0], b.names[0]);
  if (a.type === 'named') return 1;
  if (b.type === 'named') return -1;
  return compareId(a.alias, b.alias);
}

function compareBindingName(a: NameBinding | undefined, b: NameBinding | undefined) {
  if (!a) return b ? -1 : 0;
  else if (!b) return 1;
  const { propertyName: pa, aliasName: aa } = a;
  const { propertyName: pb, aliasName: ab } = b;
  // Put 'default as X' in front of any other binding names to highlight.
  return compareId(pa, pb, true) || compareId(aa, ab);
}
