import ts, { SourceFile } from 'typescript';

import ExportNode from './ExportNode';
import ImportNode from './ImportNode';
import {
  Pos,
  RangeAndEmptyLines,
} from './types';

export default class ParseParams {
  readonly sourceFile: SourceFile;
  readonly sourceText: string;
  readonly allIds = new Set<string>();

  readonly importNodes: ImportNode[] = [];
  // If 'range' is undefined, insert imports before the first ImportNode.
  private importsInsertPoint_?: RangeAndEmptyLines;
  prevCommentEnd?: Pos;
  checkFileComments = true;

  readonly exportNodes: ExportNode[] = [];

  constructor(sourceFile: SourceFile, sourceText: string) {
    this.sourceFile = sourceFile;
    this.sourceText = sourceText;
    this.prevCommentEnd = shebangEnd(sourceFile, sourceText);
  }

  get importsInsertPoint() {
    return this.importsInsertPoint_;
  }

  addImport(node: ImportNode | undefined) {
    if (node) this.importNodes.push(node);
  }

  updateImportInsertPoint(range: RangeAndEmptyLines) {
    if (this.importsInsertPoint_) return;
    this.importsInsertPoint_ = range;
  }

  addExport(node: ExportNode | undefined) {
    if (node) this.exportNodes.push(node);
  }
}

function shebangEnd(sourceFile: SourceFile, sourceText: string) {
  const shebang = ts.getShebang(sourceText);
  if (!shebang) return undefined;
  const pos = shebang.length;
  return { pos, ...sourceFile.getLineAndCharacterOfPosition(pos) };
}
