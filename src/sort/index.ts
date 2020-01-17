import { Configuration } from '../config';
import { ImportNode } from '../parser';

export default function sortImports(
  nodes: ImportNode[],
  usedIds: Set<string>,
  config: Configuration,
) {
  const usedNodes = nodes
    .map(n => n.removeUnusedNames(usedIds))
    .filter((n): n is ImportNode => !!n);
  return groupNodes(usedNodes, config).map(nn => sortAndMergeNodes(nn));
}

function groupNodes(nodes: ImportNode[], config: Configuration) {
  const DEFAULT_LEVEL = 20;
  const { groupRules } = config;
  const groups = new Map<number, ImportNode[]>();
  if (groupRules) {
    nodes.forEach(n => {
      for (const r of groupRules) {
        if (n.match(r.regex)) return addNode(n, r.level, groups);
      }
      addNode(n, DEFAULT_LEVEL, groups);
    });
    return [...groups.entries()].sort(([a], [b]) => a - b).map(([_, n]) => n);
  }
  return [nodes];
}

function addNode(node: ImportNode, level: number, groups: Map<number, ImportNode[]>) {
  const g = groups.get(level) ?? [];
  g.push(node);
  groups.set(level, g);
}

function sortAndMergeNodes(nodes: ImportNode[]) {
  return nodes
    .sort((a, b) => a.compare(b))
    .reduce((r, n) => {
      if (!r.length) return [n];
      const last = r[r.length - 1];
      if (last.mergeAndSortNames(n)) return r;
      return [...r, n];
    }, [] as ImportNode[]);
}
