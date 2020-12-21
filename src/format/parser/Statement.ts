import { assert } from '../../common';
import { Configuration } from '../../config';
import { composeComments } from '../compose';
import { ComposeConfig } from '../config';
import {
  NodeComment,
  RangeAndEmptyLines,
} from '../types';

export interface StatementArgs {
  range: RangeAndEmptyLines;
  leadingComments?: NodeComment[];
  trailingCommentsText: string;
  config: Configuration;
}

export default class Statement {
  readonly range: RangeAndEmptyLines;
  private leadingComments_?: NodeComment[];
  private trailingCommentsText_: string;

  protected constructor(args: StatementArgs) {
    this.range = args.range;
    this.leadingComments_ = args.leadingComments;
    this.trailingCommentsText_ = args.trailingCommentsText;
  }

  withinDeclRange(pos: number) {
    const { start, end } = this.range;
    return start.pos <= pos && pos < end.pos;
  }

  private get hasLeadingComments() {
    return !!this.leadingComments_ && this.leadingComments_.length > 0;
  }

  private get hasTrailingComments() {
    return !!this.trailingCommentsText_;
  }

  protected composeComments(config: ComposeConfig) {
    const leadingText = composeComments(this.leadingComments_, config) ?? '';
    const trailingText = this.trailingCommentsText_;
    const tailingLength = trailingText.split(/\r?\n/)?.[0]?.length ?? 0;
    return { leadingText, trailingText, tailingLength };
  }

  protected canMergeComments(node: Statement) {
    return !(
      (this.hasLeadingComments && node.hasLeadingComments) ||
      (this.hasTrailingComments && node.hasTrailingComments)
    );
  }

  protected mergeComments(node: Statement) {
    assert(this.canMergeComments(node));
    if (!this.leadingComments_) this.leadingComments_ = node.leadingComments_;
    if (!this.trailingCommentsText_) this.trailingCommentsText_ = node.trailingCommentsText_;
    node.leadingComments_ = undefined;
    node.trailingCommentsText_ = '';
    return true;
  }
}
