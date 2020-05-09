import {
  ExportNode,
  ImportNode,
  NameBinding,
} from '../parser';
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
  const merged = nodes.reduce(
    (r, n) => (r.some(e => e.merge(n)) ? r : [...r, n]),
    Array<ImportNode>(),
  );
  merged.forEach(n => {
    if (n.binding?.type !== 'named') return;
    n.binding.names = mergeNames(n.binding.names, compareNames);
    n.checkBindingDefault();
  });
  return comparePaths
    ? merged.sort((a, b) => compareNodes(a, b, comparePaths, compareNames))
    : merged;
}

export function sortAndMergeExportNodes(nodes: ExportNode[], compareNames?: Comparator) {
  nodes
    .reduce((r, n) => (r.some(a => a.merge(n)) ? r : [...r, n]), Array<ExportNode>())
    .forEach(n => (n.names = mergeNames(n.names, compareNames)));
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
