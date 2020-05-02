import { Configuration } from '../config';
import {
  ImportNode,
  UnusedId,
} from '../parser';
import {
  Sorter,
  sorterFromRules,
} from './compare';
import SortGroup from './SortGroup';

export { SortGroup, Sorter, sorterFromRules };

export function sortImports(
  nodes: ImportNode[],
  // usedIds: Set<string>,
  unusedIds: UnusedId[],
  config: Configuration,
  sorter: Sorter,
) {
  const { sortRules: sort, groupRules: subGroups } = config;
  // The top group must be a match-all group.
  const group = new SortGroup({ flag: 'all', regex: '', sort, subGroups }, sorter);
  nodes
    .map(n => n.removeUnusedNames(unusedIds))
    .filter((n): n is ImportNode => !!n)
    .forEach(n => group.add(n));
  return group.sortAndMerge();
}

export { sortAndMergeExportNodes as sortExports } from './merge';
