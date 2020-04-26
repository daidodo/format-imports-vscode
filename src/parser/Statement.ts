import { composeComments } from '../compose';
import { ComposeConfig } from '../config';
import { assert } from '../utils';
import {
  NodeComment,
  RangeAndEmptyLines,
} from './types';

export default class Statement {
  readonly range: RangeAndEmptyLines;
  private leadingComments_?: NodeComment[];
  private trailingCommentsText_: string;

  protected constructor(
    range: RangeAndEmptyLines,
    leadingComments: NodeComment[] | undefined,
    trailingCommentsText: string,
  ) {
    this.range = range;
    this.leadingComments_ = leadingComments;
    this.trailingCommentsText_ = trailingCommentsText;
  }

  private get hasLeadingComments() {
    return !!this.leadingComments_ && this.leadingComments_.length > 0;
  }

  private get hasTrailingComments() {
    return !!this.trailingCommentsText_;
  }

  protected composeComments(config: ComposeConfig) {
    const leadingText = composeComments(this.leadingComments_, config) ?? '';
    return { leadingText, trailingText: this.trailingCommentsText_ };
  }

  protected canMerge(node: Statement) {
    return !(
      (this.hasLeadingComments && node.hasLeadingComments) ||
      (this.hasTrailingComments && node.hasTrailingComments)
    );
  }

  protected mergeComments(node: Statement) {
    assert(this.canMerge(node));
    if (!this.leadingComments_) this.leadingComments_ = node.leadingComments_;
    if (!this.trailingCommentsText_) this.trailingCommentsText_ = node.trailingCommentsText_;
    node.leadingComments_ = undefined;
    node.trailingCommentsText_ = '';
  }
}
