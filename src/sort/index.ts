import { Configuration } from '../config';
import {
  ImportNode,
  UnusedId,
} from '../parser';
import { configForSort } from './config';
import SortGroup from './SortGroup';

export { SortGroup };

export default function sortImports(
  nodes: ImportNode[],
  usedIds: Set<string>,
  unusedIds: UnusedId[],
  config: Configuration,
) {
  const sortConfig = configForSort(config);
  // The top group must be a match-all group.
  const group = new SortGroup({ flag: 'all', regex: '', subGroups: config.groupRules });
  nodes
    .map(n => n.removeUnusedNames(usedIds, unusedIds))
    .filter((n): n is ImportNode => !!n)
    .forEach(n => group.add(n));
  return group.sortAndMerge(sortConfig);
}
