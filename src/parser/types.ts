import { LineAndCharacter } from 'typescript';

export type Binding =
  | {
      type: 'namespace';
      alias: string;
    }
  | {
      type: 'named';
      names: NameBinding[];
    };

export interface NameBinding {
  propertyName: string;
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
  leadingNewLines: number;
  trailingNewLines: number;
  fullEnd: Pos;
  eof: boolean;
}

export interface UnusedId {
  code: number;
  id?: string;
  pos: number;
}
