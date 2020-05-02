import A, * as B from 'a';
import B, {
  C,
  D,
  E as F,
} from 'a';

export { b as default, default as c, a } from 'a';
export { A, B, C, D, F };
