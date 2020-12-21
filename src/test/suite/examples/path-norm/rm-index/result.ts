import '/';
import '/index/';
import '/index';
import 'index';
import 'index/';
import './';
import './index/';
import './index';
import '../';
import '../index/';
import '../index';

import A = require('/');
import B = require('/index/');
import BB = require('/index');
import C = require('index');
import D = require('index/');
import DD = require('index');
import E = require('./');
import F = require('./index/');
import FF = require('./index');
import G = require('../');
import H = require('../index/');
import HH = require('../index');

export { A, B, BB, C, D, DD, E, F, FF, G, H, HH };

export { a } from '/';
export { b } from '/index/';
export { bb } from '/index';
export { c, dd } from 'index';
export { d } from 'index/';
export { e } from './';
export { f } from './index/';
export { ff } from './index';
export { g } from '../';
export { h } from '../index/';
export { hh } from '../index';
