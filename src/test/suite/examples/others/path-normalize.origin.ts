import A from '.'
import B from './'
import C from '..'
import D from '../'
import E from './a/b/../c'
import F from './a/b/../c/'
import G from './a/b/./c'
import H from './a/b/./c/'
import I from 'a/b/./c'
import J from 'a/b/./c/'
import K from 'a/b/../c'
import L from 'a/b/../c/'



export { A, B, C, D, E, F, G, H, I, J, K, L }