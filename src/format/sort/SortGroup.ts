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

export default class SortGroup {
  private readonly flag_: GroupRule['flag'];
  private readonly regex_: RegExp | undefined;
  private readonly sorter_: Sorter;
  private readonly subGroups_?: SortGroup[];
  private nodes_: ImportNode[] = []; // Fall-back group for non-script imports
  private scripts_: ImportNode[] = []; // Fall-back group for script imports

  constructor(rule: GroupRule, parentSorter?: Sorter) {
    const { flag, regex, sort, subGroups } = rule;
    const sortRules = sort === 'none' ? { paths: 'none' as const, names: 'none' as const } : sort;
    this.regex_ = regex || regex === '' ? RegExp(regex) : undefined;
    this.sorter_ = parentSorter
      ? updateSorterWithRules(parentSorter, sortRules)
      : sorterFromRules(sortRules);
    this.subGroups_ = subGroups
      ?.map(r => {
        if (typeof r === 'string') return flag === 'all' ? { regex: r } : { flag, regex: r };
        if (Array.isArray(r)) return flag === 'all' ? { subGroups: r } : { flag, subGroups: r };
        const f = r.flag ?? (flag === 'all' ? undefined : flag);
        return { ...r, flag: f };
      })
      .map(r => new SortGroup(r, this.sorter_));
    this.flag_ = flag ?? this.subGroups_?.map(g => g.flag_).reduce((r, f) => (r === f ? r : 'all'));
  }

  /**
   * @param node - The node to be added
   * @param fallBack - Whether to add node if this is a fall-back group
   * @returns Whether node is added to this group
   */
  add(node: ImportNode, fallBack = false) {
    const { isScript, moduleIdentifier } = node;
    if (this.flag_ === 'scripts' && !isScript) return false;
    if (!this.flag_ && isScript) return false;
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
    const { nodes_, scripts_, sorter_ } = this;
    const { comparePaths, compareNames } = sorter_;

    this.nodes_ = sortAndMergeImportNodes(nodes_, comparePaths, compareNames);
    this.scripts_ = sortAndMergeImportNodes(scripts_, comparePaths, compareNames);
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
}
