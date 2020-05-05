// Global comment 1
/* 
 Global comment 2
  */

/// <dir />
import A from 'a';    /* Trailing 
comment 2
*/ /**
Trailing comment 3 */
// Leading comment 1
/*
   Leading comment 2
   */
/**
   Leading comment 3 */
import B from 'b';     // Trailing comment 1
// statement comment 1
import C from 'C'; /* statement comment 2 */

// ts-import-sorter: disable
/* Disable comment 1
 */ import X from 'x'  // Disable comment 2
// Head 1
export { A, B }; // Tail 1
// Head 2
export { C }; // Tail 2

// Head 3
export { D, E };  // Tail 3
// Disable comment 3
import Y from 'y' /* ts-import-sorter:
 disable */ // Disable comment 4
