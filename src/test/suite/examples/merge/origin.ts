import "a"
import 'a'
import A from './b'
import {B} from '././b'
import {C} from './b/c/..'
import D = require('../c')
import DD = require('../c')
import F,* as E from './../c'
import F, {H} from '.././c'
import {K, I} from './d'
import * as G from './b'
import * as J from './d'

export {A,B,C,D,DD,E,F,G,H,I,J,K}