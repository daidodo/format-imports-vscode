import { ComposeConfig } from '../config';
import { RangeAndEmptyLines } from '../types';
import { Edit } from './types';

interface InsertText {
  text?: string;
  leadingNewLines?: number; // Min leading blank lines
  trailingNewLines?: number; // Min trailing blank lines
}

interface EditBlock extends InsertText {
  range: RangeAndEmptyLines;
}

interface RangeBlock extends RangeAndEmptyLines {
  inserts: InsertText[];
  keep?: boolean; // Whether to keep texts already in the range.
}

export default class EditManager {
  private readonly ranges_: RangeBlock[];

  constructor(statements: { range: RangeAndEmptyLines }[]) {
    const ranges = statements.map(s => s.range).sort((a, b) => a.fullStart.pos - b.fullStart.pos);
    this.ranges_ = merge(ranges).map(r => ({ ...r, inserts: [] }));
  }

  empty() {
    return this.ranges_.length < 1;
  }

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

  generateEdits(config: ComposeConfig) {
    return this.ranges_.map(r => {
      const { keep, inserts } = r;
      const { text, leadingNewLines: ln, trailingNewLines: tn } = joinInserts(inserts, config);
      return text
        ? keep
          ? decideInsert(text, r, config, ln, tn)
          : decideReplace(text, r, config, ln, tn)
        : decideDelete(r, config);
    });
  }
}

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

function joinInserts(inserts: InsertText[], { nl }: ComposeConfig) {
  if (inserts.length < 1) return {};
  if (inserts.length < 2) return inserts[0];
  const t: string[] = [];
  inserts.reduce((a, b) => {
    if (a.text) {
      if (t.length < 1) t.push(a.text);
      if (b.text) {
        const n = ensure(a.trailingNewLines, b.leadingNewLines);
        const m = Math.min(Math.max(n, 1), 2);
        t.push(nl.repeat(m));
        t.push(b.text);
      }
    }
    return b;
  });
  const { leadingNewLines } = inserts[0];
  const { trailingNewLines } = inserts[inserts.length - 1];
  return { text: t.join(''), leadingNewLines, trailingNewLines };
}

function ensure(...n: (number | undefined)[]) {
  const m = n.map(i => (i === undefined ? 0 : i));
  return Math.min(Math.max(Math.max(...m), 1), 2);
}

function decideInsert(
  text: string,
  range: RangeAndEmptyLines,
  { nl }: ComposeConfig,
  leadingNewLines?: number,
  trailingNewLines?: number,
): Edit {
  const { fullStart: start, start: end, leadingNewLines: lnl } = range;
  const ln = !start.pos ? 0 : ensure(lnl, leadingNewLines);
  const tn = ensure(trailingNewLines);
  return { range: { start, end }, newText: nl.repeat(ln) + text + nl.repeat(tn) };
}

function decideReplace(
  text: string,
  range: RangeAndEmptyLines,
  { nl, lastNewLine }: ComposeConfig,
  leadingNewLines?: number,
  trailingNewLines?: number,
): Edit {
  const {
    fullStart: start,
    fullEnd: end,
    leadingNewLines: lnl,
    trailingNewLines: tnl,
    eof,
  } = range;
  const ln = !start.pos ? 0 : ensure(leadingNewLines, lnl);
  const tn = eof ? (lastNewLine ? 1 : 0) : ensure(trailingNewLines, tnl);
  return { range: { start, end }, newText: nl.repeat(ln) + text + nl.repeat(tn) };
}

function decideDelete(range: RangeAndEmptyLines, { nl, lastNewLine }: ComposeConfig): Edit {
  const { fullStart: start, fullEnd: end, leadingNewLines: ln, trailingNewLines: tn, eof } = range;
  const n = !start.pos ? 0 : eof ? (lastNewLine ? 1 : 0) : ensure(ln + tn);
  return { range: { start, end }, newText: nl.repeat(n) };
}
