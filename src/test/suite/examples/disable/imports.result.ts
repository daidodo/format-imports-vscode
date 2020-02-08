import X from 'x';

// This is NOT file comments.
//ts-import-sorter:disable
export { X };

import {D} from 'd';  /*   ts-import-sorter:
  disable
*/


// Other comments
import {C} from 'c';  //ts-import-sorter:disable


/*ts-import-sorter:disable*/
import B from 'b';


//    ts-import-sorter:     disable   
// Other comments
import A from 'a';