import { Pos } from '../types';

export interface Edit {
  range: {
    start: Pos;
    end: Pos;
  };
  newText?: string;
}
