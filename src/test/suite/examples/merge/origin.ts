import "a"
import 'a'
import A from './b'
import {B} from '././b'
import {C} from './b/c/..'
import D = require('../c')
import * as E from './../c'
import F from '.././c'
import * as G './b'
import {H}from '../c'

export {A,B,C,D,E,F,G,H}