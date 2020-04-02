import { Configuration } from '../config';
import {
  ImportNode,
  UnusedId,
} from '../parser';

export default function sortImports(
  nodes: ImportNode[],
  usedIds: Set<string>,
  unusedIds: UnusedId[],
  config: Configuration,
) {
  const usedNodes = nodes
    .map(n => n.removeUnusedNames(usedIds, unusedIds))
    .filter((n): n is ImportNode => !!n);
  return groupNodes(usedNodes, config).map(g => sortAndMergeNodes(g));
}

function groupNodes(nodes: ImportNode[], config: Configuration) {
  const scripts: ImportNode[] = [];
  const { groups, fallBackGroup } = groupsFromConfig(config);
  nodes.forEach(n => {
    if (n.isScript) return scripts.push(n);
    if (groups) for (const g of groups) if (g.regex && n.match(g.regex)) return g.nodes.push(n);
    return fallBackGroup.nodes.push(n);
  });
  return [scripts, ...groups.map(g => g.nodes)].filter(g => g.length > 0);
}

function groupsFromConfig(config: Configuration) {
  const fallBackGroup = { regex: '', nodes: Array<ImportNode>() };
  const { groupRules } = config;
  if (!groupRules) return { groups: [fallBackGroup], fallBackGroup };
  const groups = groupRules.map(r =>
    typeof r === 'string'
      ? { regex: r, nodes: Array<ImportNode>() }
      : { ...r, nodes: Array<ImportNode>() },
  );
  const fbGroup = groups.find(g => !g.regex);
  return fbGroup
    ? { groups, fallBackGroup: fbGroup }
    : { groups: [...groups, fallBackGroup], fallBackGroup };
}

function sortAndMergeNodes(nodes: ImportNode[]) {
  const merged = nodes
    .sort((a, b) => a.compare(b))
    .reduce((r, n) => {
      if (!r.length) return [n];
      const last = r[r.length - 1];
      if (last.merge(n)) return r;
      return [...r, n];
    }, new Array<ImportNode>());
  merged.forEach(n => n.sortBindingNames());
  // Sort nodes again because binding names may have changed.
  return merged.sort((a, b) => a.compare(b));
}
