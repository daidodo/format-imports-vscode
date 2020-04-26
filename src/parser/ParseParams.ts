import ts, { SourceFile } from 'typescript';

import ExportNode from './ExportNode';
import ImportNode from './ImportNode';
import {
  InsertNodeRange,
  Pos,
  RangeAndEmptyLines,
} from './types';

export default class ParseParams {
  private readonly sourceFile_: SourceFile;
  private readonly sourceText_: string;
  private readonly importNodes_: ImportNode[] = [];
  private readonly exportNodes_: ExportNode[] = [];
  // If 'range' is undefined, insert imports before the first ImportNode.
  private insertPoint_?: { range?: InsertNodeRange };
  prevCommentEnd?: Pos;
  checkFileComments = true;

  constructor(sourceFile: SourceFile, sourceText: string) {
    this.sourceFile_ = sourceFile;
    this.sourceText_ = sourceText;
    this.prevCommentEnd = shebangEnd(sourceFile, sourceText);
  }

  get sourceFile() {
    return this.sourceFile_;
  }

  get sourceText() {
    return this.sourceText_;
  }

  get importNodes() {
    return this.importNodes_;
  }

  get insertPoint() {
    return this.insertPoint_;
  }

  addImport(node: ImportNode | undefined) {
    if (node) this.importNodes_.push(node);
  }

  findInsertPointForImports(p: ParseParams, range: RangeAndEmptyLines, node?: ImportNode) {
    if (p.insertPoint_) return;
    const { fullStart, leadingNewLines, start } = range;
    p.insertPoint_ = node ? {} : { range: { fullStart, leadingNewLines, commentStart: start } };
  }
}

function shebangEnd(sourceFile: SourceFile, sourceText: string) {
  const shebang = ts.getShebang(sourceText);
  if (!shebang) return undefined;
  const pos = shebang.length;
  return { pos, ...sourceFile.getLineAndCharacterOfPosition(pos) };
}
