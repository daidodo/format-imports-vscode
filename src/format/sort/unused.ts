import {
  ImportNode,
  KeepUnused,
  NameUsage,
} from '../parser';

export function removeUnusedNames(
  nodes: ImportNode[],
  usage: NameUsage,
  keepUnused: KeepUnused | undefined,
) {
  nodes.forEach(n => n.removeUnusedNames(usage, keepUnused));
  return nodes.filter(n => !n.empty());
}
