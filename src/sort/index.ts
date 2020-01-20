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
  const { groups, scripts } = groupNodes(usedNodes, config);
  const sorted = groups.map(ns => sortAndMergeNodes(ns));
  const unique = scripts && uniqueScripts(scripts);
  return unique ? [unique, ...sorted] : sorted;
}

function groupNodes(nodes: ImportNode[], config: Configuration) {
  const DEFAULT_LEVEL = 20;
  const { groupRules } = config;
  const groups = new Map<number, ImportNode[]>();
  const scripts: ImportNode[] = [];
  nodes.forEach(n => {
    if (n.isScriptImport) return scripts.push(n);
    if (groupRules)
      for (const r of groupRules) if (n.match(r.regex)) return addNode(n, r.level, groups);
    addNode(n, DEFAULT_LEVEL, groups);
  });
  return {
    scripts: scripts.length ? scripts : undefined,
    // Sort groups by level.
    groups: [...groups.entries()].sort(([a], [b]) => a - b).map(([_, n]) => n),
  };
}

function addNode(node: ImportNode, level: number, groups: Map<number, ImportNode[]>) {
  const g = groups.get(level) ?? [];
  g.push(node);
  groups.set(level, g);
}

function sortAndMergeNodes(nodes: ImportNode[]) {
  const merged = nodes
    .sort((a, b) => a.compare(b))
    .reduce((r, n) => {
      if (!r.length) return [n];
      const last = r[r.length - 1];
      if (last.merge(n)) return r;
      return [...r, n];
    }, [] as ImportNode[]);
  merged.forEach(n => n.sortBindingNames());
  // Sort nodes again because binding names may have changed.
  return merged.sort((a, b) => a.compare(b));
}

function uniqueScripts(nodes: ImportNode[]) {
  return nodes
    .sort((a, b) => a.rangeAndEmptyLines.start.pos - b.rangeAndEmptyLines.start.pos)
    .filter((a, i, aa) => i === aa.findIndex(b => !a.compare(b)));
}
