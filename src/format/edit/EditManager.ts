import { ComposeConfig } from '../config';
import { RangeAndEmptyLines } from '../types';
import { Edit } from './types';

interface InsertText {
  text?: string;
  minLeadingNewLines?: number; // Min leading blank lines
  minTrailingNewLines?: number; // Min trailing blank lines
}

interface EditBlock extends InsertText {
  range: RangeAndEmptyLines;
}

interface RangeBlock extends RangeAndEmptyLines {
  inserts: EditBlock[];
  keep?: boolean; // Whether to keep texts already in the range.
}

export default class EditManager {
  private readonly ranges_: RangeBlock[];

  /**
   * Initialize the object with all the statements to delete.
   *
   * Internally, statements are converted to `RangeBlock`.
   * `RangeBlock`s will be sorted and merged if overlapping or consecutive.
   */
  constructor(statements: { range: RangeAndEmptyLines }[]) {
    const ranges = statements.map(s => s.range).sort((a, b) => a.fullStart.pos - b.fullStart.pos);
    this.ranges_ = merge(ranges).map(r => ({ ...r, inserts: [] }));
  }

  empty() {
    return this.ranges_.length < 1;
  }

  /**
   * Add an edit (insert/delete/replace) to the internal `RangeBlock`s.
   *
   * If it's within a `RangeBlock`, it will be added.
   *
   * Otherwise a new `RangeBlock` will be created to hold the edit.
   */
  insert(edit: EditBlock) {
    const { pos } = edit.range.fullStart;
    const target = { ...edit.range, inserts: [edit], keep: true };
    for (const [i, r] of this.ranges_.entries()) {
      const { fullStart: s, fullEnd: e } = r;
      if (pos < s.pos) {
        this.ranges_.splice(i, 0, target);
        return;
      } else if (pos <= e.pos) {
        r.inserts.push(edit);
        return;
      }
    }
    this.ranges_.push(target);
  }

  /**
   * Translate internal range blocks into `Edit`s.
   */
  generateEdits(config: ComposeConfig) {
    return this.ranges_.map(r => {
      const { keep, inserts } = r;
      const { text, minLeadingNewLines: ln, minTrailingNewLines: tn } = joinInserts(
        inserts,
        config,
      );
      return text
        ? keep
          ? decideInsert(text, r, config, ln, tn)
          : decideReplace(text, r, config, ln, tn)
        : decideDelete(r, config);
    });
  }
}

/**
 * Merge adjacent overlapping ranges into one.
 * Note `ranges` must be sorted by `fullStart`.
 */
function merge(ranges: RangeAndEmptyLines[]) {
  return ranges.reduce((r, c) => {
    if (!r.length) return [c];
    const last = r[r.length - 1];
    const { fullStart, end, trailingNewLines, fullEnd, eof } = c;
    if (last.end.pos >= fullStart.pos) {
      r[r.length - 1] = { ...last, end, trailingNewLines, fullEnd, eof };
      return r;
    } else return [...r, c];
  }, new Array<RangeAndEmptyLines>());
}

/**
 * Combine all insert edits into one, with respect to leading/trailing newlines for each insert.
 */
function joinInserts(inserts: EditBlock[], { nl }: ComposeConfig): EditBlock {
  if (inserts.length < 2) return inserts?.[0] ?? {};
  const t: string[] = [];
  inserts.reduce((a, b) => {
    if (a.text) {
      if (t.length < 1) t.push(a.text);
      if (b.text) {
        const n1 = decideNewLines(a.range.trailingNewLines, a.minTrailingNewLines);
        const n2 = decideNewLines(b.range.leadingNewLines, b.minLeadingNewLines);
        const n = Math.max(n1, n2);
        t.push(nl.repeat(n));
        t.push(b.text);
      }
    }
    return b;
  });
  const { minLeadingNewLines, range: r1 } = inserts[0];
  const { minTrailingNewLines, range: r2 } = inserts[inserts.length - 1];
  const { fullStart, leadingNewLines, start } = r1;
  const range = { ...r2, fullStart, start, leadingNewLines };
  return { text: t.join(''), minLeadingNewLines, minTrailingNewLines, range };
}

/**
 * Given existing and required minimum newlines, returns number of newlines after formatting.
 */
function decideNewLines(nl: number, min?: number) {
  return min === undefined ? normalize(min) : normalize(nl, 2);
}

/**
 * Normalize a number to be within [1, max].
 */
function normalize(n: number | undefined, max = Number.MAX_SAFE_INTEGER) {
  return Math.min(Math.max(n ?? 0, 1), max);
}

/**
 * Generate an `Edit` to insert `text` before `range`.
 * Any leading blank text (space/tab/newline) within `range` will be removed.
 *
 * If `minLeadingNewLines` or `minTrailingNewLines` are provided, or there were leading
 * newlines, extra newlines might be inserted.
 */
function decideInsert(
  text: string,
  range: RangeAndEmptyLines,
  { nl }: ComposeConfig,
  minLeadingNewLines?: number,
  minTrailingNewLines?: number,
): Edit {
  const { fullStart: start, start: end, leadingNewLines: lnl } = range;
  const ln = !start.pos ? 0 : decideNewLines(lnl, minLeadingNewLines);
  const tn = normalize(minTrailingNewLines);
  return { range: { start, end }, newText: nl.repeat(ln) + text + nl.repeat(tn) };
}

/**
 * Generate an `Edit` to replace the text within `range` with `text`.
 *
 * If `minLeadingNewLines` or `minTrailingNewLines` are provided, or there were leading/trailing
 * newlines, extra newlines might be inserted.
 */
function decideReplace(
  text: string,
  range: RangeAndEmptyLines,
  { nl, lastNewLine }: ComposeConfig,
  minLeadingNewLines?: number,
  minTrailingNewLines?: number,
): Edit {
  const {
    fullStart: start,
    fullEnd: end,
    leadingNewLines: lnl,
    trailingNewLines: tnl,
    eof,
  } = range;
  const ln = !start.pos ? 0 : decideNewLines(lnl, minLeadingNewLines);
  const tn = eof ? (lastNewLine ? 1 : 0) : decideNewLines(tnl, minTrailingNewLines);
  return { range: { start, end }, newText: nl.repeat(ln) + text + nl.repeat(tn) };
}

/**
 * Generate an `Edit` to delete the text within `range`.
 *
 * If there were leading/trailing newlines, extra newlines might be inserted.
 */
function decideDelete(range: RangeAndEmptyLines, { nl, lastNewLine }: ComposeConfig): Edit {
  const { fullStart: start, fullEnd: end, leadingNewLines: ln, trailingNewLines: tn, eof } = range;
  const n = !start.pos ? 0 : eof ? (lastNewLine ? 1 : 0) : normalize(ln + tn, 2);
  return { range: { start, end }, newText: nl.repeat(n) };
}
