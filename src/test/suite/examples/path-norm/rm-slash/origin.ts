import '/'
import 'a/'
import './'
import '../'

import A = require( '/')
import B = require( 'a/')
import C = require( './')
import D = require( '../')

export { A, B, C, D };

export {a} from '/'
export {b} from 'a/'
export {c} from './'
export {d} from '../'
