import {
  ExportNode,
  ImportNode,
} from '../parser';
import { NameBinding } from '../types';
import {
  Comparator,
  compareBindingName,
  compareImportNodesByNames,
  compareImportNodesByPaths,
} from './compare';

export function sortAndMergeImportNodes(
  nodes: ImportNode[],
  byPaths: boolean,
  comparePaths?: Comparator,
  compareNames?: Comparator,
) {
  const merged = nodes.reduce(
    (r, n) => (r.some(e => e.merge(n)) ? r : [...r, n]),
    Array<ImportNode>(),
  );
  merged.forEach(n => {
    if (n.binding?.type !== 'named') return;
    n.binding.names = sortAndDedupNames(n.binding.names, compareNames);
    n.checkBindingDefault();
  });
  return byPaths
    ? sortImportNodesByPaths(merged, comparePaths, compareNames)
    : sortImportNodesByNames(merged, compareNames);
}

export function sortAndMergeExportNodes(nodes: ExportNode[], compareNames?: Comparator) {
  nodes
    .reduce((r, n) => (r.some(a => a.merge(n)) ? r : [...r, n]), Array<ExportNode>())
    .forEach(n => (n.names = sortAndDedupNames(n.names, compareNames)));
}

/**
 * Sort names and remove duplicates.
 */
function sortAndDedupNames(names: NameBinding[], compareNames?: Comparator) {
  return compareNames
    ? names
        .sort((a, b) => compareBindingName(a, b, compareNames))
        .reduce((r, a) => {
          // Remove duplicates
          if (!r.length) return [a];
          const l = r[r.length - 1];
          return isEqual(l, a) ? r : [...r, a];
        }, new Array<NameBinding>())
    : names.reduce(
        (r, a) => (r.some(e => isEqual(e, a)) ? r : [...r, a]), // Remove duplicates
        new Array<NameBinding>(),
      );
}

function sortImportNodesByPaths(
  nodes: ImportNode[],
  comparePaths?: Comparator,
  compareNames?: Comparator,
) {
  return comparePaths
    ? nodes.sort((a, b) => compareImportNodesByPaths(a, b, comparePaths, compareNames))
    : nodes;
}

function sortImportNodesByNames(nodes: ImportNode[], compareNames?: Comparator) {
  return compareNames ? nodes.sort((a, b) => compareImportNodesByNames(a, b, compareNames)) : nodes;
}

function isEqual(a: NameBinding, b: NameBinding) {
  return a.aliasName === b.aliasName && a.propertyName === b.propertyName;
}
