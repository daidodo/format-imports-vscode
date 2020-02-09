// Leading comment 1
import A from 'a'
import {B} from 'a' /* Trailing 
comment 1 */

/* Leading comment 2 */
import C from '@b' 
/* Leading comment 3 */
import {D} from '@b'

import {E} from './c'  // Trailing comment 2
import {F} from './c'  // Trailing comment 3

export {A,B,C,D,E,F}