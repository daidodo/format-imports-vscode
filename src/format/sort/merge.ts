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

export function mergeImportNodes(nodes: ImportNode[]) {
  const merged = nodes.reduce(
    (r, n) => (r.some(e => e.merge(n)) ? r : [...r, n]),
    Array<ImportNode>(),
  );
  merged.forEach(n => {
    if (n.binding?.type === 'named') n.binding.names = DedupBindingNames(n.binding.names);
  });
  return merged;
}

export function sortImportNodes(
  nodes: ImportNode[],
  byPaths: boolean,
  comparePaths?: Comparator,
  compareNames?: Comparator,
) {
  // Sort binding names
  nodes.forEach(n => {
    if (n.binding?.type !== 'named') return;
    if (compareNames) n.binding.names = sortBindingNames(n.binding.names, compareNames);
    n.checkBindingDefault();
  });
  // Sort imports
  return byPaths
    ? sortImportNodesByPaths(nodes, comparePaths, compareNames)
    : sortImportNodesByNames(nodes, comparePaths, compareNames);
}

export function sortAndMergeExportNodes(nodes: ExportNode[], compareNames?: Comparator) {
  nodes.reduce((r, n) => (r.some(a => a.merge(n)) ? r : [...r, n]), Array<ExportNode>());
  if (compareNames)
    nodes.forEach(n => (n.names = sortBindingNames(DedupBindingNames(n.names), compareNames)));
}

function DedupBindingNames(names: NameBinding[]) {
  return names.reduce(
    (r, a) => (r.some(e => isEqual(e, a)) ? r : [...r, a]), // Remove duplicates
    new Array<NameBinding>(),
  );
}

function sortBindingNames(names: NameBinding[], compareNames: Comparator) {
  return names.sort((a, b) => compareBindingName(a, b, compareNames));
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

function sortImportNodesByNames(
  nodes: ImportNode[],
  comparePaths?: Comparator,
  compareNames?: Comparator,
) {
  return compareNames
    ? nodes.sort((a, b) => compareImportNodesByNames(a, b, comparePaths, compareNames))
    : nodes;
}

function isEqual(a: NameBinding, b: NameBinding) {
  return a.aliasName === b.aliasName && a.propertyName === b.propertyName;
}
