import { Configuration } from '../config';
import {
  ExportNode,
  ImportNode,
  UnusedId,
} from '../parser';
import {
  comparatorFromRule,
  Sorter,
  sorterFromRules,
} from './compare';
import { sortAndMergeExportNodes } from './merge';
import SortGroup from './SortGroup';

export { SortGroup, Sorter };

export function sortImports(
  nodes: ImportNode[],
  // usedIds: Set<string>,
  unusedIds: UnusedId[],
  config: Configuration,
) {
  const { sortRules: sort, groupRules: subGroups } = config;
  const sorter = sorterFromRules(sort);
  // The top group must be a match-all group.
  const group = new SortGroup({ flag: 'all', regex: '', sort, subGroups }, sorter);
  nodes
    .map(n => n.removeUnusedNames(unusedIds))
    .filter((n): n is ImportNode => !!n)
    .forEach(n => group.add(n));
  return { groups: group.sortAndMerge(), sorter };
}

export function sortExports(nodes: ExportNode[], config: Configuration, sorter?: Sorter) {
  const compareNames = sorter?.compareNames ?? comparatorFromRule(config.sortRules?.names);
  sortAndMergeExportNodes(nodes, compareNames);
}
