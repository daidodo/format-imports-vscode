import { KeepUnusedRule } from '../config';
import ImportNode from './ImportNode';

export default class KeepUnused {
  private readonly entries: Map<ImportNode, KeepUnusedMatcher[]>;

  constructor(cfg: KeepUnusedRule[] = [], nodes: ImportNode[]) {
    const matchers = cfg.map(entry => new KeepUnusedMatcher(entry));
    this.entries = new Map();

    nodes.forEach(node => {
      const nodeMatchers = matchers.filter(matcher => matcher.matchPath(node.moduleIdentifier));
      if (nodeMatchers.length > 0) {
        this.entries.set(node, nodeMatchers);
      }
    });
  }

  node(node: ImportNode) {
    return this.entries.has(node);
  }

  nameOfNode(node: ImportNode) {
    const matchers = this.entries.get(node);
    return function keepNameOfNode(name: string) {
      return (
        matchers?.some(matcher => {
          return matcher.matchName(name);
        }) ?? false
      );
    };
  }
}

class KeepUnusedMatcher {
  private readonly pathRx: RegExp | null;
  private readonly namesRx: RegExp[] | null;

  constructor(cfg: KeepUnusedRule) {
    let path = null;
    let names = null;
    if (isNonEmptyString(cfg)) {
      path = cfg;
      names = null;
    } else if (cfg) {
      path = cfg.path ?? null;
      names = cfg.names ?? null;
    }
    this.pathRx = path ? new RegExp(path) : null;
    this.namesRx = names
      ? names
          .map(name => (isNonEmptyString(name) ? new RegExp(name) : null))
          .filter((val): val is RegExp => val !== null)
      : null;
  }

  matchPath(path: string) {
    return this.pathRx?.test(path) ?? false;
  }

  matchName(name: string) {
    if (this.namesRx === null || this.namesRx.length === 0) {
      // no names configured, match always
      return true;
    }
    return this.namesRx.some(n => n?.test(name));
  }
}

function isNonEmptyString(value: any): value is string {
  return typeof value === 'string' && value.length > 0;
}
