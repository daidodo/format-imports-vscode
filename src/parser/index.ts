import {
  CommentRange,
  createSourceFile,
  getLeadingCommentRanges,
  getTrailingCommentRanges,
  ImportDeclaration,
  LineAndCharacter,
  Node,
  ScriptTarget,
  SourceFile,
  SyntaxKind,
  TextRange,
} from 'typescript';

interface LinesData {
  startLineAndCharacter: LineAndCharacter;
  endLineAndCharacter: LineAndCharacter;
}

interface CommentData extends LinesData {
  range: CommentRange;
}

interface CommentsData {
  leadingComments?: CommentData[];
  trailingComments?: CommentData[];
}

interface ImportData extends CommentsData {
  declaration: ImportDeclaration;
}

export class ImportParser {
  private sourceText_: string;
  private sourceFile_: SourceFile;
  private allIds_ = new Set();
  private importData_: ImportData[] = [];

  constructor(sourceText: string, fileName: string) {
    this.sourceText_ = sourceText;
    this.sourceFile_ = createSourceFile(fileName, sourceText, ScriptTarget.Latest);
    this.parseNode(this.sourceFile_);
  }

  private parseNode(node: Node) {
    const s = this.sourceFile_;
    const { kind } = node;
    if (kind === SyntaxKind.ImportDeclaration) {
      const comments = this.parseComments(node);
      const declaration = node as ImportDeclaration;
      this.importData_.push({ declaration, ...comments });
      return;
    } else if (kind === SyntaxKind.Identifier) {
      this.allIds_.add(node.getText(s));
    }
    node.forEachChild(this.parseNode.bind(this));
  }

  /**
   * Get start and end line numbers for a text range.
   */
  private parseLines(range: TextRange): LinesData {
    const s = this.sourceFile_;
    return {
      startLineAndCharacter: s.getLineAndCharacterOfPosition(range.pos),
      endLineAndCharacter: s.getLineAndCharacterOfPosition(range.end),
    };
  }

  /**
   * Get leading and tailing comments (if any) for a node.
   */
  private parseComments(node: Node): CommentsData {
    return {
      leadingComments: this.parseLeadingComments(node),
      trailingComments: getTrailingCommentRanges(this.sourceText_, node.getEnd())?.map(
        this.transformComment.bind(this),
      ),
    };
  }

  /**
   * Get leading comments (if any) for a node.
   * Adjustments when it is the first node of the file
   * where initial comments might be for the whole file,
   * e.g. author, copy rights, license.
   */
  private parseLeadingComments(node: Node) {
    const s = this.sourceFile_;
    const fullStart = node.getFullStart();
    const text = this.sourceText_;
    const comments = getLeadingCommentRanges(text, fullStart)?.map(
      this.transformComment.bind(this),
    );
    // Skip initial comments that separated by empty line(s) from the first import statement.
    if (fullStart === 0 && comments && comments.length > 0) {
      const results = [];
      let nextStartLine = s.getLineAndCharacterOfPosition(node.getStart(s)).line;
      for (let i = comments.length - 1; i >= 0; --i) {
        const comment = comments[i];
        if (comment.endLineAndCharacter.line + 1 < nextStartLine) return results.reverse();
        results.push(comment);
        nextStartLine = comment.startLineAndCharacter.line;
      }
    }
    return comments;
  }

  private transformComment(range: CommentRange): CommentData {
    return { range, ...this.parseLines(range) };
  }
}
