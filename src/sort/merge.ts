import {
  ImportNode,
  NameBinding,
} from '../parser';
import ExportNode from '../parser/ExportNode';
import {
  Comparator,
  compareBindingName,
  compareNodes,
} from './compare';

export function sortAndMergeImportNodes(
  nodes: ImportNode[],
  comparePaths?: Comparator,
  compareNames?: Comparator,
) {
  const merged = mergeImportNodes(nodes, comparePaths, compareNames);
  merged.forEach(({ binding }) => {
    if (binding?.type !== 'named') return;
    binding.names = mergeNames(binding.names, compareNames);
  });
  return comparePaths && compareNames
    ? // Sort nodes again because first binding name may have changed.
      merged.sort((a, b) => compareNodes(a, b, comparePaths, compareNames))
    : merged;
}

export function sortAndMergeExportNodes(nodes: ExportNode[], compareNames?: Comparator) {
  nodes
    .reverse() // Merge exports to the last to avoid 'used before defined' error.
    .reduce((r, n) => (r.some(a => a.merge(n)) ? r : [...r, n]), Array<ExportNode>())
    .forEach(n => (n.names = mergeNames(n.names, compareNames)));
}

function mergeImportNodes(
  nodes: ImportNode[],
  comparePaths?: Comparator,
  compareNames?: Comparator,
) {
  return comparePaths
    ? nodes
        .sort((a, b) => compareNodes(a, b, comparePaths, compareNames))
        .reduce((r, n) => {
          if (!r.length) return [n];
          const last = r[r.length - 1];
          if (last.merge(n)) return r;
          return [...r, n];
        }, new Array<ImportNode>())
    : nodes.reduce((r, n) => (r.some(e => e.merge(n)) ? r : [...r, n]), new Array<ImportNode>());
}

function mergeNames(names: NameBinding[], compareNames?: Comparator) {
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

function isEqual(a: NameBinding, b: NameBinding) {
  return a.aliasName === b.aliasName && a.propertyName === b.propertyName;
}
