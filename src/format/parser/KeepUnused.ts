import { KeepUnusedConfig } from '../config';
import {
  ImportNode,
  NameUsage,
} from './';

export default class KeepUnused {
  private readonly path: RegExp;
  private readonly names: RegExp[];

  constructor(cfg: KeepUnusedConfig) {
    if (typeof cfg === 'string') {
      this.path = new RegExp(cfg);
      this.names = [];
    } else {
      this.path = new RegExp(cfg.path);
      this.names = cfg.names?.map(name => new RegExp(name)) ?? [];
    }
  }

  public matchImportNode(node: ImportNode) {
    return this.path.test(node.moduleIdentifier);
  }
}

export function filterUsageToKeep(
  usage: NameUsage,
  keepUnused: KeepUnused[] | undefined,
): NameUsage {
  if (!keepUnused) {
    return usage;
  }
  return {
    usedNames: usage.usedNames,
    unusedNodes: usage.unusedNodes?.filter(node =>
      keepUnused.some(entry => entry.matchImportNode(node)),
    ),
    unusedNames: usage.unusedNames, // ??? How to pair it with path
  };
}
