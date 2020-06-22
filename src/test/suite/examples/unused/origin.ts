import 'a';
import A, {B} from 'b';
import * as C from 'c';
import D = require('d');

import AA, {BB} from 'e';
import {FF, GG as HH} from 'e';
import * as CC from 'f';
import DD = require('g');
import {} from 'h'
import * as EE from 'i'; // comment 1
import {} from 'j'  // comment 2

export {A,B,C,D};