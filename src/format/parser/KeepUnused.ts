import { KeepUnusedRule } from '../config';

interface Entry {
  path: RegExp;
  names?: RegExp[];
}

export default class KeepUnused {
  private readonly entries_: Entry[];

  constructor(rules: KeepUnusedRule[]) {
    this.entries_ = rules
      .map(e => (typeof e === 'string' ? { path: e } : e))
      .filter(e => e.path)
      .map(e => ({ path: new RegExp(e.path), names: e.names?.map(n => new RegExp(n)) }));
  }

  /**
   * Returns a function to determine if a name is kept for the path.
   * Or undefined if no names will be kept.
   */
  forPath(path: string) {
    const names = this.entries_.filter(e => e.path.test(path)).map(e => e.names);
    if (names.length < 1) return undefined;
    return (name: string) => names.some(n => !n || n.length < 1 || n.some(r => r.test(name)));
  }
}
