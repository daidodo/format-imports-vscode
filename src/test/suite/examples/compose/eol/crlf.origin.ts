export {A,B,C}
import 'a';
import A from 'b';
import {B, C} from './c';
import D, * as E from './e';
export {D,E,F}
import F = require('./d');