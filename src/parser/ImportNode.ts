import {
  ImportClause,
  ImportDeclaration,
  ImportEqualsDeclaration,
  NamedImportBindings,
  StringLiteral,
  SyntaxKind,
} from 'typescript';

import {
  composeNodeAsNames,
  composeNodeAsParts,
} from '../compose';
import { ComposeConfig } from '../config';
import {
  Binding,
  NameBinding,
} from '../types';
import {
  assertNonNull,
  normalizePath,
} from '../utils';
import { getNameBinding } from './helper';
import Statement, { StatementArgs } from './Statement';
import { NameUsage } from './unused';

export default class ImportNode extends Statement {
  private readonly node_: ImportDeclaration | ImportEqualsDeclaration;

  readonly moduleIdentifier: string;
  readonly isScript: boolean;
  private defaultName_?: string;
  private binding_?: Binding;

  static fromDecl(node: ImportDeclaration, args: StatementArgs) {
    const { importClause, moduleSpecifier } = node;
    if (!moduleSpecifier || moduleSpecifier.kind !== SyntaxKind.StringLiteral) return undefined;
    const moduleIdentifier = (moduleSpecifier as StringLiteral).text;
    if (!moduleIdentifier.trim()) return undefined;
    const { defaultName, binding, isScript } = getDefaultAndBinding(importClause);
    return new ImportNode(node, moduleIdentifier, args, defaultName, binding, isScript);
  }

  static fromEqDecl(node: ImportEqualsDeclaration, args: StatementArgs) {
    const { moduleReference } = node;
    if (!moduleReference || moduleReference.kind !== SyntaxKind.ExternalModuleReference)
      return undefined;
    const { expression } = moduleReference;
    if (!expression || expression.kind !== SyntaxKind.StringLiteral) return undefined;
    const moduleIdentifier = (expression as StringLiteral).text;
    const defaultName = node.name.text;
    return new ImportNode(node, moduleIdentifier, args, defaultName);
  }

  private constructor(
    node: ImportDeclaration | ImportEqualsDeclaration,
    moduleIdentifier: string,
    args: StatementArgs,
    defaultName?: string,
    binding?: Binding,
    isScript = false,
  ) {
    super(args);
    this.node_ = node;
    this.moduleIdentifier = normalizePath(moduleIdentifier);
    this.defaultName_ = defaultName;
    this.binding_ = binding;
    this.isScript = isScript;
  }

  get defaultName() {
    return this.defaultName_;
  }

  get binding() {
    return this.binding_;
  }

  allNames() {
    const r: string[] = [];
    if (this.defaultName_) r.push(this.defaultName_);
    if (this.binding_?.type === 'namespace') r.push(this.binding_.alias);
    else if (this.binding_?.type === 'named') {
      const names = this.binding_.names.map(n => n.aliasName ?? n.propertyName);
      r.push(...names);
    }
    return r;
  }

  empty() {
    return !this.isScript && !this.defaultName_ && !this.binding_;
  }

  removeUnusedNames(usage: NameUsage) {
    const { unusedNodes } = usage;
    if (this.isScript) return;
    if (unusedNodes && unusedNodes.includes(this)) {
      this.defaultName_ = undefined;
      this.binding_ = undefined;
      return;
    }
    if (!isNameUsed(this.defaultName_, usage)) this.defaultName_ = undefined;
    if (this.binding_) {
      if (this.binding_.type === 'named') {
        this.binding_.names = this.binding_.names.filter(n => isNameUsed(n, usage));
        if (!this.binding_.names.length) this.binding_ = undefined;
      } else if (!isNameUsed(this.binding_.alias, usage)) this.binding_ = undefined;
    }
  }

  compose(config: ComposeConfig) {
    const { leadingText, trailingText, tailingLength } = this.composeComments(config);
    const importText = this.composeImport(tailingLength, config);
    return leadingText + importText + trailingText;
  }

  /**
   * @returns true if `node` is fully merged to `this`;
   *          false if `node` still has names or comments thus can't be ignored.
   */
  merge(node: ImportNode) {
    const { moduleIdentifier, node_ } = node;
    if (
      this.moduleIdentifier !== moduleIdentifier ||
      this.node_.kind !== node_.kind ||
      !this.canMergeComments(node)
    )
      return false;
    this.removeBindingDefault(node.defaultName_);
    node.removeBindingDefault(this.defaultName_);
    const r1 = this.mergeBinding(node);
    const r2 = this.mergeDefaultName(node);
    return r1 && r2 && this.mergeComments(node);
  }

  checkBindingDefault() {
    // `import A, {default as A} from 'x'` => `import A from 'x'`
    if (this.defaultName_) this.removeBindingDefault(this.defaultName_);
    // `import {default as A} from 'x'` => `import A from 'x'`
    else this.defaultName_ = this.pickBindingDefault();
  }

  private removeBindingDefault(defaultName?: string) {
    if (!defaultName || this.binding_?.type !== 'named') return;
    this.binding_.names = this.binding_.names.filter(
      a => a.aliasName !== defaultName || a.propertyName !== 'default',
    );
    if (this.binding_.names.length < 1) this.binding_ = undefined;
  }

  private pickBindingDefault() {
    if (this.binding_?.type !== 'named') return undefined;
    const name = this.binding_.names.find(a => a.propertyName === 'default')?.aliasName;
    this.removeBindingDefault(name);
    return name;
  }

  private mergeBinding(node: ImportNode) {
    const { binding_: b1 } = this;
    const { binding_: b2 } = node;
    if (!b2) return true;
    else if (!b1) {
      this.binding_ = b2;
      node.binding_ = undefined;
      return true;
    } else if (b1.type === 'namespace') {
      if (b2.type === 'namespace' && b1.alias === b2.alias) {
        node.binding_ = undefined;
        return true;
      }
      return false;
    } else if (b2.type === 'namespace') return false;
    b1.names.push(...b2.names);
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
    const { semi } = config;
    const extraLength = commentLength + semi.length;
    switch (this.node_.kind) {
      case SyntaxKind.ImportDeclaration:
        return this.composeDecl(extraLength, config) + semi;
      case SyntaxKind.ImportEqualsDeclaration:
        return this.composeEqDecl(extraLength, config) + semi;
    }
  }

  // import A = require('B');
  private composeEqDecl(extraLength: number, config: ComposeConfig) {
    const { quote } = config;
    const path = this.moduleIdentifier;
    const name = this.defaultName_;
    assertNonNull(name);
    const parts = [`${name} =`];
    const from = `require(${quote(path)})`;
    return composeNodeAsParts(parts, from, extraLength, config);
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
  private composeDecl(extraLength: number, config: ComposeConfig) {
    const { quote } = config;
    const path = this.moduleIdentifier;
    const ending = quote(path);
    if (this.isScript) return `import ${ending}`;
    const from = `from ${ending}`;
    if (this.binding_?.type === 'named')
      return composeNodeAsNames(
        'import',
        this.defaultName_,
        this.binding_.names,
        from,
        extraLength,
        config,
      );
    const parts = [];
    if (this.defaultName_) parts.push(this.defaultName_);
    if (this.binding_?.type === 'namespace') parts.push(`* as ${this.binding_.alias}`);
    return composeNodeAsParts(parts, from, extraLength, config);
  }
}

function isNameUsed(name: NameBinding | string | undefined, usage: NameUsage) {
  if (!name) return false;
  const { unusedNames, usedNames } = usage;
  const n = typeof name === 'string' ? name : name.aliasName ?? name.propertyName;
  if (!n) return false;
  // `unusedNames` (from TS compiler) gives more accurate results
  // than `usedNames` (from manual parsing).
  if (unusedNames) return !unusedNames.has(n);
  if (usedNames) return usedNames.has(n);
  return true; // Keep it for safety
}

function getDefaultAndBinding(importClause: ImportClause | undefined) {
  if (!importClause) return { isScript: true };
  const { name, namedBindings } = importClause;
  const defaultName = name && name.text;
  const binding = getBinding(namedBindings);
  return { defaultName, binding, isScript: false };
}

function getBinding(nb: NamedImportBindings | undefined): Binding | undefined {
  if (!nb) return undefined;
  if (nb.kind === SyntaxKind.NamespaceImport) return { type: 'namespace', alias: nb.name.text };
  const names = nb.elements.map(getNameBinding);
  return names.length < 1 ? undefined : { type: 'named', names };
}
