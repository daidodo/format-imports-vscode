import '/'; // comment
import '/index/'; // comment
import '/index/'; // comment
import '/a'; // comment
import 'index'; // comment
import 'index/'; // comment
import 'index'; // comment
import 'a'; // comment
import './'; // comment
import './index/'; // comment
import './index/'; // comment
import './a'; // comment
import '../'; // comment
import '../index/'; // comment
import '../index/'; // comment
import '../a'; // comment

import A = require('/');
import B = require('/index/');
import BB = require('/index/');
import C = require('index');
import D = require('index/');
import DD = require('index');
import E = require('./');
import F = require('./index/');
import FF = require('./index/');
import G = require('../');
import H = require('../index/');
import HH = require('../index/');

export { A, B, BB, C, D, DD, E, F, FF, G, H, HH };

export { a } from '/';
export { b, bb } from '/index/';
export { c, dd } from 'index';
export { d } from 'index/';
export { e } from './';
export { f, ff } from './index/';
export { g } from '../';
export { h, hh } from '../index/';
