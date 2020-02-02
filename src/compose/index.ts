import { Configuration } from '../config';
import {
  ImportNode,
  NameBinding,
  NodeComment,
} from '../parser';
import {
  assert,
  assertNonNull,
} from '../utils';

export interface ComposeConfig {
  maxLength: number;
  maxWords: { withDefault: number; withoutDefault: number; wrapped: number };
  tab: string;
  quote: (s: string) => string;
  comma: string;
  semi: string;
  bracket: (s: string) => string;
  lastNewLine: boolean;
  nl: string;
}

export default function composeInsertSource(
  groups: ImportNode[][],
  config: Configuration,
  leadingNewLines: number,
  trailingNewLines: number,
) {
  const c = configForCompose(config);
  const { nl } = c;
  const h = nl.repeat(leadingNewLines);
  const e = nl.repeat(trailingNewLines);
  const text = groups.map(g => g.map(n => n.compose(c)).join(nl)).join(nl + nl);
  return h + text + e;
}

export function composeNodeAsParts(
  parts: string[],
  from: string,
  extraLength: number,
  config: ComposeConfig,
) {
  const { maxLength, tab, nl } = config;
  const [first, ...rest] = parts;
  assert(!!first);
  let text = `import ${first}` + (rest.length ? ',' : '');
  const lines = [];
  rest.forEach((p, i, a) => {
    const c = i + 1 < a.length ? ',' : '';
    const n = `${text} ${p}${c}`;
    if (n.length >= maxLength) {
      lines.push(text);
      text = tab + p + c;
    } else text = n;
  });
  const n = `${text} ${from}`;
  if (n.length + extraLength >= maxLength) lines.push(text, tab + from);
  else lines.push(n);
  return lines.join(nl);
}

export function composeComments(comments: NodeComment[] | undefined, config: ComposeConfig) {
  const { nl } = config;
  if (!comments || !comments.length) return;
  return comments.map(c => c.text).join(nl) + nl;
}

export function composeNodeAsNames(
  defaultName: string | undefined,
  names: NameBinding[] | undefined,
  from: string,
  extraLength: number,
  config: ComposeConfig,
) {
  const { maxLength } = config;
  const { text, canWrap } = composeNodeAsNamesImpl(defaultName, names, from, config, false);
  if (maxLength > text.length + extraLength || !canWrap) return text;
  return composeNodeAsNamesImpl(defaultName, names, from, config, true).text;
}

function composeNodeAsNamesImpl(
  defaultName: string | undefined,
  names: NameBinding[] | undefined,
  from: string,
  config: ComposeConfig,
  forceWrap: boolean,
) {
  const { text, canWrap } = composeNames(!!defaultName, names, config, forceWrap);
  const all = [defaultName, text].filter(s => !!s).join(', ');
  return { text: `import ${all} ${from}`, canWrap };
}

function composeNames(
  hasDefault: boolean,
  names: NameBinding[] | undefined,
  config: ComposeConfig,
  forceWrap: boolean,
) {
  const { maxWords: mw, maxLength, bracket, nl } = config;
  const maxWords = hasDefault ? mw.withDefault - 1 : mw.withoutDefault;
  const words = names?.map(composeName).filter((w): w is string => !!w);
  if (!words || !words.length) return {};
  if (!forceWrap && words.length <= maxWords) {
    const text = bracket(words.join(', '));
    if (text.length < maxLength) return { text, canWrap: true };
  }
  const lines = [];
  for (let n = words; n.length; ) {
    const { text, left } = composeOneLineNames(n, config);
    lines.push(text);
    n = left;
  }
  return { text: `{${nl}${lines.join(nl)}${nl}}` };
}

function composeName(name: NameBinding | undefined) {
  if (!name) return;
  const { propertyName, aliasName } = name;
  if (propertyName) return aliasName ? `${propertyName} as ${aliasName}` : propertyName;
  assertNonNull(aliasName);
  return `* as ${aliasName}`;
}

function composeOneLineNames(words: string[], config: ComposeConfig) {
  assert(words.length > 0);
  const { tab, maxWords: mw, maxLength, comma } = config;
  const maxWords = mw.wrapped;
  const append = (t: string, n: string, s: boolean, e: boolean) =>
    t + (s ? '' : ' ') + n + (e ? comma : ',');
  const [first, ...rest] = words;
  let text = append(tab, first, true, !rest.length);
  for (let i = 0; i < rest.length; ++i) {
    const n = rest[i];
    const t = append(text, n, false, i + 1 >= rest.length);
    if (i + 2 > maxWords || t.length >= maxLength) return { text, left: rest.slice(i) };
    text = t;
  }
  return { text, left: [] };
}

function configForCompose(config: Configuration): ComposeConfig {
  const {
    tabType,
    tabSize,
    quoteMark,
    trailingComma,
    hasSemicolon,
    bracketSpacing,
    insertFinalNewline,
    eol,
  } = config;
  return {
    maxLength: config.maximumLineLength || Number.MAX_SAFE_INTEGER,
    maxWords: {
      withoutDefault: config.maximumBindingNamesPerLine || Number.MAX_SAFE_INTEGER,
      withDefault: config.maximumDefaultAndBindingNamesPerLine || Number.MAX_SAFE_INTEGER,
      wrapped: config.maximumNamesPerWrappedLine || Number.MAX_SAFE_INTEGER,
    },
    tab: tabType === 'tab' ? '\t' : ' '.repeat(tabSize ?? 2),
    quote: quoteMark === 'double' ? (s: string) => `"${s}"` : (s: string) => `'${s}'`,
    comma: trailingComma === 'none' ? '' : ',',
    semi: hasSemicolon === false ? '' : ';',
    bracket: bracketSpacing === false ? (s: string) => `{${s}}` : (s: string) => `{ ${s} }`,
    lastNewLine: !!insertFinalNewline,
    nl: eol === 'CRLF' ? '\r\n' : '\n',
  };
}
