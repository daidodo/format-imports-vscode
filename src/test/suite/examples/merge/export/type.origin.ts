export {A}
export type {B}
export type {C}

import type A from 'a'
import type {B} from 'a'
import * as D from 'a'
import type {C} from 'a'
import {E}from 'a'
import F from 'a'
import type A from 'a'

import type {default as G} from 'a'
import type {default as H} from 'b'

export {D, E,F, G}
export type  {H} 