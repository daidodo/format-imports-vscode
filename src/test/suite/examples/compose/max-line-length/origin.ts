import 'aaaaaaaa';   // comment
import 'aaaaaaaaaaaaaaaaaaaaa';

import AAA from 'aaaaaaaaaaa';
import AA from 'aaaaaaaaaaaaa';
import A from 'aa';   //comment
import type AAAA from 'aaaaa';
import type AAAA from 'aaaaaa';

import { BBB } from 'bbbbbbb';
import { BB } from 'bbbbbbbbb';
import { B } from 'bb';//commnt
import type { BBBB } from 'b';
import type { BBBB } from 'bb';

import CCC = require('ccccc');
import CC = require('ccccccc');
import C = require('cc');//cmmt

import * as DDD from 'dddddd';
import * as DD from 'dddddddd'; 
import * as D from 'dd'; //cmmt

export { A, AA, AAA, B, BBB };
export { aaaaa, bbb } from 'a';
export { aaaa } from 'a'; //cmt
export { a, b } from 'a';/*cmt
xxx*/
export type { a, b } from 'a';
export type { a, b } from 'aa';


type X = C & CC & CCC & BB & D & DD & DDD & AAAA & BBBB;