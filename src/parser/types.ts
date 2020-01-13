import {
  CommentRange,
  LineAndCharacter,
} from 'typescript';

export type NameBinding =
  | {
      propertyName: string;
      aliasName?: string;
    }
  | {
      aliasName: string;
    };

export interface LineRange {
  startLine: LineAndCharacter;
  endLine: LineAndCharacter;
}

export interface NodeComment extends LineRange {
  range: CommentRange;
  text: string;
}

export interface RangeAndEmptyLines extends LineRange {
  leadingEmptyLines: number;
  trailingEmptyLines: number;
}