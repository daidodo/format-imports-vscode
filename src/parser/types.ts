import { LineAndCharacter } from 'typescript';

export interface NameBinding {
  propertyName?: string;
  aliasName?: string;
}

export interface Pos extends LineAndCharacter {
  pos: number;
}

export interface LineRange {
  start: Pos;
  end: Pos;
}

export interface NodeComment extends LineRange {
  text: string;
}

export interface RangeAndEmptyLines extends LineRange {
  fullStart: Pos;
  leadingEmptyLines: number;
}
