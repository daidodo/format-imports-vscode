import {
  Configuration,
  GroupRule,
} from '../config';
import {
  ImportNode,
  UnusedId,
} from '../parser';

export type SortGroup = GroupRule & { nodes: ImportNode[] };

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
  const { scripts, groups, fallBack } = groupsFromConfig(config);
  nodes.forEach(n => {
    if (n.isScript) return scripts.nodes.push(n);
    for (const g of groups)
      if (!g.flag || (g.flag === 'regex' && n.match(g.regex ?? ''))) return g.nodes.push(n);
    return fallBack.nodes.push(n);
  });
  return groups.filter(g => g.nodes.length > 0);
}

function groupsFromConfig(config: Configuration) {
  const scripts = { flag: 'scripts' as const, nodes: Array<ImportNode>() };
  const fallBack = { flag: 'fall-back' as const, nodes: Array<ImportNode>() };
  const { groupRules } = config;
  if (!groupRules) return { scripts, groups: [scripts, fallBack], fallBack };
  const groups = groupRules.map(r => {
    const nodes: ImportNode[] = [];
    return typeof r === 'string'
      ? !r
        ? { flag: 'fall-back' as const, nodes }
        : { regex: r, nodes }
      : { ...r, nodes };
  });
  const sGroup = groups.find(g => g.flag === 'scripts');
  const fbGroup = groups.find(g => g.flag === 'fall-back');
  return sGroup
    ? fbGroup
      ? { scripts: sGroup, groups, fallBack: fbGroup }
      : { scripts: sGroup, groups: [...groups, fallBack], fallBack }
    : fbGroup
    ? { scripts, groups: [scripts, ...groups], fallBack: fbGroup }
    : { scripts, groups: [scripts, ...groups, fallBack], fallBack };
}

function sortAndMergeNodes(group: SortGroup) {
  const merged = group.nodes
    .sort((a, b) => a.compare(b))
    .reduce((r, n) => {
      if (!r.length) return [n];
      const last = r[r.length - 1];
      if (last.merge(n)) return r;
      return [...r, n];
    }, new Array<ImportNode>());
  merged.forEach(n => n.sortBindingNames());
  // Sort nodes again because binding names may have changed.
  return { ...group, nodes: merged.sort((a, b) => a.compare(b)) };
}
