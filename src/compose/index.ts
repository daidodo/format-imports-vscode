import { ComposeConfig } from '../config';
import {
  NameBinding,
  NodeComment,
} from '../parser';
import {
  assert,
  assertNonNull,
} from '../utils';

export function composeNodeAsParts(
  parts: string[],
  from: string,
  extraLength: number,
  { maxLength, tab, nl }: ComposeConfig,
) {
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
  if (n.length + extraLength > maxLength) lines.push(text, tab + from);
  else lines.push(n);
  return lines.join(nl);
}

export function composeComments(comments: NodeComment[] | undefined, { nl }: ComposeConfig) {
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
  if (maxLength >= text.length + extraLength || !canWrap) return text;
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
    if (text.length <= maxLength) return { text, canWrap: true };
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
  if (propertyName)
    return aliasName && aliasName !== propertyName
      ? `${propertyName} as ${aliasName}`
      : propertyName;
  assertNonNull(aliasName);
  return `* as ${aliasName}`;
}

function composeOneLineNames(
  words: string[],
  { tab, maxWords: mw, maxLength, comma }: ComposeConfig,
) {
  assert(words.length > 0);
  const maxWords = mw.wrapped;
  const append = (t: string, n: string, s: boolean, e: boolean) =>
    t + (s ? '' : ' ') + n + (e ? comma : ',');
  const [first, ...rest] = words;
  let text = append(tab, first, true, !rest.length);
  for (let i = 0; i < rest.length; ++i) {
    const n = rest[i];
    const t = append(text, n, false, i + 1 >= rest.length);
    if (i + 2 > maxWords || t.length > maxLength) return { text, left: rest.slice(i) };
    text = t;
  }
  return { text, left: [] };
}
