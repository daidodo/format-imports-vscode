/* eslint-disable @typescript-eslint/no-use-before-define */

import { SegSymbol } from '../../config';

type Comparator = (a: number, b: number, c: boolean) => number;

export interface Params {
  map: Map<number, Segment>;
  mask?: number;
  sensitive?: boolean;
}

export default class Segment {
  private rank_: number;
  private compare_: Comparator;

  constructor(id: SegSymbol, rank: number, p: Params) {
    this.rank_ = rank;
    this.compare_ = this.init(id, p);
  }

  get compare() {
    return this.compare_;
  }

  get rank() {
    return this.rank_;
  }

  private init(id: SegSymbol, p: Params): Comparator {
    const { a, z, A, Z } = G;
    switch (id) {
      case 'az':
        this.setP(p, a, z, 0b1, true);
        return COMPARE;
      case 'AZ':
        this.setP(p, A, Z, 0b10, true);
        return COMPARE;
      case '_':
        this.setP(p, '['.charCodeAt(0), '`'.charCodeAt(0), 0b100);
        return COMPARE;
      case 'Aa':
        this.setP(p, A, Z, 0b11, false);
        this.setP(p, a, z);
        return COMPARE_Aa;
      case 'aA':
        this.setP(p, A, Z, 0b11, false);
        this.setP(p, a, z);
        return COMPARE_aA;
    }
  }

  private setP(p: Params, a: number, b: number, mask?: number, sensitive?: boolean) {
    const { map, mask: m } = p;
    for (let i = a; i <= b; ++i) if (!map.has(i)) map.set(i, this);
    if (mask) p.mask = mask | (m ?? 0);
    if (sensitive !== undefined && p.sensitive === undefined) p.sensitive = sensitive;
  }
}

// The following global variables are used to avoid duplicated small objects,
// though they break 'no-use-before-define' and 'camelcase' rules from eslint.

const G = {
  a: 'a'.charCodeAt(0),
  z: 'z'.charCodeAt(0),
  A: 'A'.charCodeAt(0),
  Z: 'Z'.charCodeAt(0),
};

const LOWER = (i: number) => (G.A <= i && i <= G.Z ? i + G.a - G.A : i);

const COMPARE_Aa: Comparator = (i, j, c) => {
  const ii = LOWER(i) - LOWER(j);
  return !c ? ii : ii || i - j;
};

const COMPARE_aA: Comparator = (i, j, c) => {
  const ii = LOWER(i) - LOWER(j);
  return !c ? ii : ii || j - i;
};

const COMPARE: Comparator = (a, b) => a - b;
