import { assertNonNull } from '../../common';
import {
  ComposeConfig,
  GroupRule,
} from '../config';
import { ImportNode } from '../parser';
import {
  Sorter,
  sorterFromRules,
  updateSorterWithRules,
} from './compare';
import { sortAndMergeImportNodes } from './merge';

type Flag = GroupRule['flag'];
type SortImportsBy = Required<GroupRule>['sortImportsBy'];

export default class SortGroup {
  private readonly flag_: Flag;
  private readonly regex_: RegExp | undefined;
  private readonly sortImportsBy_: SortImportsBy;
  private readonly sorter_: Sorter;
  private readonly subGroups_?: SortGroup[];
  private nodes_: ImportNode[] = []; // Fall-back group for non-script imports
  private scripts_: ImportNode[] = []; // Fall-back group for script imports

  constructor(
    rule: GroupRule,
    parent: { sorter?: Sorter; flag?: Flag; sortImportsBy?: SortImportsBy },
  ) {
    const { flag, regex, sortImportsBy, sort, subGroups } = rule;
    const flag1 = SortGroup.inferFlag1(flag, parent.flag);
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
            flag: flag1,
            sortImportsBy: this.sortImportsBy_,
          }),
      );
    this.flag_ = SortGroup.inferFlag2(flag1, this.subGroups_);
  }

  /**
   * @param node - The node to be added
   * @param fallBack - Whether to add node if this is a fall-back group
   * @returns Whether node is added to this group
   */
  add(node: ImportNode, fallBack = false) {
    const { isScript, moduleIdentifier } = node;
    if (this.flag_ === 'scripts' && !isScript) return false;
    if (this.flag_ === 'named' && isScript) return false;
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

  sortAndMerge() {
    const { nodes_, scripts_, sorter_, sortImportsBy_ } = this;
    const { comparePaths, compareNames } = sorter_;
    const byPaths = sortImportsBy_ != 'names';
    this.nodes_ = sortAndMergeImportNodes(nodes_, byPaths, comparePaths, compareNames);
    this.scripts_ = sortAndMergeImportNodes(scripts_, true, comparePaths, compareNames);
    this.subGroups_?.forEach(g => g.sortAndMerge());
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
   * Infer flag (step 1) from current config (flag) and parent's flag.
   */
  private static inferFlag1(flag: Flag, parentFlag: Flag) {
    if (flag) return flag;
    return parentFlag && parentFlag !== 'all' ? parentFlag : undefined;
  }

  /**
   * Infer flag (step 2) from children's flags.
   */
  private static inferFlag2(flag1: Flag, subGroups?: SortGroup[]) {
    if (flag1) return flag1;
    const childrenFlag = subGroups
      ?.map(g => g.flag_)
      .reduce((a, b) => {
        assertNonNull(b);
        return !a || a === b ? b : 'all';
      }, undefined);
    return childrenFlag ?? 'named';
  }
}
