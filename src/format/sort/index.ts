import { Configuration } from '../../config';
import { ESLintConfigProcessed } from '../config';
import {
  ImportNode,
  KeepUnused,
  NameUsage,
} from '../parser';
import {
  Sorter,
  sorterFromRules,
} from './compare';
import { mergeImportNodes } from './merge';
import SortGroup from './SortGroup';
import { removeUnusedNames } from './unused';

export { Sorter, sorterFromRules, SortGroup };
export function sortImports(
  nodes: ImportNode[],
  usage: NameUsage,
  config: Configuration,
  sorter: Sorter,
  eslint?: ESLintConfigProcessed,
) {
  const { groupRules: subGroups, keepUnused, sortImportsBy } = config;
  // The top group must be a match-all group.
  const group = new SortGroup(
    { flags: 'all', regex: '', subGroups },
    { sorter, sortImportsBy },
    eslint,
  );
  const keepUnusedBouncer = keepUnused && new KeepUnused(keepUnused);
  const left = removeUnusedNames(nodes, usage, keepUnusedBouncer);
  const merged = mergeImportNodes(left);
  merged.forEach(n => group.add(n));
  return group.sort();
}

export { sortAndMergeExportNodes as sortExports } from './merge';
