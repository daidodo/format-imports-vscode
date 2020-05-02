import { Configuration } from '../config';
import { ImportNode } from '../parser';
import {
  Sorter,
  sorterFromRules,
} from './compare';
import SortGroup from './SortGroup';

export { SortGroup, Sorter, sorterFromRules };

export function sortImports(
  nodes: ImportNode[],
  unusedNames: Set<string>,
  unusedNodes: ImportNode[],
  config: Configuration,
  sorter: Sorter,
) {
  const { sortRules: sort, groupRules: subGroups } = config;
  // The top group must be a match-all group.
  const group = new SortGroup({ flag: 'all', regex: '', sort, subGroups }, sorter);
  nodes.forEach(n => {
    n.removeUnusedNames(unusedNames, unusedNodes);
    if (!n.empty()) group.add(n);
  });
  return group.sortAndMerge();
}

export { sortAndMergeExportNodes as sortExports } from './merge';
