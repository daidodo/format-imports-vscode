import {
  FlagSymbol,
  GroupRule,
} from '../../config';
import {
  ComposeConfig,
  ESLintConfigProcessed,
} from '../config';
import { ImportNode } from '../parser';
import {
  Sorter,
  sorterFromRules,
  updateSorterWithRules,
} from './compare';
import { sortImportNodes } from './merge';

type FlagsConfig = Required<GroupRule>['flags'];
type SortImportsBy = Required<GroupRule>['sortImportsBy'];
type SubGroups = Required<GroupRule>['subGroups'];

export default class SortGroup {
  private readonly flags_: FlagSymbol[];
  private readonly regex_: RegExp | undefined;
  private readonly sortImportsBy_: SortImportsBy;
  private readonly sorter_: Sorter;
  private readonly subGroups_?: SortGroup[];
  private readonly eslintGroupOrder_?: FlagSymbol[];
  private nodes_: ImportNode[] = []; // Fall-back group for non-script imports
  private scripts_: ImportNode[] = []; // Fall-back group for script imports
  private ignoreSubGroups_ = false;

  constructor(
    { flags: originFlags, regex, sortImportsBy, sort, subGroups }: GroupRule,
    parent: { sorter: Sorter; flags?: FlagSymbol[]; sortImportsBy?: SortImportsBy },
    eslint?: ESLintConfigProcessed,
  ) {
    const flags = breakFlags(originFlags);
    const flags1 = SortGroup.inferFlags1(flags, parent.flags);
    this.regex_ = regex || regex === '' ? RegExp(regex) : undefined;
    if (eslint?.ignoreSorting) {
      this.sortImportsBy_ = parent.sortImportsBy ?? 'paths';
      this.sorter_ = parent.sorter;
    } else {
      this.sortImportsBy_ = sortImportsBy ?? parent.sortImportsBy ?? 'paths';
      const sortRules = sort === 'none' ? { paths: 'none' as const, names: 'none' as const } : sort;
      this.sorter_ = parent.sorter
        ? updateSorterWithRules(parent.sorter, sortRules)
        : sorterFromRules(sortRules);
    }
    this.subGroups_ = this.calcSubGroups(subGroups, flags1, eslint);
    this.flags_ = SortGroup.inferFlags2(flags, flags1, this.subGroups_);
    this.eslintGroupOrder_ = eslint?.groupOrder;
  }

  /**
   * @param node - The node to be added
   * @param fallBack - Whether to add node if this is a fall-back group
   * @returns Whether node is added to this group
   */
  add(node: ImportNode, fallBack = false) {
    const { flagType, moduleIdentifier } = node;
    if (!isFlagIncluded(flagType, this.flags_)) return false;
    const isScript = flagType === 'scripts';
    if (this.regex_) {
      if (!this.regex_.test(moduleIdentifier)) return false;
      if (this.addToSubGroup(node, fallBack)) return true;
      if (!fallBack && this.addToSubGroup(node, true)) return true;
      isScript ? this.scripts_.push(node) : this.nodes_.push(node);
      return true;
    } else if (!this.subGroups_) {
      if (fallBack) isScript ? this.scripts_.push(node) : this.nodes_.push(node);
      return fallBack;
    }
    return this.addToSubGroup(node, fallBack);
  }

  private addToSubGroup(node: ImportNode, fallBack: boolean) {
    if (!this.subGroups_) return false;
    for (const g of this.subGroups_) if (g.add(node, fallBack)) return true;
    return false;
  }

  /**
   * Sort imports within this group.
   *
   * 1. If `eslintGroupOrder_` is undefined, then sort `scripts_`, `nodes_` and `subGroups_`
   *    based on user config.
   * 2. Otherwise:
   *    * If this is the top group (`level === 0`), then:
   *      * Sort `nodes_` (fallback group) and `scripts_` based on ESLint and user config,
   *        though `scripts_` will be the same regardless of ESLint config.
   *      * Sort `subGroups_` (user config groups) based on their rules.
   *    * If this is the user config group (`level === 1`), then:
   *      * Disregard `subGroups_`.
   *      * Merge all imports together and sort them based on ESLint and user config.
   *    * Else, no sort is needed.
   */
  sort(level: number) {
    const { nodes_, scripts_, sorter_, sortImportsBy_, eslintGroupOrder_: flags } = this;
    if (flags && level > 1) return this;
    const byPaths = sortImportsBy_ != 'names';
    this.nodes_ = flags
      ? sortNodesByFlags(level === 0 ? nodes_ : this.allNodes_, flags, byPaths, sorter_)
      : sortImportNodes(nodes_, byPaths, sorter_);
    if (flags && level === 1) {
      this.scripts_ = [];
      this.ignoreSubGroups_ = true;
    } else {
      // Script imports are always sorted by paths.
      this.scripts_ = sortImportNodes(scripts_, true, sorter_);
      this.subGroups_?.forEach(g => g.sort(level + 1));
    }
    return this;
  }

  compose(config: ComposeConfig, sep: string): string {
    const { nl } = config;
    const subGroups = this.ignoreSubGroups_
      ? []
      : this.subGroups_?.map(g => g.compose(config, nl)) ?? [];
    return [
      this.scripts_.map(n => n.compose(config)).join(nl),
      ...subGroups,
      this.nodes_.map(n => n.compose(config)).join(nl),
    ]
      .filter(t => !!t)
      .join(sep);
  }

  private calcSubGroups(
    groupRules: SubGroups | undefined,
    flags: FlagSymbol[],
    eslint?: ESLintConfigProcessed,
  ) {
    return groupRules
      ?.map(r => {
        return typeof r === 'string' ? { regex: r } : Array.isArray(r) ? { subGroups: r } : r;
      })
      .map(
        r =>
          new SortGroup(
            r,
            { sorter: this.sorter_, flags, sortImportsBy: this.sortImportsBy_ },
            eslint,
          ),
      );
  }

  private get allNodes_(): ImportNode[] {
    return (this.subGroups_ ?? []).reduce((r, g) => [...r, ...g.allNodes_], [
      ...this.scripts_,
      ...this.nodes_,
    ]);
  }

  /**
   * Infer flags (step 1) from current config (flags) and parent's flags.
   */
  private static inferFlags1(flags: FlagSymbol[], parentFlags: FlagSymbol[] | undefined) {
    const bp = parentFlags ? breakFlags(parentFlags) : [];
    return flags.length > 0 ? flags : removeScriptsIfCombined(bp);
  }

  /**
   * Infer flags (step 2) from children's flags.
   */
  private static inferFlags2(flags: FlagSymbol[], flags1: FlagSymbol[], subGroups?: SortGroup[]) {
    if (flags.length > 0) return flags;
    const childrenFlags = subGroups?.reduce<FlagSymbol[]>((r, g) => [...r, ...g.flags_], []);
    return childrenFlags && childrenFlags.length > 0 ? dedupFlags(childrenFlags) : flags1;
  }
}

function dedupFlags(flags: FlagSymbol[]) {
  return [...new Set(flags)];
}

function breakFlags(flags: FlagsConfig | undefined) {
  if (!flags) return [];
  const f = typeof flags === 'string' ? [flags] : flags;
  return dedupFlags(f.reduce<FlagSymbol[]>((r, f) => [...r, ...breakFlag(f)], []));
}

function breakFlag(flag: FlagSymbol): FlagSymbol[] {
  switch (flag) {
    case 'all':
      return ['scripts', ...breakFlag('named')];
    case 'named':
      return ['multiple', 'single', 'namespace'];
    default:
      return [flag];
  }
}

function removeScriptsIfCombined(flags: FlagSymbol[]) {
  return flags.length > 1 ? flags.filter(f => f !== 'scripts') : flags;
}

function isFlagIncluded(flag: FlagSymbol, flags: FlagSymbol[]) {
  return flags.some(f => f === flag);
}

/**
 * First group `nodes` in the order defined by `flags`, then sort nodes inside each group.
 * Please note `flags` must be ATOMIC, i.e. neither 'all' nor 'named'.
 */
function sortNodesByFlags(
  nodes: ImportNode[],
  flags: FlagSymbol[],
  byPath: boolean,
  sorter: Sorter,
) {
  const order = flags.map(f => ({ flag: f, nodes: new Array<ImportNode>() }));
  const fallback: ImportNode[] = [];
  nodes.forEach(n => (order.find(g => g.flag === n.flagType)?.nodes ?? fallback).push(n));
  const groups = [...order.map(({ nodes }) => nodes), fallback];
  return groups.reduce((r, g) => [...r, ...sortImportNodes(g, byPath, sorter)], []);
}
