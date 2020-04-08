import { SortRule } from '../config';

type Comparator = (a: number, b: number) => number;

export default class Segment {
  private rank_: number;
  private compare_: Comparator;

  constructor(id: SortRule[number], rank: number, map: Map<number, Segment>) {
    this.rank_ = rank;
    this.compare_ = this.init(id, map);
  }

  get compare() {
    return this.compare_;
  }

  get rank() {
    return this.rank_;
  }

  private init(id: SortRule[number], map: Map<number, Segment>): Comparator {
    const a = 'a'.charCodeAt(0);
    const z = 'z'.charCodeAt(0);
    const A = 'A'.charCodeAt(0);
    const Z = 'Z'.charCodeAt(0);
    switch (id) {
      case 'az':
        this.setMap(map, a, z);
        return (a, b) => a - b;
      case 'AZ':
        this.setMap(map, A, Z);
        return (a, b) => a - b;
      case '_':
        this.setMap(map, '['.charCodeAt(0), '`'.charCodeAt(0));
        return (a, b) => a - b;
      case 'Aa':
        this.setMap(map, A, Z);
        this.setMap(map, a, z);
        return (a, b) => a - b;
      case 'aA':
        this.setMap(map, A, Z);
        this.setMap(map, a, z);
        return (i, j) => {
          if (A <= i && i <= Z) i += z;
          if (A <= j && j <= Z) j += z;
          return i - j;
        };
    }
  }

  private setMap(map: Map<number, Segment>, a: number, b: number) {
    for (let i = a; i <= b; ++i) if (!map.has(i)) map.set(i, this);
  }
}
