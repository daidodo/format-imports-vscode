import type { A, B, C } from 'a';
import type {
  D,
  E,
  F,
  G,
} from 'b';

export type { A, B };
type X =C&D&E&F&G
export type {
  AA,
  BB,
  CC,
} from 'a';
