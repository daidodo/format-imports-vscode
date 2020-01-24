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
  maxWords: number;
  tab: string;
  quote: (s: string) => string;
  comma: string;
  semi: string;
  lastNewLine: boolean;
}

export default function composeInsertSource(
  groups: ImportNode[][],
  config: Configuration,
  noFinalNewLine: boolean,
) {
  const c = configForCompose(config);
  return groups.length
    ? groups.map(g => g.map(n => n.compose(c)).join('\n') + '\n').join('\n') +
        (noFinalNewLine ? '' : '\n')
    : '';
}

export function composeNodeAsParts(parts: string[], from: string, config: ComposeConfig) {
  const { maxLength, tab } = config;
  const [first, ...rest] = parts;
  assert(first != undefined && first.length > 0);
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
  if (n.length >= maxLength) lines.push(text, tab + from);
  else lines.push(n);
  return lines.join('\n');
}

export function composeNodeAsNames(
  defaultName: string | undefined,
  names: NameBinding[] | undefined,
  from: string,
  config: ComposeConfig,
) {
  const { maxLength } = config;
  const { text, canWrap } = composeNodeAsNamesImpl(defaultName, names, from, config, false);
  if (maxLength > text.length || !canWrap) return text;
  return composeNodeAsNamesImpl(defaultName, names, from, config, true).text;
}

function composeNodeAsNamesImpl(
  defaultName: string | undefined,
  names: NameBinding[] | undefined,
  from: string,
  config: ComposeConfig,
  forceWrap: boolean,
) {
  const { text, canWrap } = composeNames(names, config, forceWrap);
  const all = [defaultName, text].filter(s => !!s).join(', ');
  return { text: `import ${all} ${from}`, canWrap };
}

export function composeNames(
  names: NameBinding[] | undefined,
  config: ComposeConfig,
  forceWrap: boolean,
) {
  const { maxWords, maxLength } = config;
  const words = names?.map(composeName).filter((w): w is string => !!w);
  if (!words || !words.length) return {};
  if (!forceWrap && words.length <= maxWords) {
    const text = `{ ${words.join(', ')} }`;
    if (text.length + 15 < maxLength) return { text, canWrap: true };
  }
  const lines = [];
  for (let n = words; n.length; ) {
    const { text, left } = composeOneLineNames(n, config);
    lines.push(text);
    n = left;
  }
  return { text: `{\n${lines.join('\n')}\n}` };
}

export function composeName(name: NameBinding | undefined) {
  if (!name) return;
  const { propertyName, aliasName } = name;
  if (propertyName) return aliasName ? `${propertyName} as ${aliasName}` : propertyName;
  assertNonNull(aliasName);
  return `* as ${aliasName}`;
}

export function composeComments(comments: NodeComment[] | undefined) {
  if (!comments || !comments.length) return;
  return comments.map(c => c.text).join('\n') + '\n';
}

function composeOneLineNames(words: string[], config: ComposeConfig) {
  assert(words.length > 0);
  const { tab, maxWords, maxLength, comma } = config;
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
  const { tabType, tabSize, quoteMark, trailingComma, hasSemicolon, insertFinalNewline } = config;
  return {
    maxLength: config.maximumLineLength ?? Number.MAX_SAFE_INTEGER,
    maxWords: config.maximumWordsPerLine ?? Number.MAX_SAFE_INTEGER,
    tab: tabType === 'tab' ? '\t' : ' '.repeat(tabSize ?? 2),
    quote: quoteMark === 'double' ? (s: string) => `"${s}"` : (s: string) => `'${s}'`,
    comma: trailingComma === 'none' ? '' : ',',
    semi: hasSemicolon === false ? '' : ';',
    lastNewLine: !!insertFinalNewline,
  };
}
