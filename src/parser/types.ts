import {
  Identifier,
  LineAndCharacter,
} from 'typescript';

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

export function getNameBinding(specifier: {
  propertyName?: Identifier;
  name: Identifier;
}): NameBinding {
  const { text: name } = specifier.name;
  const prop = specifier.propertyName?.text;
  return prop && prop !== name ? { aliasName: name, propertyName: prop } : { propertyName: name };
}
