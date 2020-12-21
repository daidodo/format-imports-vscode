import 'index'; // comment
import 'index'; // comment
import 'index/index'; // comment
import 'a/index'; // comment
import 'index/index/'; // comment
import '/'; // comment
import '/index'; // comment
import '/index/'; // comment
import '/index/index'; // comment
import '/a/index'; // comment
import '.'; // comment
import './index'; // comment
import './index/'; // comment
import './index/index'; // comment
import './a/index'; // comment
import '..'; // comment
import '../index'; // comment
import '../index/'; // comment
import '../index/index'; // comment
import '../a/index'; // comment
import 'a'; // comment
import 'a/index'; // comment
import './index'; // comment
import '../index'; // comment

import A = require('index'); // comment
import A = require('index'); // comment
import A = require('index/index'); // comment
import A = require('index/index/'); // comment
import A = require('/'); // comment
import A = require('/index'); // comment
import A = require('/index/'); // comment
import A = require('/index/index'); // comment
import A = require('.'); // comment
import A = require('./index'); // comment
import A = require('./index/'); // comment
import A = require('./index/index'); // comment
import A = require('..'); // comment
import A = require('../index'); // comment
import A = require('../index/'); // comment
import A = require('../index/index'); // comment
import A = require('a'); // comment
import A = require('a/index'); // comment
import A = require('./index'); // comment
import A = require('../index'); // comment

export { A };

export { B } from 'index'; // comment
export { B } from 'index'; // comment
export { B } from 'index/index'; // comment
export { B } from 'index/index/'; // comment
export { B } from '/'; // comment
export { B } from '/index'; // comment
export { B } from '/index/'; // comment
export { B } from '/index/index'; // comment
export { B } from '.'; // comment
export { B } from './index'; // comment
export { B } from './index/'; // comment
export { B } from './index/index'; // comment
export { B } from '..'; // comment
export { B } from '../index'; // comment
export { B } from '../index/'; // comment
export { B } from '../index/index'; // comment
export { B } from 'a'; // comment
export { B } from 'a/index'; // comment
export { B } from './index'; // comment
export { B } from '../index'; // comment
