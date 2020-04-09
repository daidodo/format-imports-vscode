import { SortRule } from '../config';

type Comparator = (a: number, b: number, c: boolean) => number;

export interface Params {
  map: Map<number, Segment>;
  mask?: number;
  sensitive?: boolean;
}

export default class Segment {
  private rank_: number;
  private compare_: Comparator;

  constructor(id: SortRule[number], rank: number, p: Params) {
    this.rank_ = rank;
    this.compare_ = this.init(id, p);
  }

  get compare() {
    return this.compare_;
  }

  get rank() {
    return this.rank_;
  }

  private init(id: SortRule[number], p: Params): Comparator {
    const a = 'a'.charCodeAt(0);
    const z = 'z'.charCodeAt(0);
    const A = 'A'.charCodeAt(0);
    const Z = 'Z'.charCodeAt(0);
    const lower = (i: number) => (A <= i && i <= Z ? i + a - A : i);
    switch (id) {
      case 'az':
        this.setP(p, a, z, 0b1, true);
        return (a, b) => a - b;
      case 'AZ':
        this.setP(p, A, Z, 0b10, true);
        return (a, b) => a - b;
      case '_':
        this.setP(p, '['.charCodeAt(0), '`'.charCodeAt(0), 0b100);
        return (a, b) => a - b;
      case 'Aa':
        this.setP(p, A, Z, 0b11, false);
        this.setP(p, a, z);
        return (i, j, c) => {
          const ii = lower(i) - lower(j);
          return !c ? ii : ii || i - j;
        };
      case 'aA':
        this.setP(p, A, Z, 0b11, false);
        this.setP(p, a, z);
        return (i, j, c) => {
          const ii = lower(i) - lower(j);
          return !c ? ii : ii || j - i;
        };
    }
  }

  private setP(p: Params, a: number, b: number, mask?: number, sensitive?: boolean) {
    const { map, mask: m } = p;
    for (let i = a; i <= b; ++i) if (!map.has(i)) map.set(i, this);
    if (mask) p.mask = mask | (m ?? 0);
    if (sensitive !== undefined && p.sensitive === undefined) p.sensitive = sensitive;
  }
}
