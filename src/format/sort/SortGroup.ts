import {
  ComposeConfig,
  FlagSymbol,
  GroupRule,
} from '../../config';
import { ImportNode } from '../parser';
import {
  Sorter,
  sorterFromRules,
  updateSorterWithRules,
} from './compare';
import { sortImportNodes } from './merge';

type FlagsConfig = Required<GroupRule>['flags'];
type SortImportsBy = Required<GroupRule>['sortImportsBy'];

export default class SortGroup {
  private readonly flags_: FlagSymbol[];
  private readonly regex_: RegExp | undefined;
  private readonly sortImportsBy_: SortImportsBy;
  private readonly sorter_: Sorter;
  private readonly subGroups_?: SortGroup[];
  private nodes_: ImportNode[] = []; // Fall-back group for non-script imports
  private scripts_: ImportNode[] = []; // Fall-back group for script imports

  constructor(
    rule: GroupRule,
    parent: { sorter?: Sorter; flags?: FlagSymbol[]; sortImportsBy?: SortImportsBy },
  ) {
    const { flags: originFlags, regex, sortImportsBy, sort, subGroups } = rule;
    const flags = breakFlags(originFlags);
    const flags1 = SortGroup.inferFlags1(flags, parent.flags);
    const sortRules = sort === 'none' ? { paths: 'none' as const, names: 'none' as const } : sort;
    this.regex_ = regex || regex === '' ? RegExp(regex) : undefined;
    this.sortImportsBy_ = sortImportsBy ?? parent.sortImportsBy ?? 'paths';
    this.sorter_ = parent.sorter
      ? updateSorterWithRules(parent.sorter, sortRules)
      : sorterFromRules(sortRules);
    this.subGroups_ = subGroups
      ?.map(r => {
        return typeof r === 'string' ? { regex: r } : Array.isArray(r) ? { subGroups: r } : r;
      })
      .map(
        r =>
          new SortGroup(r, {
            sorter: this.sorter_,
            flags: flags1,
            sortImportsBy: this.sortImportsBy_,
          }),
      );
    this.flags_ = SortGroup.inferFlags2(flags, flags1, this.subGroups_);
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

  sort() {
    const { nodes_, scripts_, sorter_, sortImportsBy_ } = this;
    const { comparePaths, compareNames } = sorter_;
    const byPaths = sortImportsBy_ != 'names';
    this.nodes_ = sortImportNodes(nodes_, byPaths, comparePaths, compareNames);
    // Script imports are always sorted by paths.
    this.scripts_ = sortImportNodes(scripts_, true, comparePaths, compareNames);
    this.subGroups_?.forEach(g => g.sort());
    return this;
  }

  compose(config: ComposeConfig, sep: string): string {
    const { nl } = config;
    return [
      this.scripts_.map(n => n.compose(config)).join(nl),
      ...(this.subGroups_?.map(g => g.compose(config, nl)) ?? []),
      this.nodes_.map(n => n.compose(config)).join(nl),
    ]
      .filter(t => !!t)
      .join(sep);
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
