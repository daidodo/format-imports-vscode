import { Configuration } from '../config';
import {
  ImportNode,
  KeepUnused,
  NameUsage,
} from '../parser';
import {
  Sorter,
  sorterFromRules,
} from './compare';
import SortGroup from './SortGroup';

export { Sorter, sorterFromRules, SortGroup };

export function sortImports(
  nodes: ImportNode[],
  usage: NameUsage,
  config: Configuration,
  sorter: Sorter,
) {
  const { sortRules: sort, groupRules: subGroups, keepUnused, sortImportsBy } = config;
  // The top group must be a match-all group.
  const group = new SortGroup(
    { flag: 'all', regex: '', sort, subGroups, sortImportsBy },
    { sorter },
  );
  const keepUnusedBouncer = keepUnused && new KeepUnused(keepUnused);
  nodes.forEach(n => {
    n.removeUnusedNames(usage, keepUnusedBouncer);
    if (!n.empty()) group.add(n);
  });
  return group.sortAndMerge();
}

export { sortAndMergeExportNodes as sortExports } from './merge';
