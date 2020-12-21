import '/index'
import '/index/'
import '/index/index'
import 'index'
import 'index/'
import 'index/index'
import './index'
import './index/'
import './index/index'
import '../index'
import '../index/'
import '../index/index'

import A = require('/index')
import B = require( '/index/')
import BB = require( '/index/index')
import C = require( 'index')
import D = require( 'index/')
import DD = require( 'index/index')
import E = require( './index')
import F = require( './index/')
import FF = require( './index/index')
import G = require( '../index')
import H = require( '../index/')
import HH = require( '../index/index')

export { A, B, BB, C, D, DD, E, F, FF, G, H, HH };

export {a} from '/index'
export {b} from '/index/'
export {bb} from '/index/index'
export {c} from 'index'
export {d} from 'index/'
export {dd} from 'index/index'
export {e} from './index'
export {f} from './index/'
export {ff} from './index/index'
export {g} from '../index'
export {h} from '../index/'
export {hh} from '../index/index'