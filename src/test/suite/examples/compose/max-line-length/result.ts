import 'aaaaaaaa';   // comment
import 'aaaaaaaaaaaaaaaaaaaaa';

import A
  from 'aa';   //comment
import AAA from 'aaaaaaaaaaa';
import AA
  from 'aaaaaaaaaaaaa';
import {
  B,
} from 'bb';//commnt
import { BBB } from 'bbbbbbb';
import {
  BB,
} from 'bbbbbbbbb';
import C =
  require('cc');//cmmt
import CCC = require('ccccc');
import CC =
  require('ccccccc');
import * as D
  from 'dd'; //cmmt
import * as DDD from 'dddddd';
import * as DD
  from 'dddddddd';

export { A, AA, AAA, B, BBB };
export {
  aaaa,
  aaaaa,
  bbb,
} from 'a'; //cmt
export { a, b } from 'a';/*cmt
xxx*/

type X = C&CC&CCC&BB& D&DD&DDD;