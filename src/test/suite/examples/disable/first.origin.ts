'use strict'

import A from 'a' // ts-import-sorter: disable

import B from 'B';

export { B };

const C = 1;
/* ts-import-sorter: disable */
export {C}